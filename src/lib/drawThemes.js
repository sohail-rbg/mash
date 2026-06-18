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
 *
 * drawTheme() only paints the BACKGROUND layer. The food image, name,
 * description, badges and footer are all drawn afterwards by
 * ShareCardCanvas.jsx — so content always changes independently of design.
 */

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(rand(0, arr.length))];

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
  grad.addColorStop(0.42, `${color}1a`);
  grad.addColorStop(0.5, `${color}38`);
  grad.addColorStop(0.58, `${color}1a`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = color;
  for (let i = 0; i < 24; i++) {
    ctx.globalAlpha = rand(0.2, 0.55);
    ctx.beginPath();
    ctx.arc(rand(0, W), rand(0, H), rand(0.7, 2), 0, Math.PI * 2);
    ctx.fill();
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

  ctx.save();

  switch (themeName) {

    /* 1 — Dark Elegant: Wood Texture · Warm Glow · Soft Shadow · Leaf Particles */
    case 'darkElegant': {
      style = { bg: '#1c130d', accent: '#f97316', gold: '#fbbf24', text: '#ffffff', muted: 'rgba(255,255,255,0.75)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawWoodTexture(ctx, W, H, '#000000'); // Darker wood texture
      // Enhanced blobs for depth
      drawMeshBlob(ctx, W * 0.08, H * 0.94, 400, 340, '#f97316', 0.45, 'screen');
      drawMeshBlob(ctx, W * 0.04, H * 0.98, 200, 180, '#f97316', 0.6, 'screen'); // Smaller, more intense
      drawMeshBlob(ctx, W * 0.95, H * 0.04, 260, 220, '#fbbf24', 0.22, 'screen');
      drawLeafScatter(ctx, W, H, 9, '#84cc16', { sizeMin: 10, sizeMax: 20, alphaMin: 0.12, alphaMax: 0.24 });
      break;
    }

    /* 2 — Neon Blue: Neon Border · Dots Pattern · Blue Glow · Floating Leaves */
    case 'neonBlue': {
      style = { bg: '#040a1a', accent: '#3b82f6', gold: '#60a5fa', text: '#ffffff', muted: 'rgba(219,234,254,0.8)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.18, H * 0.22, 560, 480, '#3b82f6', 0.32, 'screen');
      drawMeshBlob(ctx, W * 0.85, H * 0.8, 520, 460, '#60a5fa', 0.24, 'screen');
      drawNeonBorder(ctx, W, H, '#3b82f6');
      drawLeafScatter(ctx, W, H, 6, '#93c5fd', { sizeMin: 10, sizeMax: 18, alphaMin: 0.12, alphaMax: 0.22 });
      break;
    }

    /* 3 — Green Fresh: Green Gradient · Leaf Elements · Soft Light · Clean Look */
    case 'greenFresh': {
      style = { bg: '#0b2e1f', accent: '#22c55e', gold: '#a3e635', text: '#ffffff', muted: 'rgba(220,252,231,0.78)' };
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#06241a');
      g.addColorStop(1, '#16432b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      drawBlob(ctx, W / 2, H * 0.2, Math.max(W, H) * 0.6, 'rgba(255,255,255,0.06)');
      drawLeafElements(ctx, W, H, '#4ade80');
      drawLeafScatter(ctx, W, H, 5, '#86efac', { sizeMin: 9, sizeMax: 16, alphaMin: 0.1, alphaMax: 0.2 });
      break;
    }

    /* 4 — Minimal Light: White Clean BG · Green Accent · Soft Shadow · Leaf Speckles */
    case 'minimalLight': {
      style = { bg: '#fafaf8', accent: '#16a34a', gold: '#ca8a04', text: '#1c1917', muted: 'rgba(28,25,23,0.62)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawSpeckles(ctx, W, H, '#166534', 110);
      drawLeafScatter(ctx, W, H, 5, '#16a34a', { sizeMin: 8, sizeMax: 14, alphaMin: 0.08, alphaMax: 0.16 });
      ctx.save();
      const shadowGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.6);
      shadowGrad.addColorStop(0, 'transparent');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0.05)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
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
      style = { bg: '#fdf2f8', accent: '#ec4899', gold: '#fb923c', text: '#4c1d95', muted: 'rgba(76,29,149,0.65)' };
      const pas = ctx.createLinearGradient(0, 0, W, H);
      pas.addColorStop(0, '#fbcfe8');
      pas.addColorStop(0.5, '#fae8ff');
      pas.addColorStop(1, '#bfdbfe');
      ctx.fillStyle = pas;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.22, H * 0.22, 480, 420, '#f9a8d4', 0.5);
      drawMeshBlob(ctx, W * 0.8, H * 0.78, 460, 400, '#93c5fd', 0.42);
      drawBrushStroke(ctx, W * 0.4, H * 0.65, W * 0.9, H * 0.3, 'rgba(255,255,255,0.35)', 1, 0.12);
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
      drawGoldShine(ctx, W, H, '#d4af37');
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