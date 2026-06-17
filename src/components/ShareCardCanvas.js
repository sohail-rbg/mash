"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Link } from 'lucide-react';
import { cardThemes } from "@/lib/cardThemes";
import { drawTheme, drawBlob } from "@/lib/drawThemes";

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
  const [isSharing, setIsSharing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const drawCard = useCallback(async () => {
    if (!food || !user) return;
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Better performance
    const W = 900;
    
    // Determine Food Context for design
    const dietRaw = food.dietType?.[0] || food.category || '';
    const isVeg = dietRaw.toLowerCase().includes('veg') && !dietRaw.toLowerCase().includes('non');
    const accentColor = isVeg ? '#22c55e' : '#f97316';

    // Pre-calculate layout
    ctx.font = 'bold 48px serif';
    const preWords = food.name.split(' ');
    let preLines = [], preLine = '';
    preWords.forEach(w => {
      const t = preLine + w + ' ';
      if (ctx.measureText(t).width > 750 && preLine) {
        preLines.push(preLine.trim());
        preLine = w + ' ';
      } else preLine = t;
    });
    preLines.push(preLine.trim());

    const PAD = 44;
    const topH = 100;
    const imgH = 680;
    const imgY = topH + 40;
    const nameY = imgY + imgH + 70;
    const descY = nameY + preLines.length * 58 + 15;
    const H = descY + 160; // Increased for watermark and footer padding

    console.log("📏 Card Layout Calculated:", { name: food.name, lines: preLines.length, totalHeight: H, isVeg, accentColor });

    canvas.width = W;
    canvas.height = H;

    const themeName = cardThemes[refreshKey % cardThemes.length];
    const loadImg = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    try {
      const foodImg = await loadImg(food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800');
      let logoImg = null;
      try { logoImg = await loadImg('/assets/logo.png'); } catch {}

      console.log("🎨 Initializing Theme Drawing:", { themeName, refreshKey });

      // 1. DYNAMIC THEME & BACKGROUND ACCENTS
      const style = drawTheme(ctx, W, H, themeName);

      // Add organic mesh gradient blobs based on food type (Veg/Non-Veg)
      const secondaryColor = isVeg ? '#10b981' : '#f43f5e';
      drawBlob(ctx, 0, 0, 800, isVeg ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)');
      drawBlob(ctx, W, H * 0.5, 600, `${secondaryColor}15`);

      // Subtle texture overlay (Grain)
      ctx.save();
      ctx.globalAlpha = 0.035;
      for (let i = 0; i < 6500; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#fff' : style.accent;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2);
      }
      ctx.restore();

      // Subtle Vignette for focus
      const vignette = ctx.createRadialGradient(W/2, H/2, W/4, W/2, H/2, W);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = vignette;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';

      // Logo + App Name
      const logoSize = 54;
      const logoX = PAD, logoY = (topH - logoSize) / 2;

      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(logoX, logoY, logoSize, logoSize, 12);
        ctx.clip();
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = style.accent + 'dd';
        ctx.beginPath(); ctx.roundRect(logoX, logoY, logoSize, logoSize, 12); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `bold ${logoSize * 0.5}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('M', logoX + logoSize / 2, logoY + logoSize / 2);
        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = style.text;
      ctx.font = `bold 22px sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('Mash', logoX + logoSize + 12, logoY + logoSize * 0.38);
      ctx.fillStyle = style.muted;
      ctx.font = `400 14px sans-serif`;
      ctx.fillText('Food Discovery', logoX + logoSize + 12, logoY + logoSize * 0.72);
      ctx.restore();

      // User Info
      const userX = W - PAD;
      ctx.save();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillStyle = style.text;
      ctx.font = `bold 20px sans-serif`;
      ctx.fillText(user.name, userX, logoY + logoSize * 0.35);
      ctx.fillStyle = style.muted;
      ctx.font = `400 14px sans-serif`;
      ctx.fillText(user.email, userX, logoY + logoSize * 0.72);
      ctx.restore();

      // 2. PIXEL-PERFECT IMAGE FRAME
      const imgX = PAD, imgW = W - PAD * 2, r = 34; 
      ctx.save();
      // Integrated Glow
      ctx.shadowColor = accentColor; 
      ctx.shadowBlur = 60;
      // Double-stroke effect for "Hugged" border
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; 
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(imgX - 1, imgY - 1, imgW + 2, imgH + 2, r + 1); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath(); ctx.roundRect(imgX, imgY, imgW, imgH, r); ctx.clip();
      
      // Aspect fill the image
      const scale = Math.max(imgW / foodImg.width, imgH / foodImg.height);
      const iw = foodImg.width * scale, ih = foodImg.height * scale;
      ctx.drawImage(foodImg, imgX + (imgW - iw) / 2, imgY + (imgH - ih) / 2, iw, ih);

      const imgGrad = ctx.createLinearGradient(0, imgY + imgH * 0.55, 0, imgY + imgH);
      imgGrad.addColorStop(0, 'transparent');
      imgGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = imgGrad; ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.restore();

      // 3. PREMIUM GLASS BADGES
      const dietLabel = isVeg ? '🌱 VEG' : dietRaw ? `🍖 ${dietRaw.toUpperCase()}` : null;
      if (dietLabel) {
        const dx = imgX + 16, dy = imgY + 16, dw = 120, dh = 34;
        const dietColor = isVeg ? '#22c55e' : '#f97316';
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // Darker glass
        ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 17); ctx.fill();
        ctx.strokeStyle = dietColor; ctx.lineWidth = 1.5; ctx.stroke();
        
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(dietLabel, dx + dw / 2, dy + dh / 2);
        ctx.restore();
      }

      const cal = food.nutrition?.calories;
      if (cal) {
        const calText = `🔥 ${cal} kcal`;
        ctx.font = 'bold 16px sans-serif';
        const calW = ctx.measureText(calText).width + 24;
        const cx = imgX + imgW - calW - 16, cy = imgY + 16, ch = 34;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath(); ctx.roundRect(cx, cy, calW, ch, 17); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(calText, cx + calW / 2, cy + ch / 2);
        ctx.restore();
      }

      // 4. TYPOGRAPHY ENHANCEMENT
      ctx.save();
      ctx.font = 'bold 52px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

      preLines.forEach((l, i) => {
        const lw = ctx.measureText(l).width;
        const lg = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0); // Horizontal grad
        lg.addColorStop(0, '#ffffff');
        lg.addColorStop(0.5, style.gold);
        lg.addColorStop(1, '#ffffff');
        
        // Layered Shadow for "Floating" effect
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillText(l, W / 2 + 2, nameY + i * 58 + 3);
        ctx.restore();

        ctx.fillStyle = lg;
        ctx.fillText(l, W / 2, nameY + i * 58);
      });
      ctx.restore();

      // Description
      ctx.fillStyle = style.muted;
      ctx.font = '400 18px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText((food.description || 'Rich · Creamy · Delicious').slice(0, 55), W / 2, descY);

      // 5. SIGNATURE BRANDING FOOTER
      const footerY = H - 80;
      ctx.save();
      // Elegant Divider Line
      const lineGrd = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0);
      lineGrd.addColorStop(0, 'transparent');
      lineGrd.addColorStop(0.5, 'rgba(255,255,255,0.15)');
      lineGrd.addColorStop(1, 'transparent');
      ctx.strokeStyle = lineGrd;
      ctx.beginPath(); ctx.moveTo(W * 0.3, footerY - 20); ctx.lineTo(W * 0.7, footerY - 20); ctx.stroke();

      // M Logo Circle
      ctx.fillStyle = style.accent;
      ctx.beginPath(); ctx.arc(W / 2, footerY, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '900 14px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('M', W / 2, footerY + 1);

      // Watermark Text
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.letterSpacing = "5px";
      ctx.fillText("SHARED VIA MASH", W / 2, footerY + 40);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png', 0.93);
      setImgUrl(dataUrl);
    } catch (err) {
      console.error('Canvas draw failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [food, user, refreshKey]);

  useEffect(() => { drawCard(); }, [drawCard]);

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `mealmind-${food.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const getPublicBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin.replace(/\/$/, '');
    }

    const envUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL;

    return envUrl ? envUrl.replace(/\/$/, '') : '';
  };

  const getShareUrl = () => {
    const baseUrl = getPublicBaseUrl();
    const id = food?._id || food?.id || '';

    if (!baseUrl) {
      return '/';
    }

    if (!id) {
      return `${baseUrl}/share`;
    }

    return `${baseUrl}/share/${id}`;
  };

  const handleSocialShare = async (platform) => {
    if (!imgUrl || isSharing) return;
    setIsSharing(true);

    const openShareSite = () => {
      const url = platform === 'instagram'
        ? 'https://www.instagram.com/'
        : 'https://www.facebook.com/';
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    try {
      if (platform === 'link') {
        const shareUrl = getShareUrl();
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Share link copied to clipboard! 🔗\n\nThis link opens a preview page for your card.');
        } catch (err) {
          alert('Could not copy link automatically. Please copy it from your address bar.');
        }
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 0.93);
      });

      if (!blob) {
        throw new Error('Canvas blob generation failed');
      }

      const sanitizedName = food.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const fileName = `mealmind-${sanitizedName || 'food'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const shareUrl = getShareUrl();
      const shareData = {
        title: food.name,
        text: `Check out this delicious ${food.name}!`,
        url: shareUrl,
      };

      const canShareFiles =
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            files: [file],
            ...shareData,
          });
          return;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('File share failed, trying fallback:', err);
          } else {
            return;
          }
        }
      }

      // Try sharing the page URL/text when direct file sharing is unavailable.
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err.name === 'AbortError') {
            return;
          }
        }
      }

      // Copy image to clipboard when possible.
      let copiedImage = false;
      try {
        if (
          typeof ClipboardItem !== 'undefined' &&
          navigator.clipboard &&
          navigator.clipboard.write
        ) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
          copiedImage = true;
        }
      } catch (clipErr) {
        console.warn('Clipboard image copy failed:', clipErr);
      }

      if (copiedImage) {
        if (platform === 'instagram' || platform === 'facebook') {
          openShareSite();
          alert(
            `Card image copied! 🎨\n\nOpen ${platform === 'instagram' ? 'Instagram' : 'Facebook'} and paste it now.`
          );
        } else {
          alert('Card image copied to clipboard! 🎨');
        }
        return;
      }

      // Final fallback for browsers that cannot share directly.
      handleDownload();
      if (platform === 'instagram' || platform === 'facebook') {
        openShareSite();
        alert(
          'Card downloaded. Open the app/site and upload the saved image manually.'
        );
      } else {
        alert('Sharing is not supported on this browser right now. The card was downloaded instead.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Social share process failed', err);
        alert('Something went wrong while preparing the share card.');
      }
    } finally {
      setIsSharing(false);
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

        <div className={`aspect-[4/5] w-full bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden flex items-center justify-center relative mb-1 transition-all duration-500 ${isGenerating ? 'animate-card-shuffle' : 'animate-card-pop-in'}`}>
          {imgUrl ? (
            <img src={imgUrl} alt="Share card" className="w-full h-full object-contain transition-transform duration-700 ease-out" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[var(--text-muted)]">Crafting masterpiece...</p>
            </div>
          )}
        </div>

        <div className="mt-2 pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-2 px-1">
            <button 
              onClick={() => handleSocialShare('instagram')} 
              disabled={isSharing}
              className="flex flex-col items-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:rotate-6 group-active:scale-90">
                <Instagram size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[8px] font-bold text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">Post</span>
            </button>

            <button 
              onClick={() => handleSocialShare('facebook')} 
              disabled={isSharing}
              className="flex flex-col items-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6 group-active:scale-90">
                <Facebook size={20} strokeWidth={2.5} fill="currentColor" />
              </div>
              <span className="text-[8px] font-bold text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">Feed</span>
            </button>

            <button 
              onClick={() => handleSocialShare('link')} 
              disabled={isSharing}
              className="flex flex-col items-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white shadow-lg transition-all duration-300 group-hover:scale-125 group-active:scale-90">
                <Link size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[8px] font-bold text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">Link</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setRefreshKey(p => p + 1)}
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
              background: imgUrl && !isGenerating ? 'linear-gradient(135deg, #f97316, #fb923c)' : 'rgba(255,255,255,0.05)',
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