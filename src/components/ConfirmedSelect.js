"use client";
import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import ShareCardCanvas from './ShareCardCanvas';

export default function ConfirmedSelection({ suggestedFood, selectedMode, onRestart }) {
  const { data: session } = useSession();
  const [showShareCard, setShowShareCard] = useState(false);

  // Gradient colors based on mode
  const nameGradient = selectedMode === 'online'
    ? 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'
    : 'linear-gradient(90deg, #22c55e, #10b981, #06b6d4)';

  return (
    <>
      <style>{`
        .cs-root {
          font-family: 'DM Sans', sans-serif;
          animation: fadeUpRoot 0.5s ease forwards;
        }
        @keyframes fadeUpRoot {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cs-share-transition {
          animation: sharePopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes sharePopIn {
          from { opacity: 0; transform: scale(0.92) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .cs-food-img {
          animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        .cs-confetti {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .cs-back-btn {
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          font-size: 16px;
          flex-shrink: 0;
        }
        .cs-back-btn:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.5);
          color: #ef4444;
          transform: scale(1.08);
        }
        .cs-back-btn:active { transform: scale(0.95); }
        .cs-gen-btn {
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
          cursor: pointer;
          flex: 1;
          padding: 10px 0;
          border-radius: 16px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 800;
          color: #fff;
          letter-spacing: 0.03em;
        }
        .cs-gen-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 8px 24px rgba(139,92,246,0.45) !important;
        }
        .cs-gen-btn:active { transform: scale(0.97); }
      `}</style>

      {!showShareCard ? (
        <div
          className="cs-root"
          style={{
            width: '90%',
            maxWidth: 'min(90vw, 400px)',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            alignItems: 'center', justifyContent: 'center',
            gap: 0, padding: '18px', textAlign: 'center',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(40px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 24,
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Corner confetti */}
          <div className="cs-confetti" style={{ position: 'absolute', top: 18, right: 18, fontSize: 22, opacity: 0.8 }}>🎉</div>

          {/* Heading */}
          <h2 style={{ fontSize: 'clamp(24px, 7vw, 38px)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px 0', lineHeight: 1.1 }}>
            Great Choice!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, margin: '0 0 10px 0' }}>
            {selectedMode === 'online' ? "We'll help you order this online 🛵" : 'Time to get cooking! 🍳'}
          </p>

          {/* Food Card */}
          <div
            className="cs-food-img"
            style={{
              background: 'var(--card-bg)',
              borderRadius: 20, padding: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              maxWidth: 320, width: '100%',
              border: '1px solid var(--glass-border)',
            }}
          >
            <img
              src={suggestedFood?.image}
              alt={suggestedFood?.name}
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 14 }}
            />
            {/* Food name with gradient */}
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 800,
              margin: '8px 0 4px 0',
              background: nameGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {suggestedFood?.name}
            </h3>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 50,
              background: selectedMode === 'online' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)',
              color: selectedMode === 'online' ? '#93c5fd' : '#86efac',
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {selectedMode === 'online' ? '🛵 Order Online' : '🍳 Self Cooking'}
            </span>
          </div>

          {/* Swiggy & Zomato — only for online mode */}
          {selectedMode === 'online' && (
            <div style={{ marginTop: 10, width: '100%', maxWidth: 300 }}>
              <p style={{
                fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center',
              }}>
                Find on
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href={`https://www.swiggy.com/search?query=${encodeURIComponent(suggestedFood?.name || '')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 0', borderRadius: 14, textDecoration: 'none', cursor: 'pointer',
                    border: '1.5px solid rgba(252,128,25,0.45)', background: 'rgba(252,128,25,0.07)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(252,128,25,0.18)'; e.currentTarget.style.borderColor = '#FC8019'; e.currentTarget.style.boxShadow = '0 0 12px rgba(252,128,25,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(252,128,25,0.07)'; e.currentTarget.style.borderColor = 'rgba(252,128,25,0.45)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="#FC8019"/>
                    <path d="M20 8c-5.5 0-9.5 4-9.5 9 0 3.5 2 6.5 5 8l-1 5 5-2.5c.5.1 1 .1 1.5.1 5.5 0 9.5-4 9.5-9S25.5 8 20 8z" fill="white"/>
                    <circle cx="16" cy="19" r="1.5" fill="#FC8019"/>
                    <circle cx="20" cy="19" r="1.5" fill="#FC8019"/>
                    <circle cx="24" cy="19" r="1.5" fill="#FC8019"/>
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FC8019' }}>Swiggy</span>
                </a>
                <a
                  href={`https://www.zomato.com/search?q=${encodeURIComponent(suggestedFood?.name || '')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 0', borderRadius: 14, textDecoration: 'none', cursor: 'pointer',
                    border: '1.5px solid rgba(226,55,68,0.45)', background: 'rgba(226,55,68,0.07)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,55,68,0.18)'; e.currentTarget.style.borderColor = '#E23744'; e.currentTarget.style.boxShadow = '0 0 12px rgba(226,55,68,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(226,55,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(226,55,68,0.45)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="#E23744"/>
                    <path d="M14 13l6 14 6-14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 19h20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#E23744' }}>Zomato</span>
                </a>
              </div>
            </div>
          )}

          {/* Action buttons — one line */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, width: '100%', maxWidth: 300, alignItems: 'center' }}>
            {/* Back — small ✕ circle */}
            <button onClick={onRestart} className="cs-back-btn" title="Start Over">
              ✕
            </button>

            {/* Generate Card — highlighted */}
            <button
              onClick={() => setShowShareCard(true)}
              className="cs-gen-btn"
              style={{
                background: selectedMode === 'online'
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  : 'linear-gradient(135deg, #22c55e, #10b981)',
                boxShadow: selectedMode === 'online'
                  ? '0 4px 18px rgba(139,92,246,0.4)'
                  : '0 4px 18px rgba(34,197,94,0.4)',
              }}
            >
              ✦ Generate Card
            </button>
          </div>
        </div>
      ) : (
        <div className="cs-share-transition">
          <ShareCardCanvas
            user={{
              name: session?.user?.name || 'MealMind User',
              email: session?.user?.email || 'user@mealmind.com',
            }}
            food={suggestedFood}
            onClose={() => setShowShareCard(false)}
          />
        </div>
      )}
    </>
  );
}