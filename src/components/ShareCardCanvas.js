"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '@/app/ThemeProvider';
import { Share2, X, Link } from 'lucide-react';

// Lucide removed brand icons in recent versions.
// We define them locally using standard Lucide SVG paths to fix the compilation error.
const Instagram = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

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
      { bg: '#020617', accent: '#06b6d4', gold: '#8b5cf6', text: '#ffffff', muted: 'rgba(255,255,255,0.6)', texture: 'mesh' },
      { bg: '#09090b', accent: '#f97316', gold: '#fde047', text: '#ffffff', muted: 'rgba(255,255,255,0.6)', texture: 'grid' },
      { bg: '#171717', accent: '#ef4444', gold: '#3b82f6', text: '#ffffff', muted: 'rgba(255,255,255,0.6)', texture: 'lines' },
      { bg: '#0c0a09', accent: '#22c55e', gold: '#a855f7', text: '#ffffff', muted: 'rgba(255,255,255,0.6)', texture: 'dots' },
    ] : [
      { bg: '#ffffff', accent: '#2563eb', gold: '#d97706', text: '#0f172a', muted: 'rgba(15,23,42,0.7)', texture: 'grid' },
      { bg: '#f8fafc', accent: '#059669', gold: '#0d9488', text: '#0f172a', muted: 'rgba(15,23,42,0.7)', texture: 'lines' },
      { bg: '#fff7ed', accent: '#ea580c', gold: '#c2410c', text: '#431407', muted: 'rgba(67,20,7,0.7)', texture: 'dots' },
      { bg: '#faf5ff', accent: '#7c3aed', gold: '#9333ea', text: '#1e1b4b', muted: 'rgba(30,27,75,0.7)', texture: 'none' },
      { bg: '#f0f9ff', accent: '#0ea5e9', gold: '#f59e0b', text: '#0c4a6e', muted: 'rgba(12,74,110,0.7)', texture: 'mesh' },
      { bg: '#fff1f2', accent: '#f43f5e', gold: '#fb923c', text: '#881337', muted: 'rgba(136,19,55,0.7)', texture: 'grid' },
      { bg: '#f0fdf4', accent: '#22c55e', gold: '#8b5cf6', text: '#14532d', muted: 'rgba(20,83,45,0.7)', texture: 'lines' },
      { bg: '#fffbeb', accent: '#f59e0b', gold: '#06b6d4', text: '#78350f', muted: 'rgba(120,53,15,0.7)', texture: 'dots' },
    ];

    const styleIndex = refreshKey % designStyles.length;
    const style = designStyles[styleIndex];

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

      // ── Complex Mesh Gradient Background ──
      const drawMeshBlob = (x, y, rx, ry, color, alpha, composite = 'source-over') => {
        ctx.save();
        ctx.globalCompositeOperation = composite;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = alpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      const compositeMode = theme === 'dark' ? 'screen' : 'multiply';
      // Layer 1: Corner deep accents
      drawMeshBlob(0, 0, 700, 600, style.accent, 0.5, compositeMode);
      drawMeshBlob(W, 0, 600, 800, style.gold, 0.4, compositeMode);
      drawMeshBlob(0, H, 800, 600, style.gold, 0.4, compositeMode);
      drawMeshBlob(W, H, 700, 700, style.accent, 0.5, compositeMode);

      // Layer 2: Drifting inner mesh (dynamic positions based on styleIndex)
      const offX = (styleIndex * 50) % 300;
      const offY = (styleIndex * 70) % 400;
      drawMeshBlob(W / 2 + offX, H / 3 + offY, 500, 400, style.accent, 0.3, compositeMode);
      drawMeshBlob(W / 2 - offX, (H * 2) / 3 - offY, 400, 500, style.gold, 0.3, compositeMode);
      
      // Layer 3: Subtle central highlights
      drawMeshBlob(W / 2, H / 2, 600, 600, theme === 'dark' ? '#ffffff' : style.accent, 0.06, 'overlay');

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
      } else if (style.texture === 'mesh') {
        ctx.save();
        ctx.globalAlpha = 0.08;
        const step = 80;
        for (let x = 0; x < W; x += step) {
          for (let y = 0; y < H; y += step) {
            ctx.fillStyle = (x + y) % (step * 2) === 0 ? style.accent : style.gold;
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();
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

      // ── Premium Decorative Geometry ──
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = style.gold;
      ctx.lineWidth = 1;
      const drawDecorations = (count) => {
        const seed = (refreshKey + 1) * 12345;
        const rnd = (i) => {
          const x = Math.sin(seed + i) * 10000;
          return x - Math.floor(x);
        };
        for (let i = 0; i < count; i++) {
          const x = rnd(i) * W;
          const y = rnd(i + 10) * H;
          const radius = 50 + rnd(i + 20) * 150;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();
          if (i % 2 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      };
      drawDecorations(6);
      ctx.restore();

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

  const handleSocialShare = async (platform) => {
    if (!imgUrl) return;
    
    try {
      // Convert dataUrl to a file for native sharing
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const fileName = `mealmind-${food.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // 1. Specific Logic for Social Platforms per request
      if (platform === 'instagram') {
        window.open('https://www.instagram.com/accounts/login/?hl=en', '_blank');
        return;
      }

      if (platform === 'facebook') {
        window.open('https://www.facebook.com/', '_blank');
        return;
      }

      // 2. Mobile/Native Share (Used for "More" button)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Check out my dish!',
          text: `I just discovered ${food.name} on #MealMind! 🍽️`,
        });
      } else if (platform === 'link') {
        // Copy Link Fallback
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied! 🔗");
      } else if (platform === 'instagram' || platform === 'facebook') {
        // Desktop Fallback: Copy Image to clipboard so users can PASTE it in Insta
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert("Image copied to clipboard! 🎨 Paste it into your post with #MealMind.");
        } catch (e) {
          window.open(platform === 'facebook' ? 'https://facebook.com' : 'https://instagram.com', '_blank');
        }
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Sharing failed:', err);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes card-shuffle {
          0% { transform: scale(1) rotate(0deg); filter: blur(0px); }
          50% { transform: scale(0.92) rotate(4deg); filter: blur(6px); opacity: 0.6; }
          100% { transform: scale(1) rotate(0deg); filter: blur(0px); }
        }
        @keyframes card-pop-in {
          0% { transform: scale(0.96) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-card-shuffle { animation: card-shuffle 0.6s cubic-bezier(0.45, 0, 0.55, 1); }
        .animate-card-pop-in { animation: card-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
      ` }} />

      <div style={{
        width: '90%',
        maxWidth: '420px',
        margin: '0 auto',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(40px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 28,
        padding: '16px',
        boxShadow: 'var(--card-shadow)',
        position: 'relative',
      }}>
        {/* Close/Back button moved to the main container */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-90 z-20 cursor-pointer"
          title="Close"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <h2 className="text-lg font-black text-center mb-3 text-[var(--text-main)] uppercase tracking-wider">
          Your Share Card
        </h2>

        {/* Card preview */}
        <div 
          className={`aspect-[4/5] w-full bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden flex items-center justify-center relative mb-1 transition-all duration-500 group/preview ${isGenerating ? 'animate-card-shuffle' : 'animate-card-pop-in'}`}
        >
          {imgUrl ? (
            <img src={imgUrl} alt="Share card" className="w-full h-full object-contain transition-transform duration-700 ease-out" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[var(--text-muted)]">Crafting masterpiece...</p>
            </div>
          )}
        </div>

        {/* Social Share Section - Grid style with Labels (Chrome/Post style) */}
        <div className="mt-2 pt-4 border-t border-white/10">
         {/* <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] mb-4 text-center">Share This Post</p> */}
          <div className="grid grid-cols-4 gap-2 px-1">
            <button
              onClick={() => handleSocialShare('instagram')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:rotate-6 group-active:scale-90">
                <Instagram size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[8px] font-bold text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">Post</span>
            </button>

            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6 group-active:scale-90">
                <Facebook size={20} strokeWidth={2.5} fill="currentColor" />
              </div>
              <span className="text-[8px] font-bold text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">Feed</span>
            </button>

            <button
              onClick={() => handleSocialShare('link')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white shadow-lg transition-all duration-300 group-hover:scale-125 group-active:scale-90">
                <Link size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[8px] font-bold text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">Link</span>
            </button>

            <button
              onClick={() => handleSocialShare('native')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white shadow-lg transition-all duration-300 group-hover:scale-125 group-active:scale-90">
                <Share2 size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[8px] font-bold text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">More</span>
            </button>
          </div>
        </div>

        {/* Main Action Row - Shuffle & Download combined */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setRefreshKey(p => p + 1);
            }}
            disabled={isGenerating}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-orange-500/30 text-orange-500 hover:bg-orange-500/10 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            {isGenerating ? '...' : 'Shuffle'}
          </button>

          <button
            onClick={handleDownload}
            disabled={!imgUrl || isGenerating}
            className="flex-[1.5] py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl text-white shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: imgUrl && !isGenerating
                ? 'linear-gradient(135deg, #f97316, #fb923c)'
                : 'rgba(255,255,255,0.05)',
              boxShadow: imgUrl && !isGenerating ? '0 6px 20px rgba(249,115,22,0.3)' : 'none'
            }}
          >
            Download
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}
