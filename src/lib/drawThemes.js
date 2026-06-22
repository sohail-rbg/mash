/**
 * drawThemes.js
 * Canvas background renderers for the Share Card — 10 themes, matching the
 * reference design board 1:1 (name + visual tags):
 *
 *  1. Dark Elegant    – Wood Texture · Warm Glow · Soft Shadow · Leaf Particles
 *  2. Neon Blue       – Neon Border · Dots Pattern · Blue Glow · Floating Leaves
 *  3. Green Fresh     – Green Gradient · Leaf Elements · Soft Light · Clean Look
 *  4. Minimal Light   – White Clean BG · Green Accent · Soft Shadow · Leaf Speckles
 *  5. Purple Glow     – Purple Gradient · Neon Circles · Glow Effect · Modern Look
 *  6. Orange Spice    – Spice Splash · Orange Accent · Brush Stroke · Bold Look
 *  7. Cyber Blue      – Tech Lines · Futuristic Frame · Blue Highlights · Modern UI
 *  8. Soft Pastel     – Pastel Gradient · Brush Stroke · Soft Shadow · Gentle Look
 *  9. Luxury Gold     – Gold Accents · Premium Shine · Wave Lines · Elegant Look
 * 10. Glass Morphism  – Glass Effect · Floating Leaves · Blur BG · Clean UI
 */

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(rand(0, arr.length))];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function withAlpha(color, alpha) {
  const normalized = color.trim();
  const safeAlpha = clamp(alpha, 0, 1);

  const hexMatch = normalized.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map((char) => char + char).join('');
    }
    if (hex.length >= 6) {
      const fullHex = hex.slice(0, 6);
      const r = parseInt(fullHex.slice(0, 2), 16);
      const g = parseInt(fullHex.slice(2, 4), 16);
      const b = parseInt(fullHex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }
  }

  const rgbaMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const values = rgbaMatch[1]
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (values.length >= 3) {
      const [r, g, b] = values;
      return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }
  }

  return normalized;
}

/* ----------------------------------------------------------------------- */
/*  Generic primitives (also used directly by ShareCardCanvas.jsx)         */
/* ----------------------------------------------------------------------- */

/** Soft radial gradient blob for background depth. */
export function drawBlob(ctx, x, y, radius, color) {
  ctx.save();
  const grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grd.addColorStop(0, color);
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Elliptical mesh-gradient blob, supports blend modes for richer color mixing. */
export function drawMeshBlob(ctx, x, y, rx, ry, color, alpha, composite = 'source-over') {
  ctx.save();
  ctx.globalCompositeOperation = composite;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry) * 1.1);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'transparent');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Fine repeating texture overlay — dots grid by default. */
export function drawThemeTexture(ctx, W, H, textureType = 'dots', color = '#ffffff') {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  if (textureType === 'dots') {
    for (let i = 35; i < W; i += 48) {
      for (let j = 35; j < H; j += 48) {
        ctx.beginPath();
        ctx.arc(i, j, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/* ----------------------------------------------------------------------- */
/*  Decorative helpers used by individual themes below                     */
/* ----------------------------------------------------------------------- */

/** A single simple leaf silhouette with a center vein, rotated freely. */
function drawLeaf(ctx, x, y, size, rotation, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.65, -size * 0.25, 0, size);
  ctx.quadraticCurveTo(-size * 0.65, -size * 0.25, 0, -size);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = Math.max(0.6, size * 0.07);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8);
  ctx.lineTo(0, size * 0.8);
  ctx.stroke();
  ctx.restore();
}

/** Scatters several leaves around the canvas — used for "Floating Leaves" / "Leaf Particles". */
function drawLeafScatter(ctx, W, H, count, color, opts = {}) {
  const { sizeMin = 9, sizeMax = 20, alphaMin = 0.1, alphaMax = 0.26, pad = 50 } = opts;
  for (let i = 0; i < count; i++) {
    const x = rand(pad, W - pad);
    const y = rand(pad, H - pad);
    const size = rand(sizeMin, sizeMax);
    drawLeaf(ctx, x, y, size, rand(0, Math.PI * 2), color, rand(alphaMin, alphaMax));
  }
}

/** A couple of larger, sparse leaf "elements" placed near corners (Green Fresh). */
function drawLeafElements(ctx, W, H, color) {
  const spots = [
    [W * 0.1, H * 0.08, 26, -0.4],
    [W * 0.92, H * 0.06, 22, 0.6],
    [W * 0.06, H * 0.94, 24, 0.3],
    [W * 0.9, H * 0.95, 20, -0.5],
  ];
  spots.forEach(([x, y, size, rot]) => drawLeaf(ctx, x, y, size, rot, color, 0.5));
}

/** Subtle warm wood-grain streaks. */
function drawWoodTexture(ctx, W, H, color = '#000000') {
  ctx.save();
  ctx.strokeStyle = color;
  for (let y = 10; y < H; y += rand(16, 28)) {
    ctx.beginPath();
    ctx.lineWidth = rand(1, 2.4);
    ctx.globalAlpha = rand(0.035, 0.1);
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 36) {
      ctx.lineTo(x, y + Math.sin(x * 0.018 + y) * 5);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Glowing rounded-rect border, hugging the edges — "Neon Border" / "Futuristic Frame". */
function drawNeonBorder(ctx, W, H, color, inset = 26, radius = 28) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, radius);
  ctx.stroke();
  ctx.restore();
}

/** Sci-fi corner brackets — "Futuristic Frame". */
function drawCornerBrackets(ctx, W, H, color, inset = 30, len = 46) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.globalAlpha = 0.6;
  const corners = [
    [inset, inset, 1, 1],
    [W - inset, inset, -1, 1],
    [inset, H - inset, 1, -1],
    [W - inset, H - inset, -1, -1],
  ];
  corners.forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + len * dy);
    ctx.lineTo(x, y);
    ctx.lineTo(x + len * dx, y);
    ctx.stroke();
  });
  ctx.restore();
}

/** Thin circuit-style lines with node dots — "Tech Lines". */
function drawCircuitLines(ctx, W, H, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.1;
  const rows = 7;
  for (let i = 0; i < rows; i++) {
    const y = rand(50, H - 50);
    let x = 0;
    ctx.globalAlpha = rand(0.1, 0.2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    while (x < W) {
      x += rand(55, 130);
      ctx.lineTo(x, y + rand(-22, 22));
    }
    ctx.stroke();
    for (let n = 0; n < 2; n++) {
      ctx.globalAlpha = rand(0.25, 0.45);
      ctx.beginPath();
      ctx.arc(rand(40, W - 40), y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Soft paint-splatter cluster — "Spice Splash". */
function drawSpiceSplash(ctx, W, H, color) {
  ctx.save();
  drawMeshBlob(ctx, W * 0.06, H * 0.94, 260, 230, color, 0.55, 'screen');
  drawMeshBlob(ctx, W * 0.96, H * 0.05, 160, 140, color, 0.35, 'screen');
  ctx.fillStyle = color;
  for (let i = 0; i < 30; i++) {
    const x = rand(0, W * 0.32);
    const y = rand(H * 0.62, H);
    ctx.globalAlpha = rand(0.15, 0.45);
    ctx.beginPath();
    ctx.arc(x, y, rand(1.4, 6), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A wide, soft, angled brush stroke — "Brush Stroke". */
function drawBrushStroke(ctx, cx, cy, w, h, color, alpha, rotation = -0.18) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Slow sine-wave lines sweeping the canvas — "Wave Lines". */
function drawWaveLines(ctx, W, H, color, count = 4) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < count; i++) {
    const baseY = rand(H * 0.15, H * 0.88);
    const amp = rand(18, 46);
    const freq = rand(0.006, 0.013);
    ctx.globalAlpha = rand(0.12, 0.26);
    ctx.beginPath();
    for (let x = 0; x <= W; x += 12) {
      const y = baseY + Math.sin(x * freq + i * 1.7) * amp;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Large soft glowing ring outlines + tiny stars — "Neon Circles" / "Glow Effect". */
function drawNeonCircles(ctx, W, H, color, count = 4) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = rand(1, 2.2);
    ctx.globalAlpha = rand(0.12, 0.3);
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.arc(rand(0, W), rand(0, H), rand(50, 170), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 16; i++) {
    ctx.globalAlpha = rand(0.2, 0.55);
    ctx.beginPath();
    ctx.arc(rand(0, W), rand(0, H), rand(0.8, 1.8), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Diagonal premium shine sweep + tiny gold flecks — "Premium Shine". */
function drawGoldShine(ctx, W, H, color) {
  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.42, withAlpha(color, 0.1));
  grad.addColorStop(0.5, withAlpha(color, 0.22));
  grad.addColorStop(0.58, withAlpha(color, 0.1));
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = withAlpha(color, 0.18);
  for (let i = 0; i < 24; i++) {
    ctx.globalAlpha = rand(0.2, 0.55);
    ctx.beginPath();
    ctx.arc(rand(0, W), rand(0, H), rand(0.7, 2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws a sophisticated architectural grid for luxury themes.
 */
export function drawArchitecturalGrid(ctx, W, H, color, spacing = 180) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.12;
  
  for (let x = 0; x <= W; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    // Intersection dots
    for (let y = 0; y <= H; y += spacing) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  for (let y = 0; y <= H; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws elegant, organic gold flourishes (scrolls/curves).
 */
export function drawOrganicFlourish(ctx, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.45;
  
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.5, -size * 0.5, size, 0, size * 0.5, size * 0.5);
  ctx.stroke();
  
  // Tiny petal/leaf at the end
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

/**
 * Draws a 3D perspective cyber grid with floor and back-wall.
 */
export function drawCyberGrid(ctx, W, H, color) {
  ctx.save();
  const horizonY = H * 0.65;
  const centerX = W / 2;
  const gridColor = color || 'rgba(148,163,184,0.15)';
  
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.8;

  // 1. Perspective Floor Lines (Radiating from vanishing point)
  const floorLineCount = 18;
  for (let i = 0; i <= floorLineCount; i++) {
    const xBottom = (W / floorLineCount) * i;
    ctx.beginPath();
    ctx.moveTo(centerX, horizonY);
    ctx.lineTo(xBottom, H);
    ctx.stroke();
  }

  // 2. Converging Horizontal Floor Lines
  const depthLines = 14;
  for (let i = 0; i < depthLines; i++) {
    const y = horizonY + (H - horizonY) * Math.pow(i / depthLines, 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    
    // Intersection Dots
    for (let j = 0; j <= floorLineCount; j++) {
      const x = centerX + ( (W / floorLineCount) * j - centerX ) * ((y - horizonY) / (H - horizonY));
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5 * (i / depthLines);
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // 3. Back Wall Grid
  const wallSpacing = 60;
  ctx.globalAlpha = 0.08;
  for (let x = 0; x <= W; x += wallSpacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, horizonY); ctx.stroke();
    for (let y = 0; y <= horizonY; y += wallSpacing) {
       ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  for (let y = 0; y <= horizonY; y += wallSpacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  ctx.restore();
}

/** A few glassy bubble spheres, bottom-right weighted — "Blur BG" / glass details. */
function drawBubbles(ctx, W, H, count = 3) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rand(W * 0.58, W * 0.97);
    const y = rand(H * 0.55, H * 0.97);
    const r = rand(22, 72);
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.26)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

/** Faint speckle dust — "Leaf Speckles" / fine grain for light themes. */
function drawSpeckles(ctx, W, H, color, count = 90) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = rand(0.05, 0.16);
    ctx.beginPath();
    ctx.arc(rand(0, W), rand(0, H), rand(0.6, 1.6), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ----------------------------------------------------------------------- */
/*  Main entry point — paints the full themed background                   */
/* ----------------------------------------------------------------------- */

export function drawTheme(ctx, W, H, themeName) {
  let style = {
    bg: '#0f172a',
    accent: '#f97316',
    gold: '#fbbf24',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.75)',
  };

  const PAD = 44;
  ctx.save();

  switch (themeName) {

    /* 1 — Dark Elegant: Noir Couture · Satin Wood · Gold Flourish · Amber Glow */
    case 'darkElegant': {
      style = { bg: '#0d0805', accent: '#f59e0b', gold: '#fbbf24', text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      
      // Espresso Satin Wood Texture
      drawWoodTexture(ctx, W, H, '#000000');
      
      // Soft Satin Varnish (Sleek diagonal light sweeps)
      drawGoldShine(ctx, W, H, 'rgba(245,158,11,0.06)');
      
      // Warm Amber Spotlight
      drawMeshBlob(ctx, W * 0.1, H * 0.9, 450, 350, 'rgba(245,158,11,0.18)', 1, 'screen');
      drawMeshBlob(ctx, W * 0.7, H * 0.1, 500, 400, 'rgba(251,191,36,0.12)', 1, 'screen');
      
      // Gold Organic Flourishes
      drawOrganicFlourish(ctx, PAD, H - PAD * 2.5, 120, -0.4, style.gold);
      drawOrganicFlourish(ctx, W - PAD, PAD * 2.5, 90, 2.8, style.gold);
      
      // Subtle Leaf Scatter (Fewer, more deliberate)
      drawLeafScatter(ctx, W, H, 3, '#fbbf24', { alphaMin: 0.08, alphaMax: 0.18 });
      break;
    }

    /* 2 — Midnight Noir: 3D Cyber Grid · Obsidian Deep · Studio Spotlight · Cinematic Digital */
    case 'midnightNoir': {
      style = { bg: '#02040a', accent: '#00ff9f', gold: '#d1fae5', text: '#ffffff', muted: 'rgba(148,163,184,0.7)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      
      // 3D Cyber Grid
      drawCyberGrid(ctx, W, H, 'rgba(0,255,159,0.18)');
      
      // Studio Spotlight Rays
      drawLightRays(ctx, W, H, '#fff', 0.14);
      
      // Cinematic Grain & Space Dust
      ctx.save();
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 4500; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#fff' : '#00ff9f';
        ctx.fillRect(Math.random() * W, Math.random() * H, 0.9, 0.9);
      }
      ctx.restore();
      
      drawNeonBorder(ctx, W, H, 'rgba(0,255,159,0.35)', 26, 28);
      break;
    }

    /* 3 — Eco Luxury: Sage Green · Linen Texture · Architectural Grid · Organic Gold */
    case 'ecoLuxury': {
      style = { bg: '#121a12', accent: '#d4af37', gold: '#fde68a', text: '#fdf6e3', muted: 'rgba(253,246,227,0.7)' };
      const eg = ctx.createLinearGradient(0, 0, W, H);
      eg.addColorStop(0, '#121a12');
      eg.addColorStop(1, '#1e291e');
      ctx.fillStyle = eg;
      ctx.fillRect(0, 0, W, H);
      
      // Architectural Grid
      drawArchitecturalGrid(ctx, W, H, style.accent, 160);
      
      // Squared Box Framing
      ctx.save();
      ctx.strokeStyle = style.accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      ctx.strokeRect(32, 32, W - 64, H - 64);
      ctx.restore();
      
      // Organic light sweeps
      drawBrushStroke(ctx, W * 0.5, H * 0.5, W * 1.4, H * 0.5, 'rgba(212,175,55,0.06)', 1, 0.5);
      
      // Soft leaf elements
      drawLeafScatter(ctx, W, H, 3, '#2d3b2d', { alphaMin: 0.3, alphaMax: 0.5 });
      break;
    }

    /* 4 — Minimal Dark Gold: Obsidian BG · Star Dust · Studio Light Rays · Magic Sparkles ✨ */
    case 'minimalLight': {
      style = { bg: '#0f172a', accent: '#fbbf24', gold: '#fbbf24', text: '#f8fafc', muted: 'rgba(248,250,252,0.6)' };
      
      // 1. Deep Obsidian Gradient
      const darkGrad = ctx.createLinearGradient(0, 0, 0, H);
      darkGrad.addColorStop(0, '#040812');
      darkGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Advanced Visuals: Star Dust & Studio Rays
      drawStarDust(ctx, W, H, '#ffffff', 45);
      drawLightRays(ctx, W, H, '#fbbf24', 0.06);

      // 3. Elegant Minimal Gold Waves
      ctx.save();
      ctx.strokeStyle = 'rgba(251,191,36,0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-50, H * 0.84);
      ctx.bezierCurveTo(W * 0.35, H * 0.76, W * 0.65, H * 0.94, W + 50, H * 0.86);
      ctx.stroke();
      ctx.restore();

      // 4. Magic Design Stickers (Hand-Drawn)
      drawGourmetStickers(ctx, W, H, style.accent, 4, 0.15);

      // 4. Magic Sparkle Emoji ✨ (Subtle background integration)
      ctx.save();
      ctx.font = '26px serif';
      ctx.globalAlpha = 0.12;
      ctx.fillText('✨', W * 0.12, H * 0.18);
      ctx.fillText('✨', W * 0.88, H * 0.72);
      ctx.restore();

      // 5. Studio Vignette for focus
      const vig = ctx.createRadialGradient(W / 2, H * 0.45, W * 0.2, W / 2, H * 0.45, W * 0.9);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
      break;
    }

    /* 5 — Purple Glow: Purple Gradient · Neon Circles · Glow Effect · Modern Look */
    case 'purpleGlow': {
      style = { bg: '#1a0f2e', accent: '#a855f7', gold: '#ec4899', text: '#ffff', muted: 'rgba(243,232,255,0.78)' };
      const pg = ctx.createLinearGradient(0, 0, W, H);
      pg.addColorStop(0, '#160a26');
      pg.addColorStop(1, '#2b1450');
      ctx.fillStyle = pg;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.5, H * 0.32, 520, 460, '#a855f7', 0.3, 'screen');
      drawNeonCircles(ctx, W, H, '#c084fc', 5);
      drawNeonBorder(ctx, W, H, '#a855f7', 25, 30);
      break;
    }

    /* 6 — Orange Spice: Spice Splash · Orange Accent · Brush Stroke · Bold Look */
    case 'orangeSpice': {
      style = { bg: '#160d0a', accent: '#f97316', gold: '#fbbf24', text: '#ffffff', muted: 'rgba(255,237,213,0.78)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawBrushStroke(ctx, W * 0.62, H * 0.4, W * 1.1, H * 0.5, 'rgba(249,115,22,0.16)', 1);
      drawSpiceSplash(ctx, W, H, '#ef4444');
      drawMeshBlob(ctx, W * 0.98, H * 0.06, 200, 170, '#f97316', 0.3, 'screen');
      break;
    }

    /* 7 — Cyber Blue: Tech Lines · Futuristic Frame · Blue Highlights · Modern UI */
    case 'cyberBlue': {
      style = { bg: '#020617', accent: '#22d3ee', gold: '#38bdf8', text: '#e0f2fe', muted: 'rgba(224,242,254,0.72)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.5, H * 0.5, 600, 520, '#0891b2', 0.18, 'screen');
      drawCircuitLines(ctx, W, H, '#22d3ee');
      drawCornerBrackets(ctx, W, H, '#22d3ee');
      break;
    }

    /* 8 — Soft Pastel: Pastel Gradient · Brush Stroke · Soft Shadow · Gentle Look */
    case 'softPastel': {
      style = { bg: '#fdf7fb', accent: '#ec4899', gold: '#fb923c', text: '#3b2d5a', muted: 'rgba(59,45,90,0.68)' };
      const pas = ctx.createLinearGradient(0, 0, W, H);
      pas.addColorStop(0, '#fce7f3');
      pas.addColorStop(0.48, '#f9f5ff');
      pas.addColorStop(1, '#dbeafe');
      ctx.fillStyle = pas;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.18, H * 0.18, 420, 360, '#f9a8d4', 0.58);
      drawMeshBlob(ctx, W * 0.82, H * 0.76, 520, 440, '#93c5fd', 0.45);
      drawBrushStroke(ctx, W * 0.38, H * 0.62, W * 0.82, H * 0.22, 'rgba(255,255,255,0.4)', 1, 0.18);
      drawBlob(ctx, W * 0.5, H * 0.9, 330, 'rgba(255,255,255,0.18)');
      break;
    }

    /* 9 — Luxury Gold: Gold Accents · Premium Shine · Wave Lines · Elegant Look */
    case 'luxuryGold': {
      style = { bg: '#0c0a06', accent: '#d4af37', gold: '#fde68a', text: '#fdf6e3', muted: 'rgba(253,246,227,0.7)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(W / 2, H * 0.35, 60, W / 2, H * 0.35, Math.max(W, H) * 0.7);
      glow.addColorStop(0, 'rgba(212,175,55,0.12)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      drawWaveLines(ctx, W, H, '#d4af37', 5);
      drawStarDust(ctx, W, H, '#ffffff', 45);
      drawGoldShine(ctx, W, H, '#d4af37');
      drawGourmetStickers(ctx, W, H, style.gold, 5, 0.2);
      break;
    }

    /* 10 — Glass Morphism: Glass Effect · Floating Leaves · Blur BG · Clean UI */
    case 'glassMorphism': {
      style = { bg: '#0c1626', accent: '#3b82f6', gold: '#7dd3fc', text: '#ffffff', muted: 'rgba(224,242,254,0.8)' };
      const gm = ctx.createLinearGradient(0, 0, 0, H);
      gm.addColorStop(0, '#0c1626');
      gm.addColorStop(1, '#16243a');
      ctx.fillStyle = gm;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.18, H * 0.2, 600, 500, '#3b82f6', 0.34, 'screen');
      drawMeshBlob(ctx, W * 0.88, H * 0.78, 640, 540, '#7dd3fc', 0.26, 'screen');
      drawBubbles(ctx, W, H, 3);
      drawLeafScatter(ctx, W, H, 5, '#86efac', { sizeMin: 10, sizeMax: 18, alphaMin: 0.12, alphaMax: 0.22 });
      // Glass panel — translucent frosted border hugging the card
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(30, 30, W - 60, H - 60);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(30, 30, W - 60, H - 60);
      ctx.restore();
      break;
    }

    default: {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#1e2937');
      grad.addColorStop(1, '#334155');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Fine dot-grid overlay shared by every theme, tying the set together.
  drawThemeTexture(ctx, W, H, 'dots', style.text);

  ctx.restore();
  return style;
}

export function drawTitleOrnament(ctx, W, y, style, themeName) {
  ctx.save();
  const centerX = W / 2;
  const lw = W * 0.44; 
  const x1 = centerX - lw / 2;
  const x2 = centerX + lw / 2;

  switch (themeName) {
    case 'darkElegant':
    case 'luxuryGold': {
      // Luxury Triple Line with Gold highlights and center diamond
      const drawSubLine = (dy, width, alpha, weight) => {
        const gl = ctx.createLinearGradient(centerX - width/2, 0, centerX + width/2, 0);
        gl.addColorStop(0, 'transparent');
        gl.addColorStop(0.5, style.gold + alpha);
        gl.addColorStop(1, 'transparent');
        ctx.strokeStyle = gl;
        ctx.lineWidth = weight;
        ctx.beginPath();
        ctx.moveTo(centerX - width/2, y + dy);
        ctx.lineTo(centerX + width/2, y + dy);
        ctx.stroke();
      };
      
      drawSubLine(-5, lw * 0.6, '33', 1);
      drawSubLine(0, lw, 'bb', 2.2);
      drawSubLine(5, lw * 0.6, '33', 1);

      // Center Diamond
      ctx.fillStyle = style.gold;
      ctx.shadowColor = style.gold;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(centerX, y - 7);
      ctx.lineTo(centerX + 7, y);
      ctx.lineTo(centerX, y + 7);
      ctx.lineTo(centerX - 7, y);
      ctx.closePath();
      ctx.fill();

      // Accents
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(centerX - 24, y, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(centerX + 24, y, 2.2, 0, Math.PI * 2); ctx.fill();
      
      // Design Stickers
      drawFork(ctx, centerX + lw/2 + 20, y, 16, style.gold, 0.4);
      drawSpoon(ctx, centerX - lw/2 - 20, y, 16, style.gold, 0.4);
      break;
    }

    case 'midnightNoir':
    case 'purpleGlow': {
      // High-Glow tech line with side markers
      ctx.shadowColor = style.accent;
      ctx.shadowBlur = 24;
      const grad = ctx.createLinearGradient(x1, 0, x2, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.2, style.accent + '22');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(0.8, style.accent + '22');
      grad.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();

      // Sharp side dots
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(centerX - lw/4, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(centerX + lw/4, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(centerX, y, 4.5, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case 'cyberBlue': {
      // Tech Brackets with tech lines
      ctx.strokeStyle = style.accent;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = style.accent;
      ctx.shadowBlur = 10;

      // Brackets [ ]
      const bs = 10;
      ctx.beginPath();
      ctx.moveTo(x1 + bs, y - bs); ctx.lineTo(x1, y - bs); ctx.lineTo(x1, y + bs); ctx.lineTo(x1 + bs, y + bs);
      ctx.moveTo(x2 - bs, y - bs); ctx.lineTo(x2, y - bs); ctx.lineTo(x2, y + bs); ctx.lineTo(x2 - bs, y + bs);
      ctx.stroke();

      // Tech dots and dashes
      ctx.setLineDash([15, 6, 2, 6]);
      ctx.beginPath();
      ctx.moveTo(x1 + 15, y);
      ctx.lineTo(x2 - 15, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = style.accent;
      ctx.beginPath(); ctx.arc(centerX, y, 4, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case 'ecoLuxury': {
      // Organic "Vine" style line
      const g = ctx.createLinearGradient(x1, 0, x2, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.5, style.accent);
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.5;
      
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.quadraticCurveTo(centerX - lw/4, y - 6, centerX, y);
      ctx.quadraticCurveTo(centerX + lw/4, y + 6, x2, y);
      ctx.stroke();

      // Leaf clusters
      drawLeaf(ctx, centerX, y, 8, -0.2, style.accent, 1);
      drawLeaf(ctx, centerX - 12, y - 4, 5, -0.6, style.accent, 0.7);
      break;
    }

    case 'orangeSpice':
    case 'softPastel': {
      // Layered brush strokes for a "painterly" feel
      drawBrushStroke(ctx, centerX, y, lw, 14, style.accent, 0.45, 0.03);
      drawBrushStroke(ctx, centerX, y, lw * 0.7, 6, '#ffffff', 0.5, 0.03);
      
      // Paint splatters
      ctx.fillStyle = style.accent;
      for(let i=0; i<8; i++) {
        const ox = (Math.random() - 0.5) * lw * 0.8;
        const oy = (Math.random() - 0.5) * 10;
        ctx.globalAlpha = 0.4 + Math.random() * 0.4;
        ctx.beginPath(); ctx.arc(centerX + ox, y + oy, 1.5 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case 'minimalLight': {
      // Minimal Gold Dark Ornament (High contrast for dark background)
      ctx.strokeStyle = 'rgba(251,191,36,0.3)';
      ctx.lineWidth = 1.2;
      
      // Elegant thin horizontal lines
      ctx.beginPath();
      ctx.moveTo(x1 + 40, y);
      ctx.lineTo(centerX - 15, y);
      ctx.moveTo(centerX + 15, y);
      ctx.lineTo(x2 - 40, y);
      ctx.stroke();

      // Glowing Center Diamond
      ctx.fillStyle = style.accent;
      ctx.shadowColor = style.accent;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(centerX, y - 7);
      ctx.lineTo(centerX + 7, y);
      ctx.lineTo(centerX, y + 7);
      ctx.lineTo(centerX - 7, y);
      ctx.closePath();
      ctx.fill();
      
      // Double accent dots
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(centerX - 25, y, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(centerX + 25, y, 2, 0, Math.PI * 2); ctx.fill();

      // Fork and Spoon Stickers
      drawFork(ctx, centerX - 55, y, 14, style.accent, 0.6);
      drawSpoon(ctx, centerX + 55, y, 14, style.accent, 0.6);

      // Mini Sparkle ✨
      ctx.font = '16px serif';
      ctx.fillText('✨', centerX - lw * 0.45, y + 4);
      ctx.fillText('✨', centerX + lw * 0.45, y + 4);
      break;
    }

    case 'glassMorphism': {
      // Reflective highly-polished glass line
      const g = ctx.createLinearGradient(x1, 0, x2, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.3, 'rgba(255,255,255,0.15)');
      g.addColorStop(0.5, '#ffffff');
      g.addColorStop(0.7, 'rgba(255,255,255,0.15)');
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g;
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(255,255,255,0.5)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
      
      // Reflective speckle
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(centerX + lw * 0.1, y, 1.5, 0, Math.PI * 2); ctx.fill();
      break;
    }

    default: {
      // Default: Elegant gradient line with center dot cluster
      const g = ctx.createLinearGradient(x1, 0, x2, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.5, style.accent);
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
      
      ctx.fillStyle = style.accent;
      ctx.beginPath(); ctx.arc(centerX, y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(centerX, y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draws random glowing star particles for premium polish
 */
export function drawStarDust(ctx, W, H, color, count = 60) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = 0.5 + Math.random() * 2;
    const opacity = 0.2 + Math.random() * 0.8;
    
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 4;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    if (size > 1.6) {
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x - size * 3, y); ctx.lineTo(x + size * 3, y);
      ctx.moveTo(x, y - size * 3); ctx.lineTo(x, y + size * 3);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Draws subtle diagonal rays of studio light for premium polish
 */
export function drawLightRays(ctx, W, H, color, alpha = 0.05) {
  ctx.save();
  const fullColor = color.length === 4 ? '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] : color;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0.2, 'transparent');
  grad.addColorStop(0.5, fullColor + '15');
  grad.addColorStop(0.8, 'transparent');
  
  ctx.fillStyle = grad;
  ctx.rotate(-Math.PI / 12);
  ctx.translate(-W * 0.5, 0);
  ctx.fillRect(0, H * 0.1, W * 3, H * 0.4);
  ctx.restore();
}

/**
 * Draws realistic rising culinary steam for hot foods.
 * Uses a chaotic sine-wave multi-blob particle system.
 */
export function drawSteam(ctx, x, y, radius, color = '#ffffff') {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 7; i++) {
    const ox = (Math.random() - 0.5) * radius * 0.8;
    const oy = -Math.random() * radius * 1.2;
    const size = rand(radius * 0.2, radius * 0.5);
    const alpha = rand(0.02, 0.08);
    
    const fullColor = color.length === 4 ? '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] : color;
    const grad = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, size);
    grad.addColorStop(0, fullColor + '66');
    grad.addColorStop(1, 'transparent');
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + ox, y + oy, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a wisp
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = alpha * 0.4;
    ctx.beginPath();
    ctx.moveTo(x + ox, y + oy);
    ctx.bezierCurveTo(
      x + ox + rand(-20, 20), y + oy - 40,
      x + ox + rand(-40, 40), y + oy - 80,
      x + ox + rand(-10, 10), y + oy - 120
    );
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Enhanced Food Hero Glow with tiered gradients
 */
export function drawFoodGlow(ctx, x, y, radius, color) {
  ctx.save();
  
  // Layer 1: Core Glow (Softer for V3)
  const grad1 = ctx.createRadialGradient(x, y, radius * 0.9, x, y, radius * 1.25);
  const fullColor = color.length === 4 ? '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] : color;
  grad1.addColorStop(0, fullColor + '22');
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.beginPath(); ctx.arc(x, y, radius * 1.25, 0, Math.PI * 2); ctx.fill();
  
  // Layer 2: Soft Aura (Lower opacity)
  const grad2 = ctx.createRadialGradient(x, y, radius * 1.1, x, y, radius * 1.9);
  grad2.addColorStop(0, fullColor + '08');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.beginPath(); ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2); ctx.fill();
  
  ctx.restore();
}

/**
 * Draws a hand-drawn style fork sticker - PREMIUM V2
 */
export function drawFork(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rand(-0.2, 0.2));
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Handle
  ctx.beginPath();
  ctx.moveTo(0, size * 0.8);
  ctx.lineTo(0, size * 0.2);
  ctx.stroke();
  
  // Head base
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, -size * 0.1);
  ctx.quadraticCurveTo(0, size * 0.35, size * 0.25, -size * 0.1);
  ctx.stroke();
  
  // Tines
  for (let i = -1; i <= 1; i++) {
    const tx = i * size * 0.2;
    ctx.beginPath();
    ctx.moveTo(tx, -size * 0.1);
    ctx.lineTo(tx, -size * (0.6 + Math.abs(i) * 0.1));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws a hand-drawn style spoon sticker - PREMIUM V2
 */
export function drawSpoon(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rand(-0.2, 0.2));
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';
  
  // Handle
  ctx.beginPath();
  ctx.moveTo(0, size * 0.8);
  ctx.lineTo(0, size * 0.1);
  ctx.stroke();
  
  // Head
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.3, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner highlights
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.arc(size * 0.08, -size * 0.4, size * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draws a hand-drawn style plate sticker - PREMIUM V2
 */
export function drawPlate(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.65, 0.2, Math.PI * 2 - 0.2);
  ctx.stroke();
  ctx.lineWidth = size * 0.06;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Scatters gourmet stickers across the background
 */
export function drawGourmetStickers(ctx, W, H, color, count = 5, alpha = 0.1) {
  for (let i = 0; i < count; i++) {
    const x = rand(100, W - 100);
    const y = rand(100, H - 100);
    const size = rand(18, 36);
    const type = Math.floor(rand(0, 3));
    if (type === 0) drawFork(ctx, x, y, size, color, alpha);
    else if (type === 1) drawSpoon(ctx, x, y, size, color, alpha);
    else drawPlate(ctx, x, y, size, color, alpha);
  }
}