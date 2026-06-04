"use client";

import React, { useEffect, useMemo, useState } from "react";

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed || 1;
  return () => {
    value = Math.imul(48271, value) % 2147483647;
    return (value & 0x7fffffff) / 2147483647;
  };
}

function shuffleWithSeed(items, seed) {
  const array = [...items];
  const random = seededRandom(seed);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function IngredientDrawer({ visible, onClose, ingredients, activeMealTiming, checkedIngredients, onToggle, onApply, error }) {
  if (!visible) return null;

  const [searchQuery, setSearchQuery] = useState("");
  const selectedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const hasSelection = selectedCount > 0;

  useEffect(() => {
    if (!visible) setSearchQuery("");
  }, [visible]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const displayedIngredients = useMemo(() => {
    const matched = ingredients.filter((item) =>
      item.label.toLowerCase().includes(normalizedSearch) ||
      item.id.toLowerCase().includes(normalizedSearch)
    );

    if (!normalizedSearch) {
      const seed = hashString(activeMealTiming || "default");
      return shuffleWithSeed(matched, seed).slice(0, 10);
    }

    return matched;
  }, [normalizedSearch, ingredients, activeMealTiming]);

  const handleSelectAll = () => {
    displayedIngredients.forEach(item => {
      if (!checkedIngredients[item.id]) onToggle(item.id);
    });
  };

  const handleClearAll = () => {
    ingredients.forEach(item => {
      if (checkedIngredients[item.id]) onToggle(item.id);
    });
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/10 backdrop-blur-md flex justify-end"
      style={{ animation: "fadeIn 0.3s ease-out" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .drawer-scroll::-webkit-scrollbar { width: 3px; }
        .drawer-scroll::-webkit-scrollbar-track { background: transparent; }
        .drawer-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      ` }} />

      <div
        className="
          w-full max-w-[380px] h-[calc(100vh-140px)] mt-[100px] mb-[40px] mr-5 flex flex-col gap-6
          bg-[var(--glass-bg)] backdrop-blur-3xl border border-[var(--glass-border)]
          px-6 py-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem]
        "
        style={{ animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] font-extrabold text-[var(--text-muted)] tracking-[0.2em] uppercase font-[Outfit]">
              What's in your kitchen?
            </p>
            <h3 className="font-[Playfair_Display] text-xl sm:text-2xl font-black text-[var(--text-main)] mt-1 leading-tight">
              {activeMealTiming ? activeMealTiming.charAt(0).toUpperCase() + activeMealTiming.slice(1) : 'Meal'} Ingredients
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.15] text-[var(--text-main)] flex items-center justify-center text-sm transition-all duration-200 hover:bg-white/15 hover:text-white hover:rotate-90 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent flex-shrink-0" />

        {/* Search + Quick Actions */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredient..."
              className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-300/20"
            />
          </div>
          {error && Object.keys(checkedIngredients).some(Boolean) && (
            <div className="px-1 text-sm font-semibold text-red-400">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between px-1 pt-1">
            <p className="text-[11px] font-bold text-[var(--text-muted)] italic">
              {selectedCount === 0 ? "💡 No selection uses everything" : `${selectedCount} items selected`}
            </p>
            <button 
              onClick={hasSelection ? handleClearAll : handleSelectAll}
              className="text-[10px] font-black uppercase tracking-wider text-green-400 hover:text-green-300 transition-colors cursor-pointer"
            >
              {hasSelection ? "Unselect All" : "Select All"}
            </button>
          </div>
          {activeMealTiming === "breakfast" && !searchQuery.trim() && (
            <p className="text-[11px] text-[var(--text-muted)] italic px-1">
              Showing top 10 ingredients for breakfast. Search to narrow down further.
            </p>
          )}
        </div>

        {/* Chips grid */}
        <div className="flex-1 overflow-y-auto drawer-scroll grid grid-cols-2 gap-3 content-start pr-1 pb-6">
          {displayedIngredients.length === 0 ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="col-span-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-red-300 hover:bg-white/10 transition cursor-pointer"
            >
              {searchQuery.trim()
                ? "No ingredient found. Tap to clear search and try another ingredient."
                : "No ingredient available for this meal timing. Change ingredient or adjust your search."
              }
            </button>
          ) : displayedIngredients.map((item) => {
            const on = !!checkedIngredients[item.id];
            return (
              <label
                key={item.id}
                className={` 
                  p-2 rounded-xl text-[12px] sm:text-[13px] font-bold font-[Outfit]
                  cursor-pointer select-none flex flex-col items-center justify-center text-center gap-2
                  border transition-all duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  hover:scale-[1.0]
                  ${on
                    ? "bg-green-500/45 border-green-400 text-white shadow-[0_0_16px_rgba(34,197,94,0.35)]"
                    : "bg-black/5 dark:bg-white/5 border-[var(--glass-border)] text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-[var(--text-main)]"
                  }
                `}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={on} 
                  onChange={() => onToggle(item.id)} 
                />
                {item.label}
              </label>
            );
          })}
        </div>

        {/* Apply button */}
        <button
          onClick={onApply || onClose}
          className="
            w-full py-3.5 rounded-full flex-shrink-0
            font-[Outfit] text-[12px] font-extrabold tracking-[0.09em] uppercase
            bg-gradient-to-br from-green-500/35 to-green-700/28
            border border-green-400/50 text-[var(--text-main)]
            backdrop-blur-xl
            transition-all duration-[280ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg shadow-green-900/20
            hover:-translate-y-1 hover:brightness-110
            active:scale-[0.96]
          "
        >
          {selectedCount > 0 ? `Apply Selected (${selectedCount})` : "Use All Ingredients"}
        </button>
      </div>
    </div>
  );
}