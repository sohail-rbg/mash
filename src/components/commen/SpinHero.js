"use client";

export default function SpinHero({ timeLeft, onClearFilters, onOpenFilters }) {
  const filterActive = timeLeft != null && timeLeft > 0;

  // The card's actual background color — must match so gradient ring looks like border only
  const cardBg = "rgb(12, 14, 22)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .filter-btn {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .filter-btn:hover { transform: scale(1.08); }
        .filter-btn svg { pointer-events: none; }

        /* Gradient ring — always visible */
        .filter-grad-ring {
          padding: 1.5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fcd34d, #f97316 50%, #ef4444);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: box-shadow 0.3s ease;
        }
        .filter-grad-ring.active {
          box-shadow: 0 0 0 3px rgba(249,115,22,0.2), 0 4px 20px rgba(249,115,22,0.35);
        }

        /* X badge */
        .filter-clear-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #f97316;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .filter-clear-badge:hover {
          transform: scale(1.3);
          background: #ef4444;
          cursor: pointer;
        }
        .filter-clear-badge svg { pointer-events: none; }
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

        {/* ── Right: filter button ── */}
        <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>

          {/* Gradient ring wrapper — 1.5px gradient acts as border */}
          <div className={`filter-grad-ring${filterActive ? " active" : ""}`}>
            <button
              onClick={onOpenFilters}
              className="filter-btn"
              title={filterActive ? `Filters active — ${timeLeft}s left` : "Open filters"}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                /* solid bg matching card — makes gradient wrapper look like border only */
                background: "var(--card-bg, rgba(18,18,28,0.95))",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: filterActive ? "#f97316" : "var(--text-main, #fff)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ pointerEvents: "none" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>

          {/* X badge — only when filters active */}
          {filterActive && (
            <button
              onClick={(e) => { e.stopPropagation(); onClearFilters(); }}
              className="filter-clear-badge"
              title={`Clear filters (${timeLeft}s left)`}
              aria-label="Clear active filters"
              style={{ cursor: "pointer" }}
            >
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none" style={{ pointerEvents: "none" }}>
                <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}

        </div>
      </div>
    </>
  );
}
