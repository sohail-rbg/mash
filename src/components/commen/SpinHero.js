"use client";

export default function SpinHero({ timeLeft, onClearFilters, onOpenFilters }) {
  const filterActive = timeLeft != null && timeLeft > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Filter button idle hover ── */
        .filter-btn { transition: transform 0.25s ease; }
        .filter-btn:hover { transform: scale(1.08) rotate(18deg); }

        /* ── Rotating gradient ring — always visible, subtle when inactive ── */
        @keyframes filterRingSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .filter-ring-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          padding: 2px;
        }

        /* Gradient border ring — always spinning */
        .filter-ring-wrap::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            #f97316 0deg,
            #fbbf24 90deg,
            #f97316 180deg,
            #fb923c 270deg,
            #f97316 360deg
          );
          animation: filterRingSpin 3s linear infinite;
          opacity: 0.35;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }

        /* Mask so ring doesn't bleed into button */
        .filter-ring-wrap::after {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 50%;
          background: var(--glass-bg, rgba(255,255,255,0.08));
          pointer-events: none;
          z-index: 0;
        }

        /* Active — full opacity ring */
        .filter-ring-wrap.active::before {
          opacity: 1;
        }

        .filter-ring-wrap > * {
          position: relative;
          z-index: 1;
        }

        /* Active button glow */
        .filter-btn-active {
          border-color: rgba(249,115,22,0.5) !important;
          box-shadow: 0 0 0 1px rgba(249,115,22,0.25), 0 4px 16px rgba(249,115,22,0.2) !important;
        }

        /* Clear dot on active filter */
        .filter-clear-dot {
          position: absolute;
          top: -1px;
          right: -1px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f97316;
          border: 2px solid rgba(9,14,28,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .filter-clear-dot:hover {
          transform: scale(1.2);
          background: #ef4444;
        }
      `}</style>

      <div className="flex items-start justify-between gap-3">
        {/* ── Left: title ── */}
        <div className="flex flex-col">
          <span className="text-[9px] font-[Outfit] font-bold tracking-[0.22em] uppercase text-[var(--text-muted)]">
            🍽 Food Engine
          </span>

          <h2
            className="font-[Playfair_Display] leading-[1.05] tracking-[-0.02em] text-[var(--text-main)]"
            style={{ fontSize: "clamp(22px, 5.5vw, 34px)", fontWeight: 900 }}
          >
            Let fate{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(135deg,#fcd34d,#f97316 60%,#ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              decide
            </span>
          </h2>

          <p className="text-[10px] font-[Outfit] text-[var(--text-muted)] font-normal mt-0.5 leading-snug max-w-[200px]">
            Spin the wheel — no more indecision!
          </p>
        </div>

        {/* ── Right: filter button with rotating ring ── */}
        <div className="flex flex-col items-end flex-shrink-0">
          <div className={`filter-ring-wrap${filterActive ? ' active' : ''}`}>
            <button
              onClick={onOpenFilters}
              className={`filter-btn cursor-pointer w-11 h-11 rounded-full bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] text-[var(--text-main)] flex items-center justify-center transition-all duration-250 ${filterActive ? 'filter-btn-active' : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.45)]'}`}
              title={filterActive ? `Filters active — ${timeLeft}s left` : "Filters"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>

            {/* Clear dot — only when filter active */}
            {filterActive && (
              <button
                onClick={onClearFilters}
                className="filter-clear-dot"
                title="Clear filters"
                aria-label="Clear active filters"
              >
                <svg width="7" height="7" viewBox="0 0 10 10" fill="white">
                  <path d="M1 1l8 8M9 1l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
