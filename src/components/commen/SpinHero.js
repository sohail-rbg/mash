"use client";

export default function SpinHero({ timeLeft, onClearFilters, onOpenFilters }) {
  const filterActive = timeLeft != null && timeLeft > 0;

  // The card's actual background color — must match so gradient ring looks like border only
  const cardBg = "rgb(12, 14, 22)";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .filter-btn {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .filter-btn:hover { transform: scale(1.08); }
        .filter-btn svg { pointer-events: none; }

        @keyframes rotate-green {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Rotating green border container */
        .filter-grad-ring {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2.5px; /* Space for the rotating border */
          border-radius: 50%;
          z-index: 1;
          transition: all 0.3s ease;
        }

        /* The actual rotating green ring */
        .filter-grad-ring::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          padding: 2px; /* Ring thickness */
          background: conic-gradient(from 0deg, transparent 20%, #22c55e, transparent 80%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          animation: rotate-green 2.5s linear infinite;
          pointer-events: none;
        }

        /* Inner gradient ring - Always visible as requested */
        .inner-ring {
          padding: 2px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fcd34d, #f97316 50%, #ef4444);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .filter-grad-ring.active {
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15), 0 8px 24px rgba(0,0,0,0.3);
        }

        /* X badge */
        .filter-clear-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f97316;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer !important;
          z-index: 9999 !important; /* ensure it is above everything */
          transition: transform 0.12s ease, background 0.12s ease;
          pointer-events: auto !important; /* ensure it receives clicks */
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        }
        .filter-clear-badge:hover {
          transform: scale(1.3);
          background: #ef4444;
          cursor: pointer;
        }
        .filter-clear-badge svg { pointer-events: none; }
      ` }} />

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
        <div
          style={{ position: "relative", display: "inline-flex", flexShrink: 0, pointerEvents: 'auto', zIndex: 10 }}
        >
        <button
          type="button"
          className={`filter-grad-ring${filterActive ? " active" : ""}`}
          onClick={() => typeof onOpenFilters === 'function' && onOpenFilters()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              typeof onOpenFilters === 'function' && onOpenFilters();
            }
          }}
          aria-label={filterActive ? `Filters active — ${timeLeft}s left` : "Open filters"}
          title={filterActive ? `Filters active — ${timeLeft}s left` : "Open filters"}
          style={{
            position: 'relative',
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <span className="inner-ring">
            <span
              className="filter-btn"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                background: "var(--card-bg, rgba(18,18,28,0.95))",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: filterActive ? "#f97316" : "var(--text-main, #fff)",
                position: "relative",
                zIndex: 1,
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
            </span>
          </span>
        </button>
        {filterActive && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClearFilters(); }}
              className="filter-clear-badge"
              title={`Clear filters (${timeLeft}s left)`}
              aria-label="Clear active filters"
              style={{
                zIndex: 9999,
                cursor: "pointer",
                top: -8,
                right: -8,
                position: 'absolute',
                padding: 0,
              }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ display: 'block' }}>
                <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
