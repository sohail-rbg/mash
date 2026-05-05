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

const DIET_META = {
  "veg":     { icon: "🌱", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  "vegan":   { icon: "🌿", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  "jain":    { icon: "🪷", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  "keto":    { icon: "🥑", color: "bg-lime-500/10 text-lime-400 border-lime-500/20" },
  "non-veg": { icon: "🍖", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function getDietMeta(diet) {
  return DIET_META[diet?.toLowerCase()] || { icon: "🍽️", color: "bg-white/5 text-white/50 border-white/10" };
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
  const [mealLoading, setMealLoading]   = useState(false);
  const [totalPages, setTotalPages]     = useState(initialTotalPages);
  const [totalCount, setTotalCount]     = useState(initialTotalCount);
  const [filteredPage, setFilteredPage] = useState(1);

  const router       = useRouter();
  const searchParams = useSearchParams();
  const highlightId  = searchParams.get("highlight");
  const highlightRef = useRef(null);

  // Scroll to highlighted food after edit redirect
  useEffect(() => {
    if (highlightId && highlightRef.current) {
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightId, foods]);

  // Sync server-rendered data when no meal filter is active
  useEffect(() => {
    if (activeMeal === "all") {
      setFoods(initialFoods);
      setTotalPages(initialTotalPages);
      setTotalCount(initialTotalCount);
      setIsNavigating(false);
    }
  }, [initialFoods, initialTotalPages, initialTotalCount, activeMeal]);

  // ── Fetch by meal timing ──
  const fetchByMeal = async (meal, page = 1) => {
    setMealLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20", page: String(page), fullImage: "true" });
      if (meal !== "all") params.set("mealTiming", meal);

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

  const handleMealFilter = (meal) => {
    setActiveMeal(meal);
    setFilteredPage(1);
    if (meal === "all") {
      setFoods(initialFoods);
      setTotalPages(initialTotalPages);
      setTotalCount(initialTotalCount);
    } else {
      fetchByMeal(meal, 1);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this food permanently?")) return;
    try {
      const res = await fetch(`/api/foods?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFoods(prev => prev.filter(f => f._id !== id));
        setTotalCount(c => c - 1);
      } else {
        alert("Failed to delete food.");
      }
    } catch {
      alert("Error deleting food.");
    }
  };

  const handlePageChange = (newPage) => {
    if (activeMeal !== "all") {
      fetchByMeal(activeMeal, newPage);
    } else {
      setIsNavigating(true);
      router.push(`/all-foods?page=${newPage}`);
    }
  };

  const displayPage = activeMeal !== "all" ? filteredPage : currentPage;

  return (
    <div className="space-y-6">

      {/* ── Meal Timing Filter Bar ── */}
      <div className="flex flex-wrap gap-2 px-1">
        {MEAL_TIMINGS.map((m) => {
          const isActive = activeMeal === m.value;
          return (
            <button
              key={m.value}
              onClick={() => handleMealFilter(m.value)}
              disabled={mealLoading}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: mealLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                border: isActive ? "1.5px solid #22c55e" : "1.5px solid rgba(255,255,255,0.1)",
                background: isActive ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                color: isActive ? "#22c55e" : "rgba(255,255,255,0.5)",
                boxShadow: isActive
                  ? "0 0 0 3px rgba(34,197,94,0.1), 0 4px 12px rgba(34,197,94,0.15)"
                  : "none",
              }}
            >
              <span style={{ marginRight: 5 }}>{m.emoji}</span>
              {m.label}
            </button>
          );
        })}
        {mealLoading && (
          <span className="text-xs text-white/40 animate-pulse self-center ml-2">
            Loading...
          </span>
        )}
      </div>

      {/* ── Stats row ── */}
      <div
        className={`flex justify-between items-center px-2 transition-opacity duration-300 ${
          isNavigating || mealLoading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        <p className="text-sm font-bold text-green-500 uppercase tracking-widest">
          {activeMeal !== "all"
            ? `${totalCount} ${activeMeal} items`
            : `Total Items: ${totalCount || 0}`}
        </p>
        {isNavigating && (
          <span className="text-xs text-white animate-pulse">Loading Next Page...</span>
        )}
      </div>

      {/* ── Food List ── */}
      <div
        className={`space-y-4 transition-opacity duration-300 ${
          isNavigating || mealLoading ? "opacity-40 pointer-events-none" : "opacity-100"
        }`}
      >
        {foods.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-20">
            No food items found{activeMeal !== "all" ? ` for "${activeMeal}"` : ""}.
          </p>
        ) : (
          foods.map((food) => {
            const isHighlighted = food._id === highlightId;
            return (
              <div
                key={food._id}
                ref={isHighlighted ? highlightRef : null}
                className="p-4 sm:p-5 rounded-[2rem] flex flex-col sm:flex-row gap-6 items-center transition-all"
                style={{
                  background: isHighlighted ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
                  border: isHighlighted
                    ? "1.5px solid rgba(34,197,94,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isHighlighted ? "0 0 0 3px rgba(34,197,94,0.15)" : "none",
                }}
              >
                {/* Food Image */}
                <div className="relative overflow-hidden rounded-2xl w-full sm:w-40 h-40 flex-shrink-0 bg-slate-900">
                  <img
                    src={food.image || "https://placehold.co/600x400?text=No+Image"}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Main Data */}
                <div className="flex-grow w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">{food.name}</h2>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-green-500 font-black mt-1">
                        {food.category || "General"}
                      </p>
                    </div>
                    {food.price && (
                      <span className="text-xl font-black text-green-400 bg-green-400/10 px-4 py-1 rounded-full border border-green-400/20">
                        ₹{food.price}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2 leading-relaxed max-w-2xl">
                    {food.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Diet type badges — correct icon per type */}
                    <div className="flex flex-wrap gap-2">
                      {food.dietType?.map((diet) => {
                        const meta = getDietMeta(diet);
                        return (
                          <span
                            key={diet}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${meta.color}`}
                          >
                            {meta.icon} {diet}
                          </span>
                        );
                      })}
                    </div>

                    {food.cuisine?.length > 0 && (
                      <>
                        <div className="h-4 w-px bg-white/10 hidden sm:block" />
                        <div className="flex flex-wrap gap-2">
                          {food.cuisine.slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[9px] text-white/50 uppercase font-bold"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Meal timing tags */}
                    {food.mealTiming?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {food.mealTiming.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[9px] text-purple-400 uppercase font-bold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between items-end gap-4 w-full sm:w-auto sm:min-w-[150px] border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => router.push(`/add-food?edit=${food._id}`)}
                      className="flex-1 sm:flex-none py-2 px-4 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl border border-blue-500/20 transition-all font-bold text-xs cursor-pointer"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(food._id)}
                      className="flex-1 sm:flex-none py-2 px-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl border border-red-500/20 transition-all font-bold text-xs cursor-pointer"
                    >
                      DELETE
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    {food.foodType?.map((type) => (
                      <span
                        key={type}
                        className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                          type === "online"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }`}
                      >
                        {type === "online" ? "🛵 Online" : "🍳 Self Cook"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 pb-8">
          <button
            disabled={displayPage <= 1 || mealLoading}
            onClick={() => handlePageChange(displayPage - 1)}
            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all font-bold cursor-pointer"
          >
            ← Previous
          </button>
          <span className="text-white font-bold">
            Page {displayPage} of {totalPages}
          </span>
          <button
            disabled={displayPage >= totalPages || mealLoading}
            onClick={() => handlePageChange(displayPage + 1)}
            className="px-6 py-2 rounded-xl bg-green-500 text-black font-black hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 disabled:opacity-30 cursor-pointer"
          >
            Next Page →
          </button>
        </div>
      )}
    </div>
  );
}
