"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '@/app/ThemeProvider';

export default function ShareCardCanvas({ food, user, onClose }) {
  const canvasRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { theme } = useTheme();

  const drawCard = useCallback(async () => {
    if (!food || !user) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const W = 900;

    // ── Pre-calculate layout to get exact canvas height ──
    // badge: y=32, h=26 → bottom=58
    // nameY = 58+38 = 96, email = 96+26=122, divider = 96+44=140
    // imgY = 140+16=156, imgH=700 → imgBottom=856
    // nameBlock = 856+30=886, nameLines≈1, nameBottom=886+56=942
    // desc = 942+8=950, branding = 950+44=994, H = 994+20=1014
    // We'll compute precisely after measuring text
    canvas.width = W;

    const designStyles = theme === 'dark' ? [
      { bg: '#000000', accent: '#3b82f6', gold: '#fbbf24', text: '#ffffff', muted: 'rgba(255,255,255,0.6)', texture: 'grid' },
      { bg: '#0f172a', accent: '#10b981', gold: '#34d399', text: '#ffffff', muted: 'rgba(255,255,255,0.6)', texture: 'lines' },
      { bg: '#1e1b4b', accent: '#818cf8', gold: '#e879f9', text: '#ffffff', muted: 'rgba(255,255,255,0.6)', texture: 'dots' },
      { bg: '#18181b', accent: '#f43f5e', gold: '#fb923c', text: '#ffffff', muted: 'rgba(255,255,255,0.6)', texture: 'none' },
    ] : [
      { bg: '#ffffff', accent: '#2563eb', gold: '#d97706', text: '#0f172a', muted: 'rgba(15,23,42,0.7)', texture: 'grid' },
      { bg: '#f8fafc', accent: '#059669', gold: '#0d9488', text: '#0f172a', muted: 'rgba(15,23,42,0.7)', texture: 'lines' },
      { bg: '#fff7ed', accent: '#ea580c', gold: '#c2410c', text: '#431407', muted: 'rgba(67,20,7,0.7)', texture: 'dots' },
      { bg: '#faf5ff', accent: '#7c3aed', gold: '#9333ea', text: '#1e1b4b', muted: 'rgba(30,27,75,0.7)', texture: 'none' },
    ];

    const style = designStyles[refreshKey % designStyles.length];

    const loadImg = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    try {
      const foodImg = await loadImg(food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800');

      // ── Pre-calculate H based on food name line count ──
      ctx.font = 'italic 800 36px serif';
      const preWords = food.name.split(' ');
      let preLines = [], preLine = '';
      preWords.forEach(w => {
        const t = preLine + w + ' ';
        if (ctx.measureText(t).width > 720 && preLine) { preLines.push(preLine.trim()); preLine = w + ' '; }
        else preLine = t;
      });
      preLines.push(preLine.trim());

      const by = 28, badgeH = 28;          // badge: compact pill
      const nameY  = by + badgeH + 32;     // name just below badge
      const dividerY = nameY + 42;         // divider below email
      const imgY   = dividerY + 20;        // image starts
      const imgH   = 700;                  // image height
      const nameBlockY = imgY + imgH + 60; // food name below image
      const descY  = nameBlockY + preLines.length * 40;
      const brandingY  = descY + 100;
      const H = brandingY + 100;            // canvas height — snug

      canvas.height = H;

      // Background
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);

      // Glow blobs
      const blob = (x, y, rx, ry, color, alpha) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      if (refreshKey % 2 === 0) {
        blob(W / 2, -80, 400, 300, style.accent, 0.3);
        blob(W * 0.8, H * 0.9, 300, 280, style.gold, 0.2);
      } else {
        blob(100, 100, 280, 280, style.accent, 0.25);
        blob(W - 100, 150, 250, 250, style.gold, 0.25);
      }

      // Texture
      ctx.save();
      ctx.globalAlpha = theme === 'dark' ? 0.05 : 0.07;
      ctx.strokeStyle = style.text;
      if (style.texture === 'lines') {
        for (let i = -H; i < W + H; i += 55) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
        }
      } else if (style.texture === 'grid') {
        for (let i = 0; i < W; i += 45) ctx.fillRect(i, 0, 1, H);
        for (let j = 0; j < H; j += 45) ctx.fillRect(0, j, W, 1);
      } else if (style.texture === 'dots') {
        ctx.fillStyle = style.text;
        for (let i = 30; i < W; i += 55)
          for (let j = 30; j < H; j += 55) {
            ctx.beginPath(); ctx.arc(i, j, 1.8, 0, Math.PI * 2); ctx.fill();
          }
      }
      ctx.restore();

      // ── Top badge ──
      const badgeW = 210, bx = (W - badgeW) / 2;
      ctx.save();
      ctx.shadowColor = style.accent; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.roundRect(bx, by, badgeW, badgeH, badgeH / 2);
      ctx.fillStyle = style.accent + 'cc'; ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = '700 11px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✦ EXCLUSIVE DISCOVERY ✦', W / 2, by + badgeH / 2);

      // ── User Info — compact, no avatar ──
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'center';
      ctx.fillStyle = style.text;
      ctx.font = '800 32px sans-serif';
      ctx.fillText(user.name.toUpperCase(), W / 2, nameY);

      // Email — small muted text, tight below name
      ctx.fillStyle = style.muted;
      ctx.font = '400 18px sans-serif';
      ctx.fillText(user.email.toLowerCase(), W / 2, nameY + 26);

      // Gradient divider
      const divGrad = ctx.createLinearGradient(100, 0, W - 100, 0);
      divGrad.addColorStop(0, 'transparent');
      divGrad.addColorStop(0.5, style.accent + '88');
      divGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = divGrad; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(100, dividerY); ctx.lineTo(W - 100, dividerY); ctx.stroke();

      // ── Food Image ──
      const imgX = 50, imgW = 800, r = 32;

      // Glow border
      ctx.save();
      ctx.shadowColor = style.accent; ctx.shadowBlur = 28;
      ctx.strokeStyle = style.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(imgX - 4, imgY - 4, imgW + 8, imgH + 8, r + 4); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = style.gold + '99'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(imgX - 1, imgY - 1, imgW + 2, imgH + 2, r + 1); ctx.stroke();

      // Draw image
      ctx.save();
      ctx.beginPath(); ctx.roundRect(imgX, imgY, imgW, imgH, r); ctx.clip();
      ctx.drawImage(foodImg, imgX, imgY, imgW, imgH);
      ctx.restore();

      // ── Diet badge — top-left of image ──
      const dietRaw = food.dietType?.[0] || food.category || '';
      const isVeg = dietRaw.toLowerCase().includes('veg') && !dietRaw.toLowerCase().includes('non');
      const dietLabel = isVeg ? '🌱 VEG' : dietRaw ? `🍖 ${dietRaw.toUpperCase()}` : null;
      const dietColor = isVeg ? '#22c55e' : '#ef4444';
      const dietBg   = isVeg ? 'rgba(34,197,94,0.88)' : 'rgba(239,68,68,0.88)';

      if (dietLabel) {
        const dx = imgX + 16, dy = imgY + 16, dw = 118, dh = 34;
        ctx.save();
        ctx.shadowColor = dietColor; ctx.shadowBlur = 10;
        ctx.fillStyle = dietBg;
        ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 17); ctx.fill();
        ctx.strokeStyle = dietColor; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 17); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '700 17px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(dietLabel, dx + dw / 2, dy + dh / 2);
        ctx.restore();
      }

      // ── Food Name — BELOW image, gradient text ──
      ctx.save();
      ctx.font = 'italic 800 36px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

      // Word-wrap with per-line gradient
      const nameWords = food.name.split(' ');
      let nameLines = [], nameLine = '';
      nameWords.forEach(word => {
        const test = nameLine + word + ' ';
        if (ctx.measureText(test).width > 720 && nameLine) { nameLines.push(nameLine.trim()); nameLine = word + ' '; }
        else nameLine = test;
      });
      nameLines.push(nameLine.trim());
      nameLines.forEach((l, i) => {
        const lw = ctx.measureText(l).width;
        const lg = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0);
        lg.addColorStop(0, style.accent);
        lg.addColorStop(0.5, style.gold);
        lg.addColorStop(1, style.accent);
        ctx.fillStyle = lg;
        ctx.fillText(l, W / 2, nameBlockY + i * 46);
      });
      ctx.restore();

      // ── Description — tight below food name ──
      ctx.fillStyle = style.muted;
      ctx.font = '400 19px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText((food.description || 'Rich · Creamy · Delicious').slice(0, 52), W / 2, descY);

      // ── MealMind branding — snug at bottom ──
      ctx.fillStyle = style.accent;
      ctx.font = '800 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🍽  MealMind', W / 2, brandingY);

      const dataUrl = canvas.toDataURL('image/png', 0.92);
      setImgUrl(dataUrl);

    } catch (err) {
      console.error('Canvas draw failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [food, user, refreshKey, theme]);

  useEffect(() => { drawCard(); }, [drawCard]);

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `mealmind-${food.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <>
      <div style={{
        width: '92%',
        maxWidth: '420px',
        margin: '0 auto',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(40px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 28,
        padding: '24px',
        boxShadow: 'var(--card-shadow)',
      }}>
        <h2 className="text-2xl font-black text-center mb-4 text-[var(--text-main)]">
          Your Share Card
        </h2>

        {/* Card preview */}
        <div className="aspect-[4/5] w-full bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden border border-[var(--glass-border)] flex items-center justify-center relative">
          {imgUrl ? (
            <img src={imgUrl} alt="Share card" className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[var(--text-muted)]">Crafting masterpiece...</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-3">
          {/* Cancel */}
          <button
            onClick={onClose}
            className="
              flex-1 py-3 text-sm font-bold rounded-2xl cursor-pointer
              border border-[var(--glass-border)] text-[var(--text-main)]
              transition-all duration-200
              hover:bg-red-500/10 hover:border-red-400/60 hover:text-red-500
              dark:hover:bg-red-500/15 dark:hover:border-red-400/50 dark:hover:text-red-400
              active:scale-95
            "
          >
            ✕ Cancel
          </button>

          {/* Shuffle */}
          <button
            onClick={() => setRefreshKey(p => p + 1)}
            disabled={isGenerating}
            className="
              flex-1 py-3 text-sm font-bold rounded-2xl cursor-pointer
              border border-orange-500/40 text-orange-500
              transition-all duration-200
              hover:bg-orange-500/15 hover:border-orange-400 hover:text-orange-400
              hover:shadow-[0_0_14px_rgba(249,115,22,0.35)]
              active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {isGenerating ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-orange-400/40 border-t-orange-400 rounded-full animate-spin" />
              </span>
            ) : '⟳ Shuffle'}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!imgUrl || isGenerating}
            className="
              py-3 text-sm font-extrabold rounded-2xl text-white
              transition-all duration-200
              active:scale-95 disabled:cursor-not-allowed
            "
            style={{
              flex: 1.4,
              cursor: imgUrl && !isGenerating ? 'pointer' : 'not-allowed',
              background: imgUrl && !isGenerating
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'rgba(34,197,94,0.3)',
              border: imgUrl && !isGenerating
                ? '1.5px solid rgba(34,197,94,0.5)'
                : '1.5px solid rgba(34,197,94,0.2)',
              boxShadow: imgUrl && !isGenerating
                ? '0 4px 20px rgba(34,197,94,0.35)'
                : 'none',
              letterSpacing: '0.03em',
            }}
            onMouseEnter={e => {
              if (!imgUrl || isGenerating) return;
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(34,197,94,0.55), 0 0 0 2px rgba(34,197,94,0.35)';
              e.currentTarget.style.border = '1.5px solid rgba(34,197,94,0.85)';
              e.currentTarget.style.filter = 'brightness(1.08)';
            }}
            onMouseLeave={e => {
              if (!imgUrl || isGenerating) return;
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.35)';
              e.currentTarget.style.border = '1.5px solid rgba(34,197,94,0.5)';
              e.currentTarget.style.filter = '';
            }}
          >
            ↓ Download
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}
