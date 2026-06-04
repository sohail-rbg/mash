"use client";
import React, { useState, useEffect, useRef } from "react";
import { getFilteredIngredients, buildIngredientOptionsFromFoods } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FilterPanel from "./FilterPanel";
import ConfirmedSelection from "./ConfirmedSelect";
import SpinWheel from "./SpinWheel";
import SpinHero from "./commen/SpinHero";
import ModeRow from "./commen/ModeRow";
import ActionRow from "./commen/ActionRow";
import "./FoodSpin.css";
import IngredientDrawer from "./commen/IngredientDrawer";

export default function FoodSpin({
  initialFoods,
  isFiltered,
  mealTiming,
  baseParams,
  activeQueryString,
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [foods, setFoods] = useState(initialFoods || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("select-mode");
  const [selectedMode, setSelectedMode] = useState(null);
  const [ingredientsVisible, setIngredientsVisible] = useState(false);
  const [suggestedFood, setSuggestedFood] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [rejectedIds, setRejectedIds] = useState(new Set());
  const [currentQueryString, setCurrentQueryString] = useState(activeQueryString || baseParams);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterExpiry, setFilterExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [pulseModes, setPulseModes] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const wheelRef = useRef(null);
  const abortControllerRef = useRef(null);
  const spinTimeoutRef = useRef(null);

  // Dynamically derive the meal timing from the current filters
  const currentParams = new URLSearchParams(currentQueryString);
  const activeMealTiming =
    currentParams.get("mealTiming")?.toLowerCase() ||
    mealTiming?.toLowerCase() ||
    "lunch";

  // Diet type — filter params override session preference
  const rawDietType =
    currentParams.get("dietType") ||                          // from active filter
    session?.user?.questionnaire
      ?.find(q => q.questionId === "dietType")
      ?.answer?.[0] ||
    null;

  // Normalize: "vegetarian"→"veg", "non-vegetarian"→"non-veg"
  const activeDietType = rawDietType
    ? rawDietType.toLowerCase().trim()
        .replace(/^vegetarian$/, "veg")
        .replace(/^non-vegetarian$/, "non-veg")
        .replace(/^eggetarian$/, "eggitarian")
    : null;

  // Filter ingredients by both meal timing AND diet type
  const [commonIngredients, setCommonIngredients] = useState(
    getFilteredIngredients(activeMealTiming, activeDietType),
  );
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const remainingCount = Math.max(0, foods.length - rejectedIds.size);

  /* ── helpers ── */
  const resetSpinState = () => {
    setShowResult(false);
    setSuggestedFood(null);
    setFoods([]);
    setRejectedIds(new Set());
    setError(null);
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }
    if (wheelRef.current) {
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform = "rotate(0deg)";
    }
  };

  const getNewSuggestion = (
    currentFoods = foods,
    currentRejected = rejectedIds,
  ) => {
    let available = currentFoods.filter((f) => !currentRejected.has(f._id));
    if (available.length === 0 && currentFoods.length > 0) {
      setRejectedIds(new Set());
      available = [...currentFoods];
    }
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  /* ── effects ── */
  useEffect(() => {
    if (initialFoods) {
      setFoods(initialFoods);
      setError(
        isFiltered && initialFoods.length === 0
          ? "No food items found. Try changing your filters!"
          : null,
      );
    }
  }, [initialFoods, isFiltered]);

  useEffect(() => {
    const expiryCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("temp_filters_expires="));

    if (!expiryCookie) return;

    const expiryTime = Number(expiryCookie.split("=")[1]);
    if (!expiryTime || expiryTime <= Date.now()) {
      document.cookie = "temp_filters=; path=/; max-age=0";
      document.cookie = "temp_filters_expires=; path=/; max-age=0";
      return;
    }

    setFilterExpiry(expiryTime);
    setTimeLeft(Math.ceil((expiryTime - Date.now()) / 1000));
  }, []);

  useEffect(() => {
    if (activeQueryString !== undefined && activeQueryString !== null) {
      setCurrentQueryString(activeQueryString || baseParams);
    }
  }, [activeQueryString, baseParams]);

  useEffect(() => {
    if (selectedMode) {
      const selectedIngredients =
        selectedMode === "self-cooking"
          ? Object.keys(checkedIngredients).filter((k) => checkedIngredients[k])
          : [];
      fetchFoodsForMode(selectedMode, selectedIngredients);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQueryString, selectedMode]);

  useEffect(() => {
    const controller = new AbortController();
    const loadIngredients = async () => {
      setIngredientsLoading(true);
      try {
        const params = new URLSearchParams(currentQueryString || "");
        params.delete("page");
        params.delete("limit");
        params.delete("details");
        params.set("fullImage", "true");
        params.set("limit", "200");
        params.set("mealTiming", activeMealTiming);
        if (activeDietType) params.set("dietType", activeDietType);

        const response = await fetch(`/api/foods?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load ingredient options");
        const data = await response.json();
        const foodsForIngredients = Array.isArray(data) ? data : data.foods || [];
        const ingredients = buildIngredientOptionsFromFoods(foodsForIngredients);

        setCommonIngredients(
          ingredients.length > 0
            ? ingredients
            : getFilteredIngredients(activeMealTiming, activeDietType),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setCommonIngredients(getFilteredIngredients(activeMealTiming, activeDietType));
        }
      } finally {
        if (!controller.signal.aborted) setIngredientsLoading(false);
      }
    };

    loadIngredients();
    return () => controller.abort();
  }, [currentQueryString, activeMealTiming, activeDietType]);
   // Stop spinning if mode changes during spin
  useEffect(() => {
    if (spinning) {
      setSpinning(false);
      setShowResult(false);
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
      if (wheelRef.current) {
        wheelRef.current.style.transition = "none";
        wheelRef.current.style.transform = "rotate(0deg)";
      }
    }
  }, [selectedMode]);

  useEffect(() => {
    if (foods?.length > 0) {
      if (!suggestedFood) setSuggestedFood(getNewSuggestion(foods));
      setShowResult(false);
    }
  }, [foods]);

  useEffect(() => {
    if (!filterExpiry) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((filterExpiry - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(interval);
        setFilterExpiry(null);
        setTimeLeft(null);
        setCurrentQueryString(baseParams);
        document.cookie = "temp_filters=; path=/; max-age=0";
        document.cookie = "temp_filters_expires=; path=/; max-age=0";
        setFoods([]);
        setSuggestedFood(null);
        setShowResult(false);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [filterExpiry, baseParams]);

  // Reset checked ingredients if the meal timing OR diet type changes via filters
  useEffect(() => {
    setCheckedIngredients({});
  }, [activeMealTiming, activeDietType]);

  // Clear all filters when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      clearFilters();
      setSelectedMode(null);
      setPhase("select-mode");
      setSuggestedFood(null);
      setShowResult(false);
      setCheckedIngredients({});
      setRejectedIds(new Set());
    }
  }, [status]);

  /* ── API ── */
  const fetchFoodsForMode = async (mode, ingredients = []) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams(currentQueryString);
    if (params.get("restrictedIngredients") === "no-allergies")
      params.delete("restrictedIngredients");
    params.set("foodType", mode);
    // Ensure images are fetched when mode or ingredients change
    params.set("fullImage", "true");
    if (ingredients.length > 0)
      params.set("ingredients", ingredients.join(","));

    try {
      const queryString = params.toString();
      console.log("[FoodSpin] Fetching /api/foods?" + queryString);
      const res = await fetch(`/api/foods?${queryString}`, {
        signal: abortControllerRef.current.signal,
      });
      if (!res.ok) throw new Error(`Failed to fetch food: ${res.statusText}`);
      const data = await res.json();
      console.log("[FoodSpin] fetched", data.length, "foods");
      if (data.length === 0) {
        const hasSelectedIngredients = ingredients.length > 0;
        setError(
          hasSelectedIngredients
            ? "No foods found for the selected ingredient(s). Try another ingredient or meal timing."
            : "No food found. Try changing filters."
        );
        setFoods([]);
        return [];
      }
      setFoods(data);
      return data;
    } catch (err) {
      if (err.name === "AbortError") {
        return [];
      }
      setError(err.message);
      setFoods([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /* ── handlers ── */
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleModeSelect = async (mode) => {
    // If guest clicks a mode, send them to login
    if (status === "unauthenticated") {
      showToast("Please login to choose a mode! 🔐");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    if (selectedMode === mode) {
      if (mode === "self-cooking") setIngredientsVisible(true);
      resetSpinState();
      return;
    }
    setShowResult(false);
    setError(null);
    setCheckedIngredients({});
    setRejectedIds(new Set());
    setSelectedMode(mode);
    if (mode === "self-cooking") setIngredientsVisible(true);
    if (wheelRef.current) {
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform = "rotate(0deg)";
    }
    setFoods([]);
    setSuggestedFood(null);
  };

  const handleCenterClick = () => {
    if (status === "unauthenticated") {
      showToast("Login to start spinning! 🎡");
      setTimeout(() => router.push("/login"), 1500);
    } else if (status === "authenticated" && !selectedMode) {
      showToast("Please select a mode above! 👆");
      setPulseModes(true);
      setTimeout(() => setPulseModes(false), 1500);
    }
    // If authenticated, we allow the user to select a mode via ModeRow buttons
  };

  const toggleIngredient = (id) => {
    setCheckedIngredients((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const selectedIngredients = Object.keys(next).filter((k) => next[k]);
      if (selectedMode === "self-cooking") {
        fetchFoodsForMode(selectedMode, selectedIngredients);
      }
      return next;
    });
    setFoods([]);
    resetSpinState();
  };

  const handleIngredientsApply = async () => {
    setIngredientsVisible(false);
    const selectedIngredients = Object.keys(checkedIngredients).filter(
      (k) => checkedIngredients[k],
    );
    await fetchFoodsForMode(selectedMode, selectedIngredients);
  };

  const handleFilterApply = (newParams, expiryTime) => {
    // If the user applied an empty filter set explicitly, preserve empty string
    // so defaults from session/questionnaire are not re-applied automatically.
    setCurrentQueryString(newParams === "" ? "" : newParams || baseParams);
    setFiltersVisible(false);
    setFoods([]);
    setRejectedIds(new Set());
    setSuggestedFood(null);
    setShowResult(false);
    setError(null);
    if (expiryTime) {
      setFilterExpiry(expiryTime);
      setTimeLeft(Math.ceil((expiryTime - Date.now()) / 1000));
    } else {
      setFilterExpiry(null);
      setTimeLeft(null);
    }
  };

  const toggleFiltersVisible = () => {
    setFiltersVisible((prev) => !prev);
  };

  const getGradientColors = () => {
    if (selectedMode === "online") {
      return { start: "rgb(239, 68, 68)", end: "rgb(249, 115, 22)" }; // Red to Orange
    } else if (selectedMode === "self-cooking") {
      return { start: "rgb(34, 197, 94)", end: "rgb(22, 163, 74)" }; // Green to Darker Green
    }
    return { start: "rgb(0, 183, 255)", end: "rgb(255, 48, 255)" }; // Default Blue to Pink
  };

  const isReadyToSpin =
    selectedMode &&
    !spinning &&
    !loading &&
    !(
      selectedMode === "self-cooking" &&
      Object.values(checkedIngredients).filter(Boolean).length === 0 &&
      foods.length === 0
    );

  const clearFilters = () => {
    setFilterExpiry(null);
    setTimeLeft(null);
    setCurrentQueryString(baseParams);
    setFiltersVisible(false);
    setRejectedIds(new Set());
    setIngredientsVisible(false);
    document.cookie = "temp_filters=; path=/; max-age=0";
    document.cookie = "temp_filters_expires=; path=/; max-age=0";
    setFoods([]);
    setSuggestedFood(null);
    setShowResult(false);
  };

  const startSpin = async (providedRejected = null) => {
    if (spinning || loading || !selectedMode) return;
    setFiltersVisible(false);
    const activeRejected =
      providedRejected && typeof providedRejected.has === "function"
        ? providedRejected
        : rejectedIds;

    let currentFoods = foods;
    if (foods.length === 0) {
      const selectedIngredients = Object.keys(checkedIngredients).filter(
        (k) => checkedIngredients[k],
      );
      currentFoods = await fetchFoodsForMode(selectedMode, selectedIngredients);
    }
    if (!currentFoods || currentFoods.length === 0) return;

    const nextFood = getNewSuggestion(currentFoods, activeRejected);
    setSuggestedFood(nextFood);
    setSpinning(true);
    setShowResult(false);

    const extraSpins = 4 + Math.floor(Math.random() * 5);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = extraSpins * 360 + randomAngle;

    if (wheelRef.current) {
      wheelRef.current.style.transition =
        "transform 4.5s cubic-bezier(0.25,0.1,0.25,1)";
      wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;
    }
    spinTimeoutRef.current = setTimeout(() => {
      setSpinning(false);
      setShowResult(true);
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = "none";
          wheelRef.current.style.transform = `rotate(${randomAngle}deg)`;
        }
      }, 100);
    }, 4600);
  };

  const handleReject = () => {
    if (!suggestedFood) return;
    const nextRejected = new Set(rejectedIds);
    nextRejected.add(suggestedFood._id);
    setRejectedIds(nextRejected);
    setShowResult(false);
    startSpin(nextRejected);
  };

  const handleReset = () => {
    setPhase("select-mode");
    setSelectedMode(null);
    setShowResult(false);
    setFoods([]);
    setSuggestedFood(null);
  };

  const handleConfirm = () => {
    if (!suggestedFood) return;
    setPhase("confirmed");
  };

  /* ── confirmed phase ── */
  if (phase === "confirmed") {
    return (
      <ConfirmedSelection
        suggestedFood={suggestedFood}
        selectedMode={selectedMode}
        onRestart={handleReset}
        onConfirm={handleConfirm}
      />
    );
  }

  /* ── main spin UI ── */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
          @keyframes toast-slide-in {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 20px); opacity: 1; }
          }
          /* Responsive Toast Container */
          .toast-container {
            position: fixed; top: 0; left: 50%; z-index: 9999;
            padding: 10px 20px; /* Slightly reduced padding for mobile */
            border-radius: 16px;
            background: #f97316; color: white; font-weight: 800;
            max-width: calc(100% - 40px); /* Max width 100% minus 20px on each side */
            width: fit-content; /* Adjust width to content */
            box-shadow: 0 10px 40px rgba(249, 115, 22, 0.4);
            border: 1px solid rgba(255,255,255,0.2);
            animation: toast-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes mode-attention-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); border-color: #f97316; box-shadow: 0 0 15px rgba(249, 115, 22, 0.4); }
            100% { transform: scale(1); }
          }
          .pulse-active .mode-pill {
            animation: mode-attention-pulse 0.5s ease-in-out 3;
          }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
      ` }} />

      {toast.show && (
        <div className="toast-container text-xs sm:text-[11px] uppercase tracking-[0.1em] flex items-center gap-2">
          <span className="text-lg">👋</span> {toast.message}
        </div>
      )}

      <div
        className={`food-engine-card w-full px-3 sm:px-5 py-4 sm:py-5 flex flex-col transition-all duration-700 ${isReadyToSpin ? "pulse-ready" : ""}`}
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "auto",
          "--gradient-start": getGradientColors().start,
          "--gradient-end": getGradientColors().end,
        }}
      >
        <div
          className={`relative z-10 flex flex-col gap-1 transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}
        >
          {/* ── Hero ── */}
          <SpinHero
            timeLeft={timeLeft}
            onClearFilters={clearFilters}
            onOpenFilters={() => setFiltersVisible(true)}
          />

          {/* glass divider */}
          <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent my-3" />

          {/* ── Mode selector ── */}
          <ModeRow
            selectedMode={selectedMode}
            showResult={showResult}
            suggestedFood={suggestedFood}
            spinning={spinning}
            onModeSelect={handleModeSelect}
            pulseModes={pulseModes}
          />

          {/* ── Spin Wheel ── */}
          <div className="w-full flex items-center justify-center">
            <SpinWheel
              ref={wheelRef}
              showResult={showResult}
              suggestedFood={suggestedFood}
              selectedMode={selectedMode}
              spinning={spinning}
              pulseModes={pulseModes}
              onCenterClick={handleCenterClick}
              onSpin={startSpin}
              loading={loading}
              disabled={
                selectedMode === "self-cooking" &&
                Object.values(checkedIngredients).filter(Boolean).length === 0 &&
                foods.length === 0
              }
            />
          </div>

          {/* ── Action Row / Status ── */}
          <ActionRow
            showResult={showResult}
            suggestedFood={suggestedFood}
            spinning={spinning}
            onReject={handleReject}
            onConfirm={() => setPhase("confirmed")}
            foods={foods}
            error={error}
            loading={loading}
            selectedMode={selectedMode}
            checkedIngredients={checkedIngredients}
            remainingCount={remainingCount}
          />
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {filtersVisible && (
        <FilterPanel
          currentParams={currentQueryString}
          baseParams={baseParams}
          onApply={handleFilterApply}
          onClose={() => setFiltersVisible(false)}
        />
      )}

      {/* ── Ingredient Drawer ── */}
      <IngredientDrawer
        visible={ingredientsVisible}
        onClose={() => setIngredientsVisible(false)}
        ingredients={commonIngredients}
        activeMealTiming={activeMealTiming}
        checkedIngredients={checkedIngredients}
        onToggle={toggleIngredient}
        onApply={handleIngredientsApply}
        error={error}
      />
    </>
  );
}
