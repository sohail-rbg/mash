"use client";

export default function ModeRow({ selectedMode, showResult, suggestedFood, spinning, onModeSelect, pulseModes }) {
  const modeBtn = (mode, label, activeClass, delayClass = "") => (
    <button
      onClick={() => onModeSelect(mode)}
      className={` cursor-pointer
        relative z-10 px-3 py-2 rounded-2xl flex-shrink-0
        font-bold text-[15px] tracking-[0.1em] uppercase
        transition-all duration-300 
        ${pulseModes ? `animate-attention-bounce ${delayClass}` : ""}
        ${!selectedMode ? (mode === "online" ? "mode-highlight-red" : "mode-highlight-green") : ""}
        ${selectedMode === mode
          ? activeClass
          : "text-[var(--text-muted)] hover:text-[var(--text-main)] bg-white/5 border border-white/10 hover:bg-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full flex items-center p-1.5 mb-4 bg-[var(--glass-bg)] backdrop-blur-[40px] border border-[var(--glass-border)] rounded-[2.5rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_15px_35px_rgba(0,0,0,0.2)] relative overflow-hidden">
      <style>{`
        @keyframes attentionThump { 
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        .animate-attention-bounce { 
          animation: attentionThump 0.4s ease-in-out infinite; 
          z-index: 50; 
          border-color: #f97316 !important;
          box-shadow: 0 12px 25px -5px rgba(249, 115, 22, 0.5) !important;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        @keyframes modeRingRipple {
          0% { outline: 2px solid var(--ring-color); outline-offset: 0px; }
          100% { outline: 6px solid transparent; outline-offset: 15px; }
        }

        /* 3D Button Behavior - Uiverse Style logic with project colors */
        .mode-btn-active-red {
           background: linear-gradient(to bottom, #ef4444 0%, #991b1b 100%);
           box-shadow: 0 4px 3px 1px rgba(255,255,255,0.1), 0 6px 8px rgba(0,0,0,0.4), 
                       inset 0 0 5px 3px rgba(0,0,0,0.2), inset 0 0 30px rgba(0,0,0,0.3);
           transform: scale(0.95);
           color: white;
        }
        .mode-btn-active-green {
           background: linear-gradient(to bottom, #22c55e 0%, #166534 100%);
           box-shadow: 0 4px 3px 1px rgba(255,255,255,0.1), 0 6px 8px rgba(0,0,0,0.4), 
                       inset 0 0 5px 3px rgba(0,0,0,0.2), inset 0 0 30px rgba(0,0,0,0.3);
           transform: scale(0.95);
           color: white;
        }

        .mode-highlight-red {
          --ring-color: rgba(239, 68, 68, 0.6);
          border-radius: 1rem;
          animation: modeRingRipple 4s infinite cubic-bezier(0.25, 0, 0.2, 1);
        }
        .mode-highlight-green {
          --ring-color: rgba(34, 197, 94, 0.6);
          border-radius: 1rem;
          animation: modeRingRipple 4s infinite cubic-bezier(0.25, 0, 0.2, 1);
        }

        /* Hover effects - Lifting up */
        .cursor-pointer:hover:not(:disabled) {
          // box-shadow: 0 8px 15px rgba(0,0,0,0.3), 0 -4px 4px rgba(255,255,255,0.05), 
                      // inset 0 0 3px 1px rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        /* Active state - Pushing in */
        .cursor-pointer:active {
          // box-shadow: 0 2px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4), 
                      // inset 0 0 8px 4px rgba(0,0,0,0.5);
          transform: translateY(1px) scale(0.96);
        }

        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.1); }
          50% { text-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 30px var(--glow-color, rgba(255,255,255,0.1)); }
        }
        .suggested-text-glow {
          animation: textGlow 3s ease-in-out infinite;
        }
      `}</style>
      
      {/* Liquid Glass Shine Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.1] z-0" />

      {/* Platform Selection */}
      {modeBtn(
        "online", "🛵 Online",
        "mode-btn-active-red border-red-500/50",
        ""
      )}

      {/* Center label */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1">
        {showResult && suggestedFood && !spinning ? (
          <>
            <p className="text-[8px] font-bold tracking-[0.3em] uppercase text-[var(--text-muted)] mt-1.5 opacity-50">
              Your Pick
            </p>
          </>
        ) : spinning ? (
          <span
            className="text-[9px] font-black tracking-[0.3em] uppercase text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
            style={{ animation: "pulse 1s ease infinite" }}
          >
            spinning…
          </span>
        ) : (
          <div className="flex items-center gap-[5px]">
            <div className="h-px w-3 bg-[var(--glass-border)]" />
            <div
              className="w-1 h-1 rounded-full transition-all duration-700 cursor-pointer"
              style={{
                background: selectedMode === "online" ? "#ef4444" : selectedMode === "self-cooking" ? "#22c55e" : "rgba(255,255,255,0.2)",
                boxShadow: selectedMode ? `0 0 18px ${selectedMode === "online" ? "#ef4444" : "#22c55e"}` : "none",
              }}
            />
            <div className="h-px w-4 bg-white/10" />
          </div>
        )}
      </div>

      {modeBtn(
        "self-cooking", "🍳 Self",
        "mode-btn-active-green border-green-500/50",
        "delay-100"
      )}
    </div>
  );
}