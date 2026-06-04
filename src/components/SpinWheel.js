"use client";
import React, { forwardRef, useState, useEffect, useMemo } from 'react';

const formatFoodName = (name) => {
  if (!name) return "";
  const normalized = String(name).trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const SpinWheel = forwardRef(({
  showResult,
  suggestedFood,
  selectedMode,
  spinning,
  onSpin,
  pulseModes,
  onCenterClick,
  loading,
  disabled
}, ref) => {
  const [typedText, setTypedText]       = useState("");
  const [showCursor, setShowCursor]     = useState(true);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  const fullTextLines   = useMemo(() => [" Spin your", " Meal!"], []);
  const typingSpeed     = 90;
  const cursorBlinkSpeed = 500;
  const initialDelay    = 800;

  /* ── typewriter ── */
  useEffect(() => {
    if (!selectedMode && !showResult && !spinning) {
      setTypedText(""); setIsTypingDone(false); setIsDeletingState(false);
      let isDeleting = false, currentText = "";
      let timeoutId, cursorIntervalId;

      setShowCursor(true);
      cursorIntervalId = setInterval(() => setShowCursor(p => !p), cursorBlinkSpeed);

      const combinedText = fullTextLines.join("<br>");
      const tick = () => {
        if (!isDeleting) {
          if (currentText.length < combinedText.length) {
            currentText += combinedText.substring(currentText.length).startsWith("<br>")
              ? "<br>"
              : combinedText.charAt(currentText.length);
            setTypedText(currentText);
            if (currentText === combinedText) {
              setIsTypingDone(true);
              timeoutId = setTimeout(() => { isDeleting = true; setIsDeletingState(true); tick(); }, 2500);
            } else {
              timeoutId = setTimeout(tick, typingSpeed);
            }
          }
        } else {
          if (currentText.length > 0) {
            setIsTypingDone(false);
            currentText = currentText.endsWith("<br>") ? currentText.slice(0, -4) : currentText.slice(0, -1);
            setTypedText(currentText);
            if (currentText === "") {
              isDeleting = false; setIsDeletingState(false);
              timeoutId = setTimeout(tick, 600);
            } else {
              timeoutId = setTimeout(tick, typingSpeed / 2);
            }
          }
        }
      };
      timeoutId = setTimeout(tick, initialDelay);
      return () => { clearTimeout(timeoutId); clearInterval(cursorIntervalId); };
    } else {
      setTypedText(""); setShowCursor(false); setIsTypingDone(false); setIsDeletingState(false);
    }
  }, [selectedMode, showResult, spinning]);

  const DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
  const displayImage = showResult && suggestedFood ? suggestedFood.image : DEFAULT_FOOD_IMAGE;

  /* Mode-aware accent colors */
  const accent = selectedMode === 'online'
    ? { a: '#ef4444', b: '#f97316', ring: 'rgba(239,68,68,0.5)' }
    : selectedMode === 'self-cooking'
    ? { a: '#22c55e', b: '#10b981', ring: 'rgba(34,197,94,0.5)' }
    : { a: '#f97316', b: '#fbbf24', ring: 'rgba(249,115,22,0.4)' };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Spin button glow ── */
        @keyframes spinBtnPulse {
          0%,100% { box-shadow: 0 0 18px ${accent.a}55, 0 8px 24px rgba(0,0,0,0.4); transform: scale(1); }
          50%      { box-shadow: 0 0 32px ${accent.a}99, 0 0 50px ${accent.b}55, 0 8px 24px rgba(0,0,0,0.4); transform: scale(1.04); }
        }
        .spin-button-ready { animation: spinBtnPulse 2s ease-in-out infinite; }

        /* ── Outer ring rotation ── */
        @keyframes outerRingRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .wheel-outer-ring { animation: outerRingRotate 12s linear infinite; }
        .wheel-outer-ring-rev { animation: outerRingRotate 18s linear infinite reverse; }

        /* ── Aura pulse ── */
        @keyframes auraPulse {
          0%,100% { opacity: 0.18; transform: scale(1); }
          50%      { opacity: 0.32; transform: scale(1.08); }
        }
        .wheel-aura { animation: auraPulse 3s ease-in-out infinite; }

        /* ── Select mode label ── */
        @keyframes selectModeFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-select-mode { animation: selectModeFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* ── Pulse label (when no mode selected and user taps) ── */
        @keyframes aggressivePulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.12); background: rgba(249,115,22,0.5); box-shadow: 0 0 20px rgba(249,115,22,0.7); }
        }
        .pulse-label-active {
          animation: aggressivePulse 0.4s ease-in-out infinite;
          border-color: #f97316 !important;
        }

        /* ── Typewriter cursor ── */
        .tw-cursor {
          animation: blink 0.75s step-end infinite;
          color: #fb923c;
          -webkit-text-fill-color: #fb923c !important;
          font-weight: 400;
        }
        .tw-cursor.deleting {
          animation: blink 0.3s step-end infinite;
          color: #ef4444;
          -webkit-text-fill-color: #ef4444 !important;
        }
        @keyframes blink { from,to{opacity:0} 50%{opacity:1} }

        /* ── Food name bounce ── */
        @keyframes bounceIn {
          0%   { opacity:0; transform: translateY(20px) scale(0.6); }
          60%  { opacity:1; transform: translateY(-8px) scale(1.08); }
          80%  { transform: translateY(3px) scale(0.97); }
          100% { opacity:1; transform: translateY(0) scale(1); }
        }
        .animate-food-bounce { animation: bounceIn 0.75s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* ── Spinning rings ── */
        @keyframes spin-ring { to { transform: rotate(360deg); } }

        /* ── Result pop-in ── */
        @keyframes pop-in {
          from { opacity:0; transform: scale(0.78) rotate(-12deg); }
          to   { opacity:1; transform: scale(1) rotate(0deg); }
        }
      ` }} />

      {/* ══════════════════════════════════════════════════════
          WHEEL CONTAINER — properly centered, square
      ══════════════════════════════════════════════════════ */}
      <div
        className="relative flex-shrink-0 w-full flex items-center justify-center"
      >
        <div
          className="relative flex-shrink-0"
          style={{
            width: 'min(100%, 340px)',
            aspectRatio: '1 / 1',
          }}
        >

        {/* ── Ambient aura glow behind wheel ── */}
        {/* removed */}

        {/* ── Outer decorative ring 1 ── */}
        {/* removed */}

        {/* ── Outer decorative ring 2 ── */}
        {/* removed */}

        {/* ── Main wheel frame ── */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: 'transparent',
            boxShadow: 'none',
          }}
        >
          {/* Spinning conic layer (ref — this is what JS rotates) */}
          <div
            ref={ref}
            className="absolute rounded-full overflow-hidden"
            style={{
              inset: '0px',
              willChange: 'transform',
              background: `conic-gradient(from 0deg,
                ${accent.a}18, ${accent.b}28,
                rgba(255,255,255,0.04),
                ${accent.a}18, ${accent.b}28,
                rgba(255,255,255,0.04),
                ${accent.a}18
              )`,
              zIndex: 1,
            }}
          >
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-conic-gradient(rgba(255,255,255,0.05) 0% 30deg, transparent 30deg 60deg)`
            }} />
          </div>

          {/* Static content layer */}
          <div className="relative w-full h-full z-10 flex items-center justify-center" style={{ inset: '0px', position: 'absolute' }}>

            {spinning ? (
              /* ── Spinning state ── */
              <div className="relative flex items-center justify-center" style={{ width: '38%', aspectRatio: '1/1' }}>
                <div style={{
                  position: 'absolute', inset: '-8%',
                  border: `4px solid rgba(255,255,255,0.12)`,
                  borderTopColor: accent.a,
                  borderRightColor: accent.b,
                  borderRadius: '50%',
                  animation: 'spin-ring 0.75s linear infinite',
                }} />
                <div style={{
                  position: 'absolute', inset: '18%',
                  border: `3px solid rgba(255,255,255,0.08)`,
                  borderBottomColor: accent.b,
                  borderRadius: '50%',
                  animation: 'spin-ring 1.1s linear infinite reverse',
                }} />
                <div style={{
                  width: 16, height: 16,
                  background: `linear-gradient(135deg, ${accent.a}, ${accent.b})`,
                  borderRadius: '50%',
                  boxShadow: `0 0 24px ${accent.a}`,
                }} />
              </div>
            ) : (
              /* ── Image / idle state ── */
              <div
                className="relative flex flex-col items-center justify-center overflow-hidden rounded-full"
                style={{
                  position: 'absolute',
                  inset: '0px',
                  background: '#0a0e1c',
                  border: 'none',
                  boxShadow: 'none',
                  animation: showResult ? 'pop-in 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
                }}
              >
                <img
                  src={displayImage}
                  alt="Food"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    filter: !showResult
                      ? 'brightness(0.55) saturate(1.1) contrast(1.05)'
                      : 'brightness(1) saturate(1.2)',
                    transition: 'filter 0.5s ease',
                  }}
                />

                {/* Warm radial overlay on idle */}
                {/* {!showResult && (
                  <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at center, rgba(249,115,22,0.12) 0%, rgba(0,0,0,0.55) 100%)',
                  }} />
                )} */}

                {/* Overlay when NOT showing result */}
                {!showResult && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center z-20">
                    {!selectedMode ? (
                      /* No mode — typewriter */
                      <div
                        className="flex flex-col items-center gap-3 cursor-pointer hover:scale-105 transition-transform  cursor-default select-none"
                        onClick={onCenterClick}
                        title="Click to start"
                      >
                        <p style={{
                          fontFamily: "'Syne', sans-serif",
                          fontSize: 'clamp(14px, 4vw, 22px)',
                          fontWeight: 900,
                          lineHeight: 1.15,
                          minHeight: '2.4em',
                          background: `linear-gradient(to bottom, #fff 30%, ${accent.a})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <span dangerouslySetInnerHTML={{ __html: typedText }} />
                          {showCursor && <span className={`tw-cursor${isDeletingState ? ' deleting' : ''}`}>|</span>}
                        </p>
                        <div className={`
                          px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] text-white/80 font-bold uppercase tracking-widest
                          ${isTypingDone ? 'animate-select-mode' : 'opacity-0'}
                          ${pulseModes ? 'pulse-label-active' : ''}
                        `}>
                          Select Mode
                        </div>
                      </div>
                    ) : (
                      /* Mode selected — spin button */
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-[9px] font-black tracking-[0.35em] uppercase"
                          style={{ color: `${accent.a}cc` }}>
                          {selectedMode === 'online' ? 'Delivery' : 'Chef Mode'}
                        </p>
                        <button
                          onClick={onSpin}
                          disabled={loading || disabled}
                          className={`transition-transform active:scale-95 ${!loading && !disabled ? 'spin-button-ready' : 'opacity-50 cursor-not-allowed'}`}
                          style={{
                            background: `linear-gradient(135deg, ${accent.a}, ${accent.b})`,
                            color: '#fff',
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 900,
                            fontSize: '11px',
                            letterSpacing: '0.18em',
                            padding: '10px 22px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.25)',
                            cursor: loading || disabled ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {loading ? '• • •' : 'SPIN NOW'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center hub dot */}
          {/* <div
            className="absolute z-20 rounded-full pointer-events-none"
            style={{
              width: 10, height: 10,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, #fff 0%, ${accent.a} 100%)`,
              boxShadow: `0 0 12px ${accent.a}`,
            }}
          /> */}
        </div>
      </div>
      </div>

      {/* ── Food name below wheel ── */}
      {showResult && suggestedFood && !spinning && (
        <div className="animate-food-bounce w-full flex-shrink-0" style={{ textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(15px, 4vw, 20px)',
              fontWeight: 900,
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              background: `linear-gradient(90deg, ${accent.a}, #f5f2f2ff, ${accent.b})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatFoodName(suggestedFood.name)}
          </span>
        </div>
      )}
    </div>
  );
});

SpinWheel.displayName = 'SpinWheel';
export default SpinWheel;
