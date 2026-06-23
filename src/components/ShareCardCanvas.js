"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Link } from 'lucide-react';
import { cardThemes, cardThemeLabels } from "@/lib/cardThemes";
import { drawTheme, drawBlob, drawTitleOrnament, drawSteam } from "@/lib/drawThemes";

// Local brand icons
const Instagram = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// Squircle Helper
function squirclePath(ctx, cx, cy, w, h, r = 0.38) {
  const n = 4 / (1 - r * 0.7);
  const steps = 120;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    const x = cx + w * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const y = cy + h * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// Dynamic Food Image Drawer - Ornate Indian Arch + Rounded Luxury
function drawFoodImage(ctx, foodImg, cx, cy, side, themeName, accentColor) {
  ctx.save();

  const isCircle = ['midnightNoir', 'purpleGlow', 'cyberBlue'].includes(themeName);
  const isLuxury = ['luxuryGold', 'minimalLight', 'darkElegant'].includes(themeName);
  const isSoftSquare = ['orangeSpice', 'ecoLuxury'].includes(themeName);
  const isIndian = themeName === 'orangeSpice' || themeName === 'orangesoft';

  // Enhanced Glow Effect
  const glowRadius = side / 2;
  const gradGlow = ctx.createRadialGradient(cx, cy, glowRadius * 0.7, cx, cy, glowRadius * 2);
  gradGlow.addColorStop(0, accentColor + '40');
  gradGlow.addColorStop(0.5, accentColor + '20');
  gradGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = gradGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, glowRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  if (isIndian) {
    // Enhanced Ornate Arch Frame
    const archW = side * 1.18;
    const archH = side * 1.15;
    
    // Outer golden glow with multiple layers
    ctx.save();
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 60;
    ctx.strokeStyle = 'rgba(251,191,36,0.5)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(cx - archW/2, cy - archH/2 + 25, archW, archH, side * 0.5);
    ctx.stroke();
    ctx.restore();
    
    // Inner golden border
    ctx.save();
    ctx.strokeStyle = 'rgba(251,191,36,0.5)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.roundRect(cx - archW/2 + 18, cy - archH/2 + 40, archW - 36, archH - 36, side * 0.47);
    ctx.stroke();
    ctx.restore();

    // Middle decorative border
    ctx.save();
    ctx.strokeStyle = 'rgba(251,191,36,0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.roundRect(cx - archW/2 + 30, cy - archH/2 + 52, archW - 60, archH - 60, side * 0.44);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    
    // Decorative corner ornaments
    ctx.save();
    const ornaments = [
      [cx - archW/2 + 25, cy - archH/2 + 45, -0.3],
      [cx + archW/2 - 25, cy - archH/2 + 45, 0.3],
      [cx - archW/2 + 25, cy + archH/2 - 25, 0.3],
      [cx + archW/2 - 25, cy + archH/2 - 25, -0.3]
    ];
    ornaments.forEach(([x, y, rot]) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;
      
      // Small decorative diamond
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 8);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.fill();
      
      // Small circle around diamond
      ctx.strokeStyle = 'rgba(251,191,36,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
    
    // Clip and draw food with enhanced quality
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - side/2, cy - side/2, side, side, side * 0.4);
    ctx.clip();
    
    // Draw food with slight zoom for better presentation
    const scale = Math.max((side * 1.12) / foodImg.width, (side * 1.12) / foodImg.height);
    const iw = foodImg.width * scale;
    const ih = foodImg.height * scale;
    ctx.drawImage(foodImg, cx - iw / 2, cy - ih / 2, iw, ih);
    ctx.restore();
  } 
  else if (isCircle) {
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max((side * 1.12) / foodImg.width, (side * 1.12) / foodImg.height);
    const iw = foodImg.width * scale;
    const ih = foodImg.height * scale;
    ctx.drawImage(foodImg, cx - iw / 2, cy - ih / 2, iw, ih);
  } 
  else if (isLuxury) {
    const radius = side * 0.48;
    ctx.roundRect(cx - side/2, cy - side/2, side, side, radius);
    ctx.clip();
    const scale = Math.max((side * 1.12) / foodImg.width, (side * 1.12) / foodImg.height);
    const iw = foodImg.width * scale;
    const ih = foodImg.height * scale;
    ctx.drawImage(foodImg, cx - iw / 2, cy - ih / 2, iw, ih);
  } 
  else if (isSoftSquare) {
    ctx.roundRect(cx - side/2, cy - side/2, side, side, side * 0.12);
    ctx.clip();
    const scale = Math.max((side * 1.12) / foodImg.width, (side * 1.12) / foodImg.height);
    const iw = foodImg.width * scale;
    const ih = foodImg.height * scale;
    ctx.drawImage(foodImg, cx - iw / 2, cy - ih / 2, iw, ih);
  } 
  else {
    squirclePath(ctx, cx, cy, side/2, side/2, 0.38);
    ctx.clip();
    const scale = Math.max((side * 1.12) / foodImg.width, (side * 1.12) / foodImg.height);
    const iw = foodImg.width * scale;
    const ih = foodImg.height * scale;
    ctx.drawImage(foodImg, cx - iw / 2, cy - ih / 2, iw, ih);
  }

  // Enhanced Inner Highlight for depth
  const highlight = ctx.createRadialGradient(cx, cy - side * 0.3, side * 0.05, cx, cy, side * 0.75);
  highlight.addColorStop(0, 'rgba(255,255,255,0.25)');
  highlight.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  highlight.addColorStop(1, 'transparent');
  ctx.fillStyle = highlight;
  ctx.fillRect(cx - side/2, cy - side/2, side, side);

  // Bottom subtle shadow
  const shadow = ctx.createRadialGradient(cx, cy + side * 0.5, side * 0.1, cx, cy + side * 0.5, side * 0.8);
  shadow.addColorStop(0, 'rgba(0,0,0,0.1)');
  shadow.addColorStop(1, 'transparent');
  ctx.fillStyle = shadow;
  ctx.fillRect(cx - side/2, cy - side/2, side, side);

  ctx.restore();
}

export default function ShareCardCanvas({ food, user, selectedMode, onClose }) {
  const canvasRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const activeThemeKey = cardThemes[refreshKey % cardThemes.length];
  const activeThemeLabel = cardThemeLabels[activeThemeKey] || activeThemeKey;

  const drawCard = useCallback(async () => {
    if (!food || !user) return;
    setIsGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    const W = 900;

    const dietRaw = food.dietType?.[0] || food.category || '';
    const isVeg = dietRaw.toLowerCase().includes('veg') && !dietRaw.toLowerCase().includes('non');
    const accentColor = isVeg ? '#22c55e' : '#f97316';

    // Food name - better wrapping
    const foodNameUpper = food.name.toUpperCase();
    ctx.font = 'bold 44px serif';
    const preWords = foodNameUpper.split(' ');
    let preLines = [], preLine = '';
    preWords.forEach(w => {
      const t = preLine + w + ' ';
      if (ctx.measureText(t).width > 480 && preLine) {
        preLines.push(preLine.trim());
        preLine = w + ' ';
      } else preLine = t;
    });
    preLines.push(preLine.trim());

    // Enhanced spacing for better visual balance
    const PAD = 40;
    const topH = 180;
    const imgH = 680;
    const imgY = topH + 90;
    const nameY = imgY + imgH + 110;
    const H = nameY + (preLines.length * 60) + 100;
    const footerY = H - 40;

    canvas.width = W;
    canvas.height = H;

    const themeName = activeThemeKey;

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
      try { logoImg = await loadImg('/assets/logo.png'); } catch (e) {}

      const style = drawTheme(ctx, W, H, themeName);

      // Enhanced background effects
      const secondaryColor = isVeg ? '#10b981' : '#f43f5e';
      drawBlob(ctx, 0, 0, 800, isVeg ? `${style.accent}25` : `${style.gold || style.accent}20`);
      drawBlob(ctx, W, H * 0.5, 600, `${secondaryColor}15`);

      // Refined grain texture
      ctx.save();
      ctx.globalAlpha = 0.025;
      for (let i = 0; i < 8000; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#fff' : style.accent;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
      }
      ctx.restore();

      // Enhanced vignette
      const vignette = ctx.createRadialGradient(W/2, H/2, W/3, W/2, H/2, W);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(0.6, 'transparent');
      vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = vignette;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';

      // === LOGO - Enhanced Design ===
      const logoSize = 110;
      const logoX = PAD;
      const logoY = (topH - logoSize) / 2 + 5;

      // Logo background glow
      ctx.save();
      const logoGlow = ctx.createRadialGradient(logoX + logoSize/2, logoY + logoSize/2, 0, logoX + logoSize/2, logoY + logoSize/2, logoSize);
      logoGlow.addColorStop(0, `${style.accent}30`);
      logoGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = logoGlow;
      ctx.beginPath();
      ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (logoImg) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 4;
        ctx.roundRect(logoX, logoY, logoSize, logoSize, 18);
        ctx.clip();
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      } else {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = style.accent;
        ctx.roundRect(logoX, logoY, logoSize, logoSize, 18);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${logoSize * 0.5}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('M', logoX + logoSize / 2, logoY + logoSize / 2);
        ctx.restore();
      }

      // === User/Brand Details - Dynamic from API ===
      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      // User name (dynamic from API)
      const userName = (user.name || 'Guest User').toUpperCase();
      ctx.fillStyle = style.text;
      ctx.font = `bold 22px sans-serif`;
      ctx.letterSpacing = '2px';
      ctx.fillText(userName, W - PAD, logoY + logoSize * 0.32);
      
      // User email (dynamic from API)
      const userEmail = user.email || 'user@example.com';
      ctx.fillStyle = style.muted;
      ctx.font = `500 13px sans-serif`;
      ctx.letterSpacing = '0.5px';
      ctx.fillText(userEmail, W - PAD, logoY + logoSize * 0.72);
      ctx.restore();

      // === FOOD IMAGE - Enhanced Size ===
      const imgW = W - PAD * 2;
      const foodSide = Math.min(imgW * 0.90, imgH * 0.94);
      const foodCX = W / 2;
      const foodCY = imgY + imgH / 2 + 8;

      drawFoodImage(ctx, foodImg, foodCX, foodCY, foodSide, themeName, accentColor);
      drawSteam(ctx, foodCX, foodCY - foodSide * 0.4, foodSide * 0.8);

      // === Enhanced VEG Badge ===
      ctx.save();
      const dx = PAD + 20;
      const dy = imgY - 70;
      const chipText = isVeg ? '🌱 VEG' : `🍖 ${dietRaw?.toUpperCase() || 'FOOD'}`;
      const chipWidth = Math.max(120, ctx.measureText(chipText).width + 50);
      const dietColor = isVeg ? '#22c55e' : '#f97316';
      
      // Badge background with gradient
      const dietGrad = ctx.createLinearGradient(dx, dy, dx + chipWidth, dy + 40);
      dietGrad.addColorStop(0, `${dietColor}f5`);
      dietGrad.addColorStop(1, `${dietColor}dd`);

      ctx.save();
      ctx.shadowColor = `${dietColor}66`;
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = dietGrad;
      ctx.roundRect(dx, dy, chipWidth, 40, 20);
      ctx.fill();
      
      // Inner border glow
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      ctx.roundRect(dx, dy, chipWidth, 40, 20);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '900 14px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(chipText, dx + chipWidth / 2, dy + 20);
      ctx.restore();

      // === ENHANCED ORDER ONLINE Badge - Transparent Background ===
      if (selectedMode) {
        const isOnline = selectedMode === 'online';
        const modeLabel = isOnline ? 'ORDER ONLINE' : 'SELF COOKING';
        const icon = isOnline ? '🛵' : '🍳';
        const fullText = `${icon}  ${modeLabel}`;
        
        ctx.font = '900 13px sans-serif';
        ctx.letterSpacing = '2px';
        const textMetrics = ctx.measureText(fullText);
        
        const badgeW = textMetrics.width + 40;
        const badgeH = 40;
        const badgeX = W - PAD - badgeW - 20;
        const badgeY = dy;
        
        // Theme-based colors for transparent badge
        const primaryColor = style.accent;
        const secondaryColor2 = style.gold || style.accent;
        
        const badgeBorderGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
        badgeBorderGrad.addColorStop(0, primaryColor);
        badgeBorderGrad.addColorStop(0.5, secondaryColor2);
        badgeBorderGrad.addColorStop(1, primaryColor);
        
        ctx.save();
        // TRANSPARENT background (no fill)
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 3;
        
        // Only border with theme color
        ctx.strokeStyle = badgeBorderGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 20);
        ctx.stroke();
        
        // Text with theme color
        ctx.fillStyle = style.text;
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fullText, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
        ctx.restore();
      }

      // === Enhanced Calories Badge ===
      const cal = food.nutrition?.calories;
      if (cal) {
        const calText = `🔥 ${cal} kcal`;
        ctx.font = 'bold 14px sans-serif';
        const calW = ctx.measureText(calText).width + 28;
        const calX = W - PAD - calW - 20;
        const calY = imgY + imgH - 48;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.roundRect(calX, calY, calW, 34, 17);
        ctx.fill();
        
        // Subtle border
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.roundRect(calX, calY, calW, 34, 17);
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(calText, calX + calW / 2, calY + 17);
        ctx.restore();
      }

      // === Food Name Typography - Enhanced ===
      ctx.save();
      const isOrangeSoft = themeName === 'orangesoft' || themeName === 'orangeSpice';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      preLines.forEach((l, i) => {
        const lw = ctx.measureText(l).width;
        const textGradient = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0);

        let fontStyle = '900 50px serif';
        let letterSpacing = '2px';

        if (isOrangeSoft) { 
          fontStyle = '900 54px serif'; 
          letterSpacing = '4px'; 
        }

        ctx.font = fontStyle;
        ctx.letterSpacing = letterSpacing;

        textGradient.addColorStop(0, style.text);
        textGradient.addColorStop(0.3, style.accent);
        textGradient.addColorStop(0.7, style.accent);
        textGradient.addColorStop(1, style.text);

        const nameStartY = nameY + (i * 62);
        
        // Text shadow for depth
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(l, W / 2 + 2, nameStartY + 4);
        ctx.restore();

        // Main text with gradient
        ctx.save();
        ctx.fillStyle = textGradient;
        ctx.shadowColor = `${style.accent}99`;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeText(l, W / 2, nameStartY);
        ctx.fillText(l, W / 2, nameStartY);
        ctx.restore();
      });
      ctx.restore();

      // === Enhanced Title Ornament ===
      const titleBottomY = nameY + (preLines.length - 1) * 62 + 36;
      drawTitleOrnament(ctx, W, titleBottomY, style, themeName, H);

      // === Date at bottom right - Moved UP with more spacing from bottom ===
      ctx.save();
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = style.muted;
      ctx.font = '600 16px sans-serif';
      ctx.letterSpacing = '2px';
      // Changed from H - 15 to H - 45 to move date up (more bottom padding)
      ctx.fillText(dateStr, W - PAD, H - 45);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png', 0.95);
      setImgUrl(dataUrl);
    } catch (err) {
      console.error('Canvas draw failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [food, user, refreshKey, selectedMode, activeThemeKey]);

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
        canvas.toBlob(resolve, 'image/png', 0.95);
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
          50% { transform: scale(0.99) rotate(4deg); filter: blur(6px); opacity: 0.6; }
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

        <h2 className="text-lg font-black text-center mb-1 text-[var(--text-main)] uppercase tracking-wider">
          Your Share Card
        </h2>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
          {activeThemeLabel} <span className="opacity-50">· {refreshKey % cardThemes.length + 1}/{cardThemes.length}</span>
        </p>

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