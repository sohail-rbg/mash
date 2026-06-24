"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import ShareCardCanvas from './ShareCardCanvas';

// ─── Logo-matched Neon Teal/Green Canvas Celebration ───────────────────────
const FloralCelebration = () => {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      pointer-events: none; z-index: 99999;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const COLORS = [
      '#00FFB3', '#00E5A0', '#00C882', '#00B4FF', 
      '#FF69B4', '#FF1493', '#FFD700', '#FFA500', 
    ];

    let particles = [];
    let animId;

    function createParticle(cx, cy, isWave = false) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isWave ? (5 + Math.random() * 7) : (10 + Math.random() * 12);
      const size = 7 + Math.random() * 8;
      const type = Math.floor(Math.random() * 4); 
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isWave ? 2 : 4),
        friction: 0.97 + Math.random() * 0.01, // Slightly higher friction for substantial feel
        gravity: 0.12 + Math.random() * 0.08, // Moderate gravity for smooth descent
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size, type,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        alpha: 1,
        fade: 0.004 + Math.random() * 0.004,
        wobble: 0.5 + Math.random() * 1.5,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobbleT: Math.random() * 100,
        sparkle: Math.random() * 0.1
      };
    }

    function drawParticle(p) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      
      // Dynamic Sparkle effect
      const currentSize = p.size * (1 + Math.sin(p.wobbleT * 2) * p.sparkle);
      
      if (['#00FFB3', '#00E5A0'].includes(p.color)) {
         ctx.shadowColor = p.color;
         ctx.shadowBlur = 10;
      }
      
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      
      if (p.type === 0) { // Petal
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(currentSize, -currentSize, currentSize, currentSize, 0, currentSize);
        ctx.bezierCurveTo(-currentSize, currentSize, -currentSize, -currentSize, 0, 0);
        ctx.fill();
      } else if (p.type === 1) { // Circle
        ctx.beginPath();
        ctx.arc(0, 0, currentSize/2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 2) { // 4-Point Sparkle
        ctx.beginPath();
        for(let i=0; i<4; i++) {
          ctx.rotate(Math.PI/2);
          ctx.lineTo(currentSize, 0);
          ctx.lineTo(0, currentSize/4);
        }
        ctx.fill();
      } else { // Heart
        ctx.beginPath();
        ctx.moveTo(0, currentSize/4);
        ctx.bezierCurveTo(currentSize/2, -currentSize/2, currentSize, currentSize/4, 0, currentSize);
        ctx.bezierCurveTo(-currentSize, currentSize/4, -currentSize/2, -currentSize/2, 0, currentSize/4);
        ctx.fill();
      }
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.alpha > 0 && p.y < canvas.height + 50);
      for (const p of particles) {
        p.wobbleT += p.wobbleSpeed;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vx += Math.sin(p.wobbleT) * p.wobble * 0.1;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.alpha -= p.fade;
        drawParticle(p);
      }
      if (particles.length > 0) {
        animId = requestAnimationFrame(animate);
      } else if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2.3;
    for (let i = 0; i < 160; i++) particles.push(createParticle(cx, cy));

    setTimeout(() => {
      for (let i = 0; i < 60; i++) {
        particles.push(createParticle(cx, cy, true));
      }
    }, 400);

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (document.body.contains(canvas)) document.body.removeChild(canvas);
    };
  }, []);

  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ConfirmedSelection({ suggestedFood, selectedMode, onRestart }) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [showShareCard, setShowShareCard] = useState(false);

  const cardUser = React.useMemo(() => ({
    name:  user?.fullName || 'Mash User',
    email: user?.primaryEmailAddress?.emailAddress || 'user@mash.com',
    image: user?.imageUrl || user?.image || user?.profileImageUrl || user?.avatar || '',
  }), [
    user?.fullName,
    user?.primaryEmailAddress?.emailAddress,
    user?.imageUrl, user?.image, user?.profileImageUrl, user?.avatar,
  ]);

  useEffect(() => {
    if (isSignedIn === false) {
      setShowShareCard(false);
      router.push('/');
    }
  }, [isSignedIn, router]);

  // Brand gradient: logo teal-green for both modes, with mode accent
  const nameGradient = selectedMode === 'online'
    ? 'linear-gradient(90deg, #00FFB3, #00B4FF, #00E5A0)'
    : 'linear-gradient(90deg, #00FFB3, #00E5A0, #00C882)';

  const handleGenerateCard = () => {
    setShowShareCard(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Playfair+Display:wght@700;800&display=swap');

        .cs-root {
          font-family: 'DM Sans', sans-serif;
          animation: fadeUpRoot 0.5s ease forwards;
        }
        @keyframes fadeUpRoot {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cs-share-transition {
          animation: sharePopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes sharePopIn {
          from { opacity: 0; transform: scale(0.92) translateY(30px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        .cs-food-img {
          animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }

        .cs-confetti {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px)   rotate(0deg); }
          50%       { transform: translateY(-10px) rotate(5deg); }
        }

        /* Neon glow pulse on the card border */
        .cs-card-glow {
          animation: glowPulse 2.5s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 18px rgba(0,255,179,0.18), var(--card-shadow, none); }
          50%       { box-shadow: 0 0 36px rgba(0,255,179,0.38), var(--card-shadow, none); }
        }

        .cs-back-btn {
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--glass-bg, rgba(0,0,0,0.2));
          border: 1px solid var(--glass-border, rgba(0,255,179,0.2));
          color: var(--text-muted, #aaa);
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
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          flex: 1;
          padding: 10px 0;
          border-radius: 16px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.03em;
          position: relative;
          overflow: hidden;
        }
        .cs-gen-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.15);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cs-gen-btn:hover::after { opacity: 1; }
        .cs-gen-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,255,179,0.55) !important;
        }
        .cs-gen-btn:active { transform: scale(0.97); }

        /* Mode badge */
        .cs-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 12px; border-radius: 50px;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
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
            background: 'var(--glass-bg, rgba(5,15,12,0.85))',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(0,255,179,0.22)',
            borderRadius: 24,
            margin: '0 auto',
          }}
        >
          {/* ✦ Full-page canvas celebration — fires on mount */}
          <FloralCelebration />

          {/* Corner confetti icon */}
          <div
            className="cs-confetti cs-confetti-pop"
            style={{ position: 'absolute', top: 18, right: 18, fontSize: 24, zIndex: 10 }}
          >
            🎉
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 'clamp(28px, 8vw, 42px)',
            fontWeight: 900,
            color: selectedMode === 'online' ? '#ffffff' : '#00FFB3', // DYNAMIC COLOR
            margin: '0 0 4px 0',
            lineHeight: 1.1,
            textShadow: selectedMode === 'online' 
              ? '0 0 20px rgba(0,180,255,0.4)' 
              : '0 0 20px rgba(0,255,179,0.4)',
          }}>
            Great Choice!
          </h2>
          <p style={{
            fontSize: 14,
            color: 'var(--text-muted, rgba(0,255,179,0.65))',
            fontWeight: 500,
            margin: '0 0 16px 0',
          }}>
            {selectedMode === 'online' ? "We'll help you order this online 🛵" : 'Time to get cooking! 🍳'}
          </p>

          {/* Food Image Card */}
          <div
            className="cs-food-img cs-card-glow"
            style={{
              background: 'var(--card-bg, rgba(0,20,15,0.9))',
              borderRadius: 24, padding: 10,
              maxWidth: 340, width: '100%',
              border: '1px solid rgba(0,255,179,0.18)',
              marginTop: 2,
            }}
          >
            <img
              src={suggestedFood?.image}
              alt={suggestedFood?.name}
              style={{
                width: '100%', height: 310,
                objectFit: 'cover', borderRadius: 18,
              }}
            />

            {/* Food Info Row: Name [Divider] Type */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginTop: 8,
              padding: '0 8px',
              // textAlign: 'left'
            }}>
              {/* Left Side: Food Name */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                  background: nameGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2
                }}>
                  {suggestedFood?.name}
                </h3>
              </div>

              {/* Center: Subtle Vertical Divider */}
              <div style={{ 
                width: '1px', 
                height: 24, 
                background: selectedMode === 'online' ? 'rgba(0,180,255,0.3)' : 'rgba(0,255,179,0.3)', 
                margin: '0 15px',
                flexShrink: 0 
              }} />

              {/* Right Side: Mode Badge */}
              <span className="cs-badge" style={{
                background: selectedMode === 'online'
                  ? 'rgba(0,180,255,0.15)'
                  : 'rgba(0,255,179,0.12)',
                color: selectedMode === 'online' ? '#00B4FF' : '#00FFB3',
                border: `1px solid ${selectedMode === 'online' ? 'rgba(0,180,255,0.35)' : 'rgba(0,255,179,0.35)'}`,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                padding: '4px 10px',
                fontSize: 10
              }}>
                {selectedMode === 'online' ? '🛵 Online' : '🍳 Cooking'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: 10,
            marginTop: 20, width: '100%',
            maxWidth: 320, alignItems: 'center',
          }}>
            {/* Back Icon */}
            <button onClick={onRestart} className="cs-back-btn" title="Start Over">
              ✕
            </button>

            {/* Main CTA */}
            <button
              onClick={handleGenerateCard}
              className="cs-gen-btn"
              style={{
                background: selectedMode === 'online'
                  ? 'linear-gradient(135deg, #007c4f, #92e6b8)'
                  : 'linear-gradient(135deg, #00FFB3, #00C882)',
                boxShadow: selectedMode === 'online'
                  ? '0 4px 20px rgba(56,155,96,0.4)'
                  : '0 4px 20px rgba(0,255,179,0.45)',
              }}
            >
              ✦ Generate Card
            </button>
          </div>
        </div>

      ) : (
        <div className="cs-share-transition">
          <ShareCardCanvas
            user={cardUser}
            food={suggestedFood}
            selectedMode={selectedMode}
            onClose={() => setShowShareCard(false)}
          />
        </div>
      )}
    </>
  );
}