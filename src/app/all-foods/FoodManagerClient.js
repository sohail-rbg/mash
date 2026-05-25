"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MEAL_TIMINGS = [
  { value: "all",        label: "All",        emoji: "🍽️" },
  { value: "breakfast",  label: "Breakfast",  emoji: "🌅" },
  { value: "lunch",      label: "Lunch",      emoji: "☀️" },
  { value: "snacks",     label: "Snacks",     emoji: "🍿" },
  { value: "dinner",     label: "Dinner",     emoji: "🌙" },
  { value: "late-night", label: "Late Night", emoji: "🌃" },
];

const FOOD_TYPES = [
  { value: "all",          label: "All Types",  emoji: "🍽️" },
  { value: "online",       label: "Online",     emoji: "🛵" },
  { value: "self-cooking", label: "Self Cook",  emoji: "🍳" },
];

const DIET_META = {
  "veg":     { icon: "🌱", bg: "rgba(34,197,94,0.18)",  border: "rgba(34,197,94,0.5)",  text: "#22c55e" },
  "vegan":   { icon: "🌿", bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.5)", text: "#10b981" },
  "jain":    { icon: "🪷", bg: "rgba(234,179,8,0.18)",  border: "rgba(234,179,8,0.5)",  text: "#eab308" },
  "keto":    { icon: "🥑", bg: "rgba(132,204,22,0.18)", border: "rgba(132,204,22,0.5)", text: "#84cc16" },
  "non-veg": { icon: "🍖", bg: "rgba(239,68,68,0.18)",  border: "rgba(239,68,68,0.55)", text: "#ef4444" },
};

function getDietMeta(diet) {
  return DIET_META[diet?.toLowerCase()] || {
    icon: "🍽️", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", text: "rgba(255,255,255,0.5)",
  };
}

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20, padding: "16px 20px",
      display: "flex", gap: 16, alignItems: "center",
    }}>
      <div style={{ width: 130, height: 110, borderRadius: 14, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} className="animate-pulse" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 18, width: "55%", borderRadius: 6, background: "rgba(255,255,255,0.07)" }} className="animate-pulse" />
        <div style={{ height: 11, width: "30%", borderRadius: 6, background: "rgba(255,255,255,0.05)" }} className="animate-pulse" />
        <div style={{ height: 10, width: "80%", borderRadius: 6, background: "rgba(255,255,255,0.04)" }} className="animate-pulse" />
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {[60, 50, 70].map((w, i) => (
            <div key={i} style={{ height: 18, width: w, borderRadius: 999, background: "rgba(255,255,255,0.05)" }} className="animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FoodManagerClient({
  initialFoods,
  totalPages: initialTotalPages,
  currentPage,
  totalCount: initialTotalCount,
}) {
  const [foods, setFoods]               = useState(initialFoods);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeMeal, setActiveMeal]     = useState("all");
  const [activeFoodType, setActiveFoodType] = useState("all");
  const [activeHealthGoal, setActiveHealthGoal] = useState(null);
  const [mealLoading, setMealLoading]   = useState(false);
  const [totalPages, setTotalPages]     = useState(initialTotalPages);
  const [totalCount, setTotalCount]     = useState(initialTotalCount);
  const [filteredPage, setFilteredPage] = useState(1);
  const [search, setSearch]             = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null); // null = not in search mode
  const searchTimerRef = useRef(null);
  // mealTimingStats: { breakfast: { count, duplicates: ["Dal Chawal", ...] }, ... }
  const [mealTimingStats, setMealTimingStats] = useState({});

  const router       = useRouter();
  const searchParams = useSearchParams();
  const highlightId  = searchParams.get("highlight");
  const highlightRef = useRef(null);
  const urlHealthGoal = searchParams.get("healthGoals");

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      const t = setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [highlightId, foods]);

  // If URL contains a healthGoals param, fetch filtered results
  useEffect(() => {
    if (urlHealthGoal) {
      const g = urlHealthGoal;
      setActiveHealthGoal(g);
      // fetch filtered by health goal
      (async () => {
        setMealLoading(true);
        try {
          const params = new URLSearchParams({ fullImage: "true", limit: "20", page: "1", healthGoals: g });
          const res = await fetch(`/api/foods?${params.toString()}`);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          setFoods(data.foods || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
          setFilteredPage(1);
        } catch (err) {
          console.error(err);
        } finally {
          setMealLoading(false);
        }
      })();
    }
  }, [urlHealthGoal]);

  // Fetch meal timing stats (counts + duplicate detection) once on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const timings = ["breakfast", "lunch", "snacks", "dinner", "late-night"];
        const results = await Promise.all(
          timings.map(async (t) => {
            const res = await fetch(`/api/foods?mealTiming=${t}&limit=200`);
            if (!res.ok) return { timing: t, count: 0, duplicates: [] };
            const data = await res.json();
            const foods = Array.isArray(data) ? data : (data.foods || []);
            // Find duplicate names (case-insensitive)
            const nameCount = {};
            foods.forEach(f => {
              const key = f.name?.toLowerCase().trim();
              if (key) nameCount[key] = (nameCount[key] || 0) + 1;
            });
            const duplicates = Object.entries(nameCount)
              .filter(([, c]) => c > 1)
              .map(([name]) => name);
            return { timing: t, count: foods.length, duplicates };
          })
        );
        const stats = {};
        results.forEach(r => { stats[r.timing] = { count: r.count, duplicates: r.duplicates }; });
        setMealTimingStats(stats);
      } catch (err) {
        console.error("Stats fetch failed:", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeMeal === "all") {
      setFoods(initialFoods);
      setTotalPages(initialTotalPages);
      setTotalCount(initialTotalCount);
      setIsNavigating(false);
    }
  }, [initialFoods, initialTotalPages, initialTotalCount, activeMeal]);

  const fetchByMeal = async (meal, foodType = "all", page = 1) => {
    setMealLoading(true);
    setSearch("");
    setActiveHealthGoal(null);
    try {
      const params = new URLSearchParams({ limit: "20", page: String(page), fullImage: "true" });
      if (meal !== "all")     params.set("mealTiming", meal);
      if (foodType !== "all") params.set("foodType", foodType);
      const res  = await fetch(`/api/foods?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFoods(data.foods || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setFilteredPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setMealLoading(false);
    }
  };

  // ── API search across ALL foods ──
  const fetchBySearch = async (query) => {
    if (!query.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({ search: query, fullImage: "true", limit: "50" });
      const res  = await fetch(`/api/foods?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      // data is a flat array (no pagination) since no ?page param
      setSearchResults(Array.isArray(data) ? data : (data.foods || []));
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search — fire 350ms after user stops typing
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }
    searchTimerRef.current = setTimeout(() => fetchBySearch(search), 350);
    return () => clearTimeout(searchTimerRef.current);
  }, [search]);

  const handleMealFilter = (meal) => {    setActiveMeal(meal);
    setFilteredPage(1);
    if (meal === "all") setActiveFoodType("all"); // reset type when clearing meal
    if (meal === "all" && activeFoodType === "all") {
      setFoods(initialFoods);
      setTotalPages(initialTotalPages);
      setTotalCount(initialTotalCount);
    } else {
      fetchByMeal(meal, meal === "all" ? "all" : activeFoodType, 1);
    }
  };

  const handleFoodTypeFilter = (foodType) => {
    setActiveFoodType(foodType);
    setFilteredPage(1);
    if (activeMeal === "all" && foodType === "all") {
      setFoods(initialFoods);
      setTotalPages(initialTotalPages);
      setTotalCount(initialTotalCount);
    } else {
      fetchByMeal(activeMeal, foodType, 1);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this food permanently?")) return;
    try {
      const res = await fetch(`/api/foods?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFoods(prev => prev.filter(f => f._id !== id));
        setTotalCount(c => c - 1);
      } else {
        alert("Failed to delete.");
      }
    } catch {
      alert("Error deleting food.");
    }
  };

  const handlePageChange = (newPage) => {
    if (activeMeal !== "all" || activeFoodType !== "all") {
      fetchByMeal(activeMeal, activeFoodType, newPage);
    } else {
      setIsNavigating(true);
      router.push(`/all-foods?page=${newPage}`);
    }
  };

  const displayPage  = activeMeal !== "all" ? filteredPage : currentPage;
  // When searching: use API results. Otherwise: use current page foods.
  const filteredFoods = searchResults !== null ? searchResults : foods;

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fm-card {
          animation: cardIn 0.35s ease both;
          transition: background 0.22s ease, border-color 0.22s ease,
                      box-shadow 0.22s ease, transform 0.22s ease;
        }
        .fm-card:hover {
          background: rgba(255,255,255,0.075) !important;
          border-color: rgba(255,255,255,0.18) !important;
          box-shadow: 0 20px 56px rgba(0,0,0,0.55),
                      inset 0 1px 0 rgba(255,255,255,0.14) !important;
          transform: translateY(-2px);
        }
        .fm-img-wrap { overflow: hidden; }
        .fm-img-wrap img { transition: transform 0.4s ease; }
        .fm-card:hover .fm-img-wrap img { transform: scale(1.06); }

        .fm-filter-btn { transition: all 0.18s ease; }
        .fm-filter-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.15); }

        .fm-edit-btn, .fm-del-btn { transition: all 0.18s ease; }
        .fm-edit-btn:hover {
          background: #3b82f6 !important; color: #fff !important;
          box-shadow: 0 4px 18px rgba(59,130,246,0.45);
          transform: translateY(-1px);
        }
        .fm-del-btn:hover {
          background: #ef4444 !important; color: #fff !important;
          box-shadow: 0 4px 18px rgba(239,68,68,0.45);
          transform: translateY(-1px);
        }
        .fm-search:focus { outline: none; border-color: rgba(255,255,255,0.22) !important; }
        .fm-add-btn { transition: all 0.2s ease; }
        .fm-add-btn:hover {
          background: rgba(34,197,94,0.28) !important;
          box-shadow: 0 6px 20px rgba(34,197,94,0.3);
          transform: translateY(-1px);
        }
        .fm-page-btn { transition: all 0.18s ease; }
        .fm-page-btn:hover:not(:disabled) { filter: brightness(1.2); transform: translateY(-1px); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Top bar: search + add ── */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
            <span style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: "rgba(255,255,255,0.25)", pointerEvents: "none",
            }}>🔍</span>
            <input
              className="fm-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, category…"
              style={{
                width: "100%", padding: "9px 12px 9px 34px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12, color: "#fff", fontSize: 13,
                backdropFilter: "blur(12px)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "rgba(255,255,255,0.3)",
                  cursor: "pointer", fontSize: 14, lineHeight: 1,
                }}
              >✕</button>
            )}
          </div>

          {/* Add food */}
          <button
            onClick={() => router.push("/add-food")}
            className="fm-add-btn"
            style={{
              padding: "9px 18px", borderRadius: 12, fontSize: 12, fontWeight: 800,
              cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.4)",
              color: "#4ade80", whiteSpace: "nowrap",
            }}
          >
            + Add Food
          </button>
        </div>

        {/* ── Meal Timing Filter Bar ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: "8px 12px",
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
        }}>
          {MEAL_TIMINGS.map((m) => {
            const isActive = activeMeal === m.value;
            const stats = m.value !== "all" ? mealTimingStats[m.value] : null;
            const hasDupes = stats?.duplicates?.length > 0;
            return (
              <button
                key={m.value}
                onClick={() => handleMealFilter(m.value)}
                disabled={mealLoading}
                className="fm-filter-btn"
                style={{
                  padding: "5px 13px", borderRadius: 999,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: mealLoading ? "not-allowed" : "pointer",
                  border: isActive
                    ? hasDupes ? "1px solid rgba(251,191,36,0.7)" : "1px solid rgba(34,197,94,0.55)"
                    : hasDupes ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  background: isActive
                    ? hasDupes ? "rgba(251,191,36,0.14)" : "rgba(34,197,94,0.16)"
                    : "rgba(255,255,255,0.03)",
                  color: isActive
                    ? hasDupes ? "#fbbf24" : "#4ade80"
                    : hasDupes ? "rgba(251,191,36,0.7)" : "rgba(255,255,255,0.38)",
                  boxShadow: isActive
                    ? hasDupes ? "0 0 10px rgba(251,191,36,0.2)" : "0 0 10px rgba(34,197,94,0.18)"
                    : "none",
                  display: "flex", alignItems: "center", gap: 5,
                  position: "relative",
                }}
                title={hasDupes ? `⚠️ ${stats.duplicates.length} duplicate name(s): ${stats.duplicates.slice(0,3).join(", ")}` : ""}
              >
                {m.emoji} {m.label}
                {stats?.count > 0 && (
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    background: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
                    padding: "1px 5px", borderRadius: 999,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  }}>
                    {stats.count}
                  </span>
                )}
                {hasDupes && (
                  <span style={{ fontSize: 10, lineHeight: 1 }} title={`Duplicates: ${stats.duplicates.join(", ")}`}>
                    ⚠️
                  </span>
                )}
              </button>
            );
          })}
          {mealLoading && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 4 }} className="animate-pulse">
              Loading…
            </span>
          )}
        </div>

        {/* ── Food Type Filter Row — slides in after meal is selected ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          overflow: "hidden",
          maxHeight: activeMeal !== "all" ? 48 : 0,
          opacity: activeMeal !== "all" ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.25s ease",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.10em", whiteSpace: "nowrap" }}>
            Type:
          </span>
          {FOOD_TYPES.map((ft) => {
            const isActive = activeFoodType === ft.value;
            const accentColor = ft.value === "online" ? "59,130,246" : ft.value === "self-cooking" ? "249,115,22" : "255,255,255";
            return (
              <button
                key={ft.value}
                onClick={() => handleFoodTypeFilter(ft.value)}
                disabled={mealLoading}
                className="fm-filter-btn"
                style={{
                  padding: "5px 14px", borderRadius: 999,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: mealLoading ? "not-allowed" : "pointer",
                  border: isActive
                    ? `1px solid rgba(${accentColor},0.6)`
                    : "1px solid rgba(255,255,255,0.07)",
                  background: isActive
                    ? `rgba(${accentColor},0.14)`
                    : "rgba(255,255,255,0.03)",
                  color: isActive
                    ? `rgb(${accentColor})`
                    : "rgba(255,255,255,0.38)",
                  boxShadow: isActive ? `0 0 10px rgba(${accentColor},0.2)` : "none",
                }}
              >
                {ft.emoji} {ft.label}
              </button>
            );
          })}
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
            {search
              ? searchLoading
                ? "Searching…"
                : `${filteredFoods.length} result${filteredFoods.length !== 1 ? "s" : ""} for "${search}"`
              : activeMeal !== "all"
                ? `${totalCount} ${activeMeal}${activeFoodType !== "all" ? ` · ${activeFoodType}` : ""} items`
                : `${totalCount || 0} total items`}
          </p>
          {isNavigating && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }} className="animate-pulse">
              Navigating…
            </span>
          )}
        </div>

        {/* ── Food List ── */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
          className={`transition-opacity duration-300 ${isNavigating || mealLoading ? "opacity-30 pointer-events-none" : "opacity-100"}`}
        >
          {(mealLoading || searchLoading) ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredFoods.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 0",
              color: "rgba(255,255,255,0.2)", fontSize: 14,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
              <p style={{ fontWeight: 700 }}>
                {search ? `No results for "${search}"` : `No items for "${activeMeal}"`}
              </p>
              {search && (
                <button onClick={() => setSearch("")} style={{
                  marginTop: 10, fontSize: 12, color: "#4ade80", background: "none",
                  border: "none", cursor: "pointer", textDecoration: "underline",
                }}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredFoods.map((food, idx) => {
              const isHighlighted = food._id === highlightId;
              const primaryDiet   = food.dietType?.[0];
              const dietM         = primaryDiet ? getDietMeta(primaryDiet) : null;
              // Check if this food name is a duplicate in any of its meal timings
              const isDuplicate = food.mealTiming?.some(t =>
                mealTimingStats[t]?.duplicates?.includes(food.name?.toLowerCase().trim())
              );

              return (
                <div
                  key={food._id}
                  ref={isHighlighted ? highlightRef : null}
                  className="fm-card"
                  style={{
                    animationDelay: `${Math.min(idx * 0.04, 0.3)}s`,
                    background: isHighlighted ? "rgba(34,197,94,0.07)" : isDuplicate ? "rgba(251,191,36,0.04)" : "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(28px) saturate(150%)",
                    WebkitBackdropFilter: "blur(28px) saturate(150%)",
                    border: isHighlighted
                      ? "1px solid rgba(34,197,94,0.45)"
                      : isDuplicate
                        ? "1px solid rgba(251,191,36,0.35)"
                        : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    boxShadow: isHighlighted
                      ? "0 0 0 3px rgba(34,197,94,0.12), 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)"
                      : isDuplicate
                        ? "0 0 0 2px rgba(251,191,36,0.08), 0 6px 28px rgba(0,0,0,0.3)"
                        : "0 6px 28px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
                    padding: "14px 18px",
                    display: "flex", gap: 16, alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Image with overlay */}
                  <div
                    className="fm-img-wrap"
                    style={{
                      width: 130, height: 110, flexShrink: 0,
                      borderRadius: 14, position: "relative",
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: "#0a0a0a",
                    }}
                  >
                    <img
                      src={food.image || "https://placehold.co/300x200/111/333?text=No+Image"}
                      alt={food.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 13 }}
                    />
                    {/* Gradient overlay at bottom */}
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: 13,
                      background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
                      pointerEvents: "none",
                    }} />
                    {/* Calories badge */}
                    {food.nutrition?.calories > 0 && (
                      <span style={{
                        position: "absolute", bottom: 6, left: 7,
                        fontSize: 9, fontWeight: 800, color: "#fff",
                        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
                        padding: "2px 7px", borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}>
                        🔥 {food.nutrition.calories} kcal
                      </span>
                    )}
                    {/* Diet dot */}
                    {dietM && (
                      <span style={{
                        position: "absolute", top: 6, right: 6,
                        width: 20, height: 20, borderRadius: "50%",
                        background: dietM.bg, border: `1.5px solid ${dietM.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10,
                      }}>
                        {dietM.icon}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                        {food.name}
                      </h2>
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: "#4ade80",
                        textTransform: "uppercase", letterSpacing: "0.16em", flexShrink: 0,
                      }}>
                        {food.category || "General"}
                      </span>
                      {isDuplicate && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: "#fbbf24",
                          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)",
                          padding: "2px 7px", borderRadius: 999, flexShrink: 0,
                          textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>
                          ⚠️ Duplicate
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: 12, color: "rgba(255,255,255,0.35)",
                      margin: "4px 0 10px", lineHeight: 1.5,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {food.description || "—"}
                    </p>

                    {/* Tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {food.dietType?.map((diet) => {
                        const m = getDietMeta(diet);
                        return (
                          <span key={diet} style={{
                            fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                            letterSpacing: "0.07em", padding: "3px 8px", borderRadius: 999,
                            background: m.bg, border: `1px solid ${m.border}`, color: m.text,
                          }}>
                            {m.icon} {diet}
                          </span>
                        );
                      })}
                      {food.cuisine?.slice(0, 2).map((c) => (
                        <span key={c} style={{
                          fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 999,
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.38)",
                        }}>
                          {c}
                        </span>
                      ))}
                      {/* Meal timing — highlight in search mode */}
                      {food.mealTiming?.map((t) => {
                        const isSearchHighlight = search && searchResults !== null;
                        return (
                          <span key={t} style={{
                            fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 999,
                            background: isSearchHighlight ? "rgba(139,92,246,0.22)" : "rgba(139,92,246,0.10)",
                            border: isSearchHighlight ? "1px solid rgba(139,92,246,0.55)" : "1px solid rgba(139,92,246,0.22)",
                            color: isSearchHighlight ? "#c4b5fd" : "#a78bfa",
                            boxShadow: isSearchHighlight ? "0 0 8px rgba(139,92,246,0.25)" : "none",
                          }}>
                            {t}
                          </span>
                        );
                      })}
                      {food.foodType?.map((type) => (
                        <span key={type} style={{
                          fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                          letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 999,
                          background: type === "online" ? "rgba(59,130,246,0.10)" : "rgba(249,115,22,0.10)",
                          border: type === "online" ? "1px solid rgba(59,130,246,0.28)" : "1px solid rgba(249,115,22,0.28)",
                          color: type === "online" ? "#60a5fa" : "#fb923c",
                        }}>
                          {type === "online" ? "🛵 Online" : "🍳 Self Cook"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
                    <div style={{ display: "flex", gap: 7 }}>
                      <button
                        onClick={() => router.push(`/add-food?edit=${food._id}`)}
                        className="fm-edit-btn"
                        style={{
                          padding: "7px 15px", borderRadius: 10, fontSize: 11, fontWeight: 800,
                          cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase",
                          background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.28)",
                          color: "#60a5fa",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(food._id)}
                        className="fm-del-btn"
                        style={{
                          padding: "7px 15px", borderRadius: 10, fontSize: 11, fontWeight: 800,
                          cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase",
                          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)",
                          color: "#f87171",
                        }}
                      >
                        🗑 Del
                      </button>
                    </div>
                    {food.price && (
                      <span style={{
                        fontSize: 13, fontWeight: 900, color: "#4ade80",
                        background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)",
                        padding: "3px 11px", borderRadius: 999,
                      }}>
                        ₹{food.price}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && !search && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 20, paddingBottom: 4 }}>
            <button
              disabled={displayPage <= 1 || mealLoading}
              onClick={() => handlePageChange(displayPage - 1)}
              className="fm-page-btn"
              style={{
                padding: "8px 20px", borderRadius: 11, fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.5)",
                opacity: displayPage <= 1 ? 0.3 : 1,
              }}
            >
              ← Prev
            </button>

            {/* Page dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const p = i + 1;
                const isCurrentPage = p === displayPage;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className="fm-page-btn"
                    style={{
                      width: isCurrentPage ? 28 : 22, height: 22, borderRadius: 999,
                      fontSize: 10, fontWeight: 800, cursor: "pointer",
                      background: isCurrentPage ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.04)",
                      border: isCurrentPage ? "1px solid rgba(34,197,94,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      color: isCurrentPage ? "#4ade80" : "rgba(255,255,255,0.3)",
                      transition: "all 0.18s ease",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>…{totalPages}</span>
              )}
            </div>

            <button
              disabled={displayPage >= totalPages || mealLoading}
              onClick={() => handlePageChange(displayPage + 1)}
              className="fm-page-btn"
              style={{
                padding: "8px 20px", borderRadius: 11, fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.32)",
                color: "#4ade80",
                opacity: displayPage >= totalPages ? 0.3 : 1,
                boxShadow: "0 4px 14px rgba(34,197,94,0.12)",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
