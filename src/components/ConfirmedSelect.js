"use client";
import React, { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import ShareCardCanvas from './ShareCardCanvas';
// import  {userSession} from "next-auth/react";

export default function ConfirmedSelection({ suggestedFood, selectedMode, mealTiming, dietType, onRestart }) {
  // const {data: session} = usesession();
  const { user } = useUser();
  const [showShareCard, setShowShareCard] = useState(false);

  // Gradient colors based on mode
  const nameGradient = selectedMode === 'online'
    ? 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'
    : 'linear-gradient(90deg, #22c55e, #10b981, #06b6d4)';

  const handleGenerateCard = () => {
    // Data was already saved in the previous step
    setShowShareCard(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
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
      ` }} />

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

          {/* Action buttons — one line */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, width: '100%', maxWidth: 300, alignItems: 'center' }}>
            {/* Back — small ✕ circle */}
            <button onClick={onRestart} className="cs-back-btn" title="Start Over">
              ✕
            </button>

            {/* Generate Card — highlighted */}
            <button
              onClick={handleGenerateCard}
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
              // name :session?.user?.name || 'MealMind User',
              // email: session?.user?.email || 'user@mealmind.com',
            
              name: user?.fullName || 'MealMind User',
              email: user?.primaryEmailAddress?.emailAddress || 'user@mealmind.com',
            }}
            food={suggestedFood}
            onClose={() => setShowShareCard(false)}
          />
        </div>
      )}
    </>
  );
}