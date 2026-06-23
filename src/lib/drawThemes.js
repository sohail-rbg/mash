/**
 * drawThemes.js — 10 canvas themes for the Share Card
 * Enhanced with premium design elements
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
    if (hex.length === 3 || hex.length === 4) hex = hex.split('').map(c => c + c).join('');
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
    const values = rgbaMatch[1].split(',').map(v => v.trim()).filter(Boolean);
    if (values.length >= 3) return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${safeAlpha})`;
  }
  return normalized;
}

/* ── Generic primitives ───────────────────────────────────────────────────── */

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

export function drawThemeTexture(ctx, W, H, textureType = 'dots', color = '#ffffff') {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = color;
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

/* ── Enhanced Decorative helpers ──────────────────────────────────────────── */

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

/** Enhanced botanical leaf with better details */
function _drawBotanicalLeaf(ctx, x, y, size, rotation, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  
  // Leaf with gradient fill
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  grad.addColorStop(0, color);
  grad.addColorStop(1, withAlpha(color, 0.7));
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.6, -size * 0.7, size * 0.65, size * 0.1, 0, size * 0.3);
  ctx.bezierCurveTo(-size * 0.65, size * 0.1, -size * 0.6, -size * 0.7, 0, -size);
  ctx.fill();

  // Center vein with glow
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255,255,255,0.3)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.85);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.2, 0, size * 0.25);
  ctx.stroke();

  // Side veins with glow
  ctx.shadowBlur = 4;
  ctx.lineWidth = Math.max(0.6, size * 0.03);
  [[-size * 0.55, -size * 0.35], [-size * 0.52, size * 0.02]].forEach(([ex, ey], i) => {
    const sy = -size * 0.5 + i * size * 0.38;
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath(); ctx.moveTo(0, sy); ctx.quadraticCurveTo(ex * 0.5, sy + size * 0.05, ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, sy); ctx.quadraticCurveTo(-ex * 0.5, sy + size * 0.05, -ex, ey); ctx.stroke();
  });
  ctx.restore();
}

/** Enhanced botanical sprig */
function _drawBotanicalSprig(ctx, baseX, baseY, W, H, mirrored = false) {
  const dir = mirrored ? -1 : 1;
  const colors = ['#7ab560', '#8fc96e', '#6aa050', '#a0d47a', '#5e9442'];
  const leaves = [
    { dx: 0,         dy: -20,  size: 95,  rot: dir * -0.5,  colorIdx: 0 },
    { dx: dir * 55,  dy: -65,  size: 80,  rot: dir * -0.9,  colorIdx: 1 },
    { dx: dir * -30, dy: -95,  size: 70,  rot: dir * 0.2,   colorIdx: 2 },
    { dx: dir * 80,  dy: -120, size: 60,  rot: dir * -1.3,  colorIdx: 3 },
    { dx: dir * 20,  dy: -155, size: 52,  rot: dir * 0.6,   colorIdx: 4 },
    { dx: dir * 100, dy: -90,  size: 48,  rot: dir * -0.4,  colorIdx: 0 },
  ];

  // Enhanced stem with gradient
  ctx.save();
  const stemGrad = ctx.createLinearGradient(baseX, baseY, baseX + dir * 40, baseY - 180);
  stemGrad.addColorStop(0, '#7aad5a');
  stemGrad.addColorStop(1, '#5e8a42');
  ctx.strokeStyle = stemGrad;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.7;
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.bezierCurveTo(baseX + dir * 20, baseY - 80, baseX + dir * 40, baseY - 130, baseX + dir * 30, baseY - 180);
  ctx.stroke();
  ctx.restore();

  leaves.forEach(({ dx, dy, size, rot, colorIdx }) => {
    _drawBotanicalLeaf(ctx, baseX + dx, baseY + dy, size, rot, colors[colorIdx], 0.7);
  });
}

function drawLeafScatter(ctx, W, H, count, color, opts = {}) {
  const { sizeMin = 9, sizeMax = 20, alphaMin = 0.1, alphaMax = 0.26, pad = 50 } = opts;
  for (let i = 0; i < count; i++) {
    const x = rand(pad, W - pad);
    const y = rand(pad, H - pad);
    const size = rand(sizeMin, sizeMax);
    drawLeaf(ctx, x, y, size, rand(0, Math.PI * 2), color, rand(alphaMin, alphaMax));
  }
}

function drawLeafElements(ctx, W, H, color) {
  const spots = [[W*0.1,H*0.08,26,-0.4],[W*0.92,H*0.06,22,0.6],[W*0.06,H*0.94,24,0.3],[W*0.9,H*0.95,20,-0.5]];
  spots.forEach(([x, y, size, rot]) => drawLeaf(ctx, x, y, size, rot, color, 0.5));
}

function drawWoodTexture(ctx, W, H, color = '#000000') {
  ctx.save();
  ctx.strokeStyle = color;
  for (let y = 10; y < H; y += rand(16, 28)) {
    ctx.beginPath();
    ctx.lineWidth = rand(1, 2.4);
    ctx.globalAlpha = rand(0.035, 0.1);
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 36) ctx.lineTo(x, y + Math.sin(x * 0.018 + y) * 5);
    ctx.stroke();
  }
  ctx.restore();
}

/** Enhanced neon border with double glow */
function drawNeonBorder(ctx, W, H, color, inset = 26, radius = 28) {
  ctx.save();
  
  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 35;
  ctx.strokeStyle = withAlpha(color, 0.4);
  ctx.lineWidth = 3;
  ctx.beginPath(); 
  ctx.roundRect(inset - 3, inset - 3, W - inset * 2 + 6, H - inset * 2 + 6, radius + 2); 
  ctx.stroke();
  
  // Inner glow
  ctx.shadowBlur = 20;
  ctx.strokeStyle = withAlpha(color, 0.8);
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.beginPath(); 
  ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, radius); 
  ctx.stroke();
  
  ctx.restore();
}

function drawCornerBrackets(ctx, W, H, color, inset = 30, len = 46) {
  ctx.save();
  ctx.strokeStyle = color; 
  ctx.lineWidth = 2.4; 
  ctx.shadowColor = color; 
  ctx.shadowBlur = 14; 
  ctx.globalAlpha = 0.6;
  [[inset,inset,1,1],[W-inset,inset,-1,1],[inset,H-inset,1,-1],[W-inset,H-inset,-1,-1]].forEach(([x,y,dx,dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + len * dy); 
    ctx.lineTo(x, y); 
    ctx.lineTo(x + len * dx, y);
    ctx.stroke();
  });
  ctx.restore();
}

function drawCircuitLines(ctx, W, H, color) {
  ctx.save();
  ctx.strokeStyle = color; 
  ctx.fillStyle = color; 
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 7; i++) {
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

function drawSpiceSplash(ctx, W, H, color) {
  ctx.save();
  drawMeshBlob(ctx, W * 0.06, H * 0.94, 260, 230, color, 0.55, 'screen');
  drawMeshBlob(ctx, W * 0.96, H * 0.05, 160, 140, color, 0.35, 'screen');
  ctx.fillStyle = color;
  for (let i = 0; i < 30; i++) {
    const x = rand(0, W * 0.32), y = rand(H * 0.62, H);
    ctx.globalAlpha = rand(0.15, 0.45);
    ctx.beginPath(); 
    ctx.arc(x, y, rand(1.4, 6), 0, Math.PI * 2); 
    ctx.fill();
  }
  ctx.restore();
}

function drawBrushStroke(ctx, cx, cy, w, h, color, alpha, rotation = -0.18) {
  ctx.save();
  ctx.translate(cx, cy); 
  ctx.rotate(rotation); 
  ctx.globalAlpha = alpha;
  const grad = ctx.createLinearGradient(-w/2, 0, w/2, 0);
  grad.addColorStop(0, 'transparent'); 
  grad.addColorStop(0.5, color); 
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath(); 
  ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2); 
  ctx.fill();
  ctx.restore();
}

function drawWaveLines(ctx, W, H, color, count = 4) {
  ctx.save();
  ctx.strokeStyle = color; 
  ctx.lineWidth = 1.4;
  for (let i = 0; i < count; i++) {
    const baseY = rand(H * 0.15, H * 0.88);
    const amp = rand(18, 46), freq = rand(0.006, 0.013);
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

export function drawArchitecturalGrid(ctx, W, H, color, spacing = 180) {
  ctx.save();
  ctx.strokeStyle = color; 
  ctx.lineWidth = 0.8; 
  ctx.globalAlpha = 0.12;
  for (let x = 0; x <= W; x += spacing) {
    ctx.beginPath(); 
    ctx.moveTo(x, 0); 
    ctx.lineTo(x, H); 
    ctx.stroke();
    for (let y = 0; y <= H; y += spacing) {
      ctx.save(); 
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); 
      ctx.arc(x, y, 2.5, 0, Math.PI * 2); 
      ctx.fill();
      ctx.restore();
    }
  }
  for (let y = 0; y <= H; y += spacing) {
    ctx.beginPath(); 
    ctx.moveTo(0, y); 
    ctx.lineTo(W, y); 
    ctx.stroke();
  }
  ctx.restore();
}

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
  ctx.fillStyle = color;
  ctx.beginPath(); 
  ctx.arc(size * 0.5, size * 0.5, size * 0.12, 0, Math.PI * 2); 
  ctx.fill();
  ctx.restore();
}

export function drawCyberGrid(ctx, W, H, color) {
  ctx.save();
  const horizonY = H * 0.65, centerX = W / 2;
  ctx.strokeStyle = color || 'rgba(148,163,184,0.15)'; 
  ctx.lineWidth = 0.8;
  const floorLineCount = 18;
  for (let i = 0; i <= floorLineCount; i++) {
    const xBottom = (W / floorLineCount) * i;
    ctx.beginPath(); 
    ctx.moveTo(centerX, horizonY); 
    ctx.lineTo(xBottom, H); 
    ctx.stroke();
  }
  const depthLines = 14;
  for (let i = 0; i < depthLines; i++) {
    const y = horizonY + (H - horizonY) * Math.pow(i / depthLines, 2);
    ctx.beginPath(); 
    ctx.moveTo(0, y); 
    ctx.lineTo(W, y); 
    ctx.stroke();
    for (let j = 0; j <= floorLineCount; j++) {
      const x = centerX + ((W / floorLineCount) * j - centerX) * ((y - horizonY) / (H - horizonY));
      ctx.save(); 
      ctx.fillStyle = color; 
      ctx.globalAlpha = 0.5 * (i / depthLines);
      ctx.shadowColor = color; 
      ctx.shadowBlur = 8;
      ctx.beginPath(); 
      ctx.arc(x, y, 1.8, 0, Math.PI * 2); 
      ctx.fill();
      ctx.restore();
    }
  }
  const wallSpacing = 60;
  ctx.globalAlpha = 0.08;
  for (let x = 0; x <= W; x += wallSpacing) {
    ctx.beginPath(); 
    ctx.moveTo(x, 0); 
    ctx.lineTo(x, horizonY); 
    ctx.stroke();
    for (let y = 0; y <= horizonY; y += wallSpacing) {
      ctx.beginPath(); 
      ctx.arc(x, y, 1.2, 0, Math.PI * 2); 
      ctx.fill();
    }
  }
  for (let y = 0; y <= horizonY; y += wallSpacing) {
    ctx.beginPath(); 
    ctx.moveTo(0, y); 
    ctx.lineTo(W, y); 
    ctx.stroke();
  }
  ctx.restore();
}

function drawBubbles(ctx, W, H, count = 3) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rand(W * 0.58, W * 0.97), y = rand(H * 0.55, H * 0.97), r = rand(22, 72);
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

/* ── Enhanced Main theme renderer ──────────────────────────────────────────── */

export function drawTheme(ctx, W, H, themeName) {
  let style = { bg: '#0f172a', accent: '#f97316', gold: '#fbbf24', text: '#ffffff', muted: 'rgba(255,255,255,0.75)' };
  const PAD = 44;
  ctx.save();

  switch (themeName) {

    case 'darkElegant': {
      style = { bg: '#0d0805', accent: '#f59e0b', gold: '#fbbf24', text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };
      ctx.fillStyle = style.bg; 
      ctx.fillRect(0, 0, W, H);
      
      // Enhanced wood texture with gradient
      const woodGrad = ctx.createLinearGradient(0, 0, 0, H);
      woodGrad.addColorStop(0, 'rgba(0,0,0,0.2)');
      woodGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
      woodGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(0, 0, W, H);
      
      drawWoodTexture(ctx, W, H, '#000000');
      drawGoldShine(ctx, W, H, 'rgba(245,158,11,0.08)');
      drawMeshBlob(ctx, W * 0.1, H * 0.9, 450, 350, 'rgba(245,158,11,0.2)', 1, 'screen');
      drawMeshBlob(ctx, W * 0.7, H * 0.1, 500, 400, 'rgba(251,191,36,0.15)', 1, 'screen');
      drawOrganicFlourish(ctx, PAD, H - PAD * 2.5, 120, -0.4, style.gold);
      drawOrganicFlourish(ctx, W - PAD, PAD * 2.5, 90, 2.8, style.gold);
      drawLeafScatter(ctx, W, H, 5, '#fbbf24', { alphaMin: 0.08, alphaMax: 0.2 });
      
      // Premium border
      ctx.save();
      ctx.strokeStyle = 'rgba(251,191,36,0.15)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(20, 20, W - 40, H - 40, 12);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'midnightNoir': {
      style = { bg: '#02040a', accent: '#00ff9f', gold: '#d1fae5', text: '#ffffff', muted: 'rgba(148,163,184,0.7)' };
      ctx.fillStyle = style.bg; 
      ctx.fillRect(0, 0, W, H);
      drawCyberGrid(ctx, W, H, 'rgba(0,255,159,0.2)');
      drawLightRays(ctx, W, H, '#fff', 0.14);
      
      // Star field
      ctx.save(); 
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 6000; i++) { 
        ctx.fillStyle = i % 2 === 0 ? '#fff' : '#00ff9f'; 
        ctx.fillRect(Math.random() * W, Math.random() * H, 0.9, 0.9); 
      }
      ctx.restore();
      
      // Enhanced neon border
      drawNeonBorder(ctx, W, H, 'rgba(0,255,159,0.4)', 26, 28);
      
      // Corner accent dots
      ctx.save();
      ctx.fillStyle = '#00ff9f';
      ctx.shadowColor = '#00ff9f';
      ctx.shadowBlur = 20;
      [[26,26],[W-26,26],[26,H-26],[W-26,H-26]].forEach(([x,y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      break;
    }

    case 'ecoLuxury': {
      style = { bg: '#121a12', accent: '#d4af37', gold: '#fde68a', text: '#fdf6e3', muted: 'rgba(253,246,227,0.7)' };
      const eg = ctx.createLinearGradient(0, 0, W, H);
      eg.addColorStop(0, '#121a12'); 
      eg.addColorStop(1, '#1e291e');
      ctx.fillStyle = eg; 
      ctx.fillRect(0, 0, W, H);
      drawArchitecturalGrid(ctx, W, H, style.accent, 160);
      
      // Premium double border
      ctx.save(); 
      ctx.strokeStyle = style.accent; 
      ctx.lineWidth = 1.5; 
      ctx.globalAlpha = 0.25;
      ctx.shadowColor = style.accent;
      ctx.shadowBlur = 15;
      ctx.strokeRect(32, 32, W - 64, H - 64);
      ctx.strokeStyle = withAlpha(style.accent, 0.1);
      ctx.lineWidth = 0.5;
      ctx.strokeRect(44, 44, W - 88, H - 88);
      ctx.restore();
      
      drawBrushStroke(ctx, W * 0.5, H * 0.5, W * 1.4, H * 0.5, 'rgba(212,175,55,0.08)', 1, 0.5);
      drawLeafScatter(ctx, W, H, 5, '#2d3b2d', { alphaMin: 0.3, alphaMax: 0.5 });
      break;
    }

    case 'minimalLight': {
      style = { bg: '#0f172a', accent: '#fbbf24', gold: '#fbbf24', text: '#f8fafc', muted: 'rgba(248,250,252,0.6)' };
      const darkGrad = ctx.createLinearGradient(0, 0, 0, H);
      darkGrad.addColorStop(0, '#040812'); 
      darkGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = darkGrad; 
      ctx.fillRect(0, 0, W, H);
      drawStarDust(ctx, W, H, '#ffffff', 60);
      drawLightRays(ctx, W, H, '#fbbf24', 0.08);
      
      // Decorative line
      ctx.save(); 
      ctx.strokeStyle = 'rgba(251,191,36,0.2)'; 
      ctx.lineWidth = 1.2;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.beginPath(); 
      ctx.moveTo(-50, H * 0.84); 
      ctx.bezierCurveTo(W * 0.35, H * 0.76, W * 0.65, H * 0.94, W + 50, H * 0.86); 
      ctx.stroke();
      ctx.restore();
      
      drawGourmetStickers(ctx, W, H, style.accent, 6, 0.2);
      
      // Premium emoji accents
      ctx.save(); 
      ctx.font = '30px serif'; 
      ctx.globalAlpha = 0.15;
      ctx.fillText('✦', W * 0.1, H * 0.15); 
      ctx.fillText('✦', W * 0.9, H * 0.7);
      ctx.restore();
      
      const vig = ctx.createRadialGradient(W/2, H*0.45, W*0.2, W/2, H*0.45, W*0.9);
      vig.addColorStop(0, 'transparent'); 
      vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vig; 
      ctx.fillRect(0, 0, W, H);
      break;
    }

    case 'purpleGlow': {
      style = { bg: '#1a0f2e', accent: '#a855f7', gold: '#ec4899', text: '#ffffff', muted: 'rgba(243,232,255,0.78)' };
      const pg = ctx.createLinearGradient(0, 0, W, H);
      pg.addColorStop(0, '#160a26'); 
      pg.addColorStop(1, '#2b1450');
      ctx.fillStyle = pg; 
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.5, H * 0.32, 520, 460, '#a855f7', 0.35, 'screen');
      drawNeonCircles(ctx, W, H, '#c084fc', 6);
      drawNeonBorder(ctx, W, H, '#a855f7', 25, 30);
      
      // Glowing dots pattern
      ctx.save();
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 15;
      for (let i = 0; i < 30; i++) {
        ctx.globalAlpha = rand(0.1, 0.3);
        ctx.beginPath();
        ctx.arc(rand(50, W-50), rand(50, H-50), rand(2, 5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'orangesoft': {
      style = { bg: '#1a120b', accent: '#f97316', gold: '#fbbf24', text: '#fefce8', muted: 'rgba(254,252,232,0.75)' };
      
      ctx.fillStyle = '#1a120b';
      ctx.fillRect(0, 0, W, H);
      
      // Enhanced warm gradient
      const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
      grad.addColorStop(0, 'rgba(249,115,22,0.12)');
      grad.addColorStop(0.4, 'rgba(251,191,36,0.08)');
      grad.addColorStop(0.7, 'rgba(249,115,22,0.04)');
      grad.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      
      // Enhanced mandala pattern
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      for (let i = 0; i < 160; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(W, H) * 0.45;
        const x = W/2 + Math.cos(angle) * radius;
        const y = H/2 + Math.sin(angle) * radius;
        const size = 0.8 + Math.random() * 3;
        ctx.globalAlpha = 0.06 + Math.random() * 0.14;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = size * 3;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // Enhanced border with multiple layers
      ctx.save();
      const borderPadding = 28;
      const cornerRadius = 42;
      
      // Outer glow border
      ctx.strokeStyle = 'rgba(251,191,36,0.3)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.roundRect(borderPadding, borderPadding, W - borderPadding * 2, H - borderPadding * 2, cornerRadius);
      ctx.stroke();
      
      // Middle border
      ctx.shadowBlur = 15;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(251,191,36,0.2)';
      ctx.beginPath();
      ctx.roundRect(borderPadding + 12, borderPadding + 12, W - borderPadding * 2 - 24, H - borderPadding * 2 - 24, cornerRadius - 4);
      ctx.stroke();
      
      // Inner dashed border
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = 'rgba(251,191,36,0.1)';
      ctx.beginPath();
      ctx.roundRect(borderPadding + 24, borderPadding + 24, W - borderPadding * 2 - 48, H - borderPadding * 2 - 48, cornerRadius - 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      
      // Enhanced corner ornaments
      ctx.save();
      ctx.strokeStyle = 'rgba(251,191,36,0.5)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;
      
      const cornerSize = 55;
      const corners = [
        [borderPadding, borderPadding, 1, 1],
        [W - borderPadding, borderPadding, -1, 1],
        [borderPadding, H - borderPadding, 1, -1],
        [W - borderPadding, H - borderPadding, -1, -1]
      ];
      
      corners.forEach(([x, y, dx, dy]) => {
        // Enhanced corner arc
        ctx.beginPath();
        ctx.arc(x + dx * cornerSize, y + dy * cornerSize, cornerSize, 
          dx === 1 && dy === 1 ? 0 : 
          dx === -1 && dy === 1 ? Math.PI/2 : 
          dx === -1 && dy === -1 ? Math.PI : Math.PI * 1.5,
          dx === 1 && dy === 1 ? Math.PI/2 : 
          dx === -1 && dy === 1 ? Math.PI : 
          dx === -1 && dy === -1 ? Math.PI * 1.5 : Math.PI * 2
        );
        ctx.stroke();
        
        // Larger corner dot with glow
        ctx.fillStyle = 'rgba(251,191,36,0.6)';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(x + dx * 12, y + dy * 12, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Small surrounding dots
        ctx.fillStyle = 'rgba(251,191,36,0.3)';
        ctx.shadowBlur = 10;
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.PI/4;
          const sx = x + dx * (30 + Math.cos(a) * 18);
          const sy = y + dy * (30 + Math.sin(a) * 18);
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
      
      // Enhanced arch patterns
      ctx.save();
      const archY = 55;
      const archWidth = W * 0.32;
      const archHeight = 40;
      
      ctx.strokeStyle = 'rgba(251,191,36,0.25)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      
      // Left arch with glow
      ctx.beginPath();
      ctx.moveTo(W/2 - archWidth, archY);
      ctx.quadraticCurveTo(W/2 - archWidth/2, archY - archHeight, W/2, archY);
      ctx.stroke();
      
      // Right arch with glow
      ctx.beginPath();
      ctx.moveTo(W/2 + archWidth, archY);
      ctx.quadraticCurveTo(W/2 + archWidth/2, archY - archHeight, W/2, archY);
      ctx.stroke();
      
      // Center arch
      ctx.strokeStyle = 'rgba(251,191,36,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W/2 - archWidth/3.5, archY + 5);
      ctx.quadraticCurveTo(W/2, archY - archHeight/1.8, W/2 + archWidth/3.5, archY + 5);
      ctx.stroke();
      ctx.restore();
      
      // Enhanced bottom arches
      ctx.save();
      const bottomY = H - 75;
      ctx.strokeStyle = 'rgba(251,191,36,0.2)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      
      for (let i = 0; i < 7; i++) {
        const x = W/2 - 200 + i * 67;
        ctx.beginPath();
        ctx.moveTo(x - 22, bottomY);
        ctx.quadraticCurveTo(x, bottomY - 28, x + 22, bottomY);
        ctx.stroke();
        
        // Small dot above each arch
        ctx.fillStyle = 'rgba(251,191,36,0.2)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, bottomY - 35, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // Warm ambient glow blobs
      drawMeshBlob(ctx, W * 0.1, H * 0.9, 400, 300, 'rgba(249,115,22,0.1)', 1, 'screen');
      drawMeshBlob(ctx, W * 0.9, H * 0.1, 350, 280, 'rgba(251,191,36,0.08)', 1, 'screen');
      drawMeshBlob(ctx, W * 0.5, H * 0.5, 500, 400, 'rgba(249,115,22,0.06)', 1, 'screen');
      
      // Subtle texture dots
      ctx.save();
      ctx.globalAlpha = 0.025;
      for (let i = 0; i < 2500; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#f97316';
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
      ctx.restore();
      
      // Decorative golden leaf motifs
      // ctx.save();
      // const leafColor = 'rgba(251,191,36,0.18)';
      // drawLeaf(ctx, W * 0.07, H * 0.07, 22, -0.3, leafColor, 0.7);
      // drawLeaf(ctx, W * 0.93, H * 0.07, 22, 0.3, leafColor, 0.7);
      // drawLeaf(ctx, W * 0.07, H * 0.93, 22, 0.5, leafColor, 0.7);
      // drawLeaf(ctx, W * 0.93, H * 0.93, 22, -0.5, leafColor, 0.7);
      
      // // Extra leaves at mid points
      // drawLeaf(ctx, W * 0.5, H * 0.04, 18, 0, leafColor, 0.4);
      // drawLeaf(ctx, W * 0.5, H * 0.96, 18, Math.PI, leafColor, 0.4);
      // ctx.restore();
      
      break;
    }

    case 'cyberBlue': {
      style = { bg: '#020617', accent: '#22d3ee', gold: '#38bdf8', text: '#e0f2fe', muted: 'rgba(224,242,254,0.72)' };
      ctx.fillStyle = style.bg; 
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.5, H * 0.5, 600, 520, '#0891b2', 0.2, 'screen');
      drawCircuitLines(ctx, W, H, '#22d3ee');
      drawCornerBrackets(ctx, W, H, '#22d3ee');
      
      // Cyber dots pattern
      ctx.save();
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      for (let i = 0; i < 50; i++) {
        ctx.globalAlpha = rand(0.1, 0.3);
        ctx.beginPath();
        ctx.arc(rand(50, W-50), rand(50, H-50), rand(1, 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'softPastel': {
      style = { bg: '#fdf7fb', accent: '#ec4899', gold: '#fb923c', text: '#3b2d5a', muted: 'rgba(59,45,90,0.68)' };
      const pas = ctx.createLinearGradient(0, 0, W, H);
      pas.addColorStop(0, '#fce7f3'); 
      pas.addColorStop(0.48, '#f9f5ff'); 
      pas.addColorStop(1, '#dbeafe');
      ctx.fillStyle = pas; 
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.18, H * 0.18, 420, 360, '#f9a8d4', 0.6);
      drawMeshBlob(ctx, W * 0.82, H * 0.76, 520, 440, '#93c5fd', 0.5);
      drawBrushStroke(ctx, W * 0.38, H * 0.62, W * 0.82, H * 0.22, 'rgba(255,255,255,0.5)', 1, 0.18);
      drawBlob(ctx, W * 0.5, H * 0.9, 330, 'rgba(255,255,255,0.2)');
      
      // Decorative circles
      ctx.save();
      ctx.strokeStyle = 'rgba(236,72,153,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const r = 60 + i * 25;
        ctx.beginPath();
        ctx.arc(W * 0.2, H * 0.15, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'luxuryGold': {
      style = { bg: '#0c0a06', accent: '#d4af37', gold: '#fde68a', text: '#fdf6e3', muted: 'rgba(253,246,227,0.7)' };
      ctx.fillStyle = style.bg; 
      ctx.fillRect(0, 0, W, H);
      
      // Enhanced gold glow
      const glow = ctx.createRadialGradient(W/2, H*0.35, 60, W/2, H*0.35, Math.max(W,H)*0.75);
      glow.addColorStop(0, 'rgba(212,175,55,0.15)');
      glow.addColorStop(0.5, 'rgba(212,175,55,0.08)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow; 
      ctx.fillRect(0, 0, W, H);
      
      drawWaveLines(ctx, W, H, '#d4af37', 6);
      drawStarDust(ctx, W, H, '#ffffff', 50);
      drawGoldShine(ctx, W, H, '#d4af37');
      drawGourmetStickers(ctx, W, H, style.gold, 6, 0.25);
      
      // Premium gold border
      ctx.save();
      ctx.strokeStyle = 'rgba(212,175,55,0.2)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(25, 25, W - 50, H - 50, 15);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(212,175,55,0.1)';
      ctx.lineWidth = 0.5;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.roundRect(40, 40, W - 80, H - 80, 10);
      ctx.stroke();
      ctx.restore();
      break;
    }

    /* Glass Morphism: Enhanced with more details */
    case 'glassMorphism': {
      style = {
        bg: '#fdf0e8',
        accent: '#c8623a',
        gold: '#d4724a',
        text: '#2d1e14',
        muted: 'rgba(45,30,20,0.60)',
      };

      const gm = ctx.createLinearGradient(0, 0, W * 0.6, H);
      gm.addColorStop(0, '#fdf5ee');
      gm.addColorStop(0.4, '#fdeade');
      gm.addColorStop(1, '#f8d8c8');
      ctx.fillStyle = gm;
      ctx.fillRect(0, 0, W, H);

      // Enhanced watercolor blobs
      drawMeshBlob(ctx, W * 0.88, H * 0.06, 500, 380, '#f5c4a8', 0.55);
      drawMeshBlob(ctx, W * 0.08, H * 0.90, 480, 380, '#f8b8b0', 0.42);
      drawMeshBlob(ctx, W * 0.50, H * 0.40, 580, 480, '#fde8d5', 0.32);
      drawMeshBlob(ctx, W * 0.04, H * 0.10, 260, 200, '#e8c8d8', 0.25);
      drawMeshBlob(ctx, W * 0.90, H * 0.82, 320, 260, '#f0b898', 0.35);

      // Premium botanical sprigs
      _drawBotanicalSprig(ctx, W - 40, H + 20, W, H, false);
      _drawBotanicalLeaf(ctx, W + 15, H - 220, 55, -0.2, '#8fc96e', 0.45);
      _drawBotanicalLeaf(ctx, W - 80, H + 10,  45, -1.1, '#a0d47a', 0.4);
      _drawBotanicalLeaf(ctx, -15, 100, 72, 1.0, '#8fc96e', 0.42);
      _drawBotanicalLeaf(ctx, 25,  55,  52, 0.6, '#a0d47a', 0.32);
      _drawBotanicalLeaf(ctx, -20, 180, 44, 1.4, '#7ab560', 0.25);

      // Premium texture dots
      ctx.save();
      ctx.globalAlpha = 0.06;
      for (let i = 40; i < W; i += 50) {
        for (let j = 40; j < H; j += 50) {
          ctx.fillStyle = '#b06840';
          ctx.beginPath(); 
          ctx.arc(i, j, 1.5, 0, Math.PI * 2); 
          ctx.fill();
        }
      }
      ctx.restore();

      // Glass border effect
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(255,255,255,0.1)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.roundRect(20, 20, W - 40, H - 40, 20);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(200,98,58,0.08)';
      ctx.lineWidth = 0.5;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.roundRect(32, 32, W - 64, H - 64, 16);
      ctx.stroke();
      ctx.restore();

      // Warm vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.28, W / 2, H / 2, W * 0.88);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(160, 70, 30, 0.08)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

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

  drawThemeTexture(ctx, W, H, 'dots', style.text);
  ctx.restore();
  return style;
}

/* ── Enhanced Title ornament ──────────────────────────────────────────────── */

export function drawTitleOrnament(ctx, W, y, style, themeName, H ) {
  ctx.save();
  const centerX = W / 2;
  const lw = W * 0.44;
  const x1 = centerX - lw / 2;
  const x2 = centerX + lw / 2;

  switch (themeName) {
    case 'darkElegant':
    case 'luxuryGold': {
      const drawSubLine = (dy, width, alpha, weight) => {
        const gl = ctx.createLinearGradient(centerX - width/2, 0, centerX + width/2, 0);
        gl.addColorStop(0, 'transparent'); 
        gl.addColorStop(0.5, style.gold + alpha); 
        gl.addColorStop(1, 'transparent');
        ctx.strokeStyle = gl; 
        ctx.lineWidth = weight;
        ctx.shadowColor = style.gold;
        ctx.shadowBlur = 8;
        ctx.beginPath(); 
        ctx.moveTo(centerX - width/2, y + dy); 
        ctx.lineTo(centerX + width/2, y + dy); 
        ctx.stroke();
      };
      drawSubLine(-5, lw * 0.6, '33', 1); 
      drawSubLine(0, lw, 'bb', 2.2); 
      drawSubLine(5, lw * 0.6, '33', 1);
      ctx.shadowBlur = 20;
      ctx.fillStyle = style.gold; 
      ctx.shadowColor = style.gold; 
      ctx.shadowBlur = 20;
      ctx.beginPath(); 
      ctx.moveTo(centerX, y-8); 
      ctx.lineTo(centerX+8, y); 
      ctx.lineTo(centerX, y+8); 
      ctx.lineTo(centerX-8, y); 
      ctx.closePath(); 
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath(); 
      ctx.arc(centerX-28, y, 3, 0, Math.PI*2); 
      ctx.fill();
      ctx.beginPath(); 
      ctx.arc(centerX+28, y, 3, 0, Math.PI*2); 
      ctx.fill();
      drawFork(ctx, centerX + lw/2 + 20, y, 18, style.gold, 0.5);
      drawSpoon(ctx, centerX - lw/2 - 20, y, 18, style.gold, 0.5);
      break;
    }

    case 'midnightNoir':
    case 'purpleGlow': {
      ctx.shadowColor = style.accent; 
      ctx.shadowBlur = 30;
      const grad = ctx.createLinearGradient(x1, 0, x2, 0);
      grad.addColorStop(0, 'transparent'); 
      grad.addColorStop(0.2, style.accent+'22');
      grad.addColorStop(0.5, '#ffffff'); 
      grad.addColorStop(0.8, style.accent+'22'); 
      grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad; 
      ctx.lineWidth = 3;
      ctx.beginPath(); 
      ctx.moveTo(x1, y); 
      ctx.lineTo(x2, y); 
      ctx.stroke();
      ctx.fillStyle = '#fff'; 
      ctx.shadowBlur = 15;
      ctx.beginPath(); 
      ctx.arc(centerX - lw/4, y, 3.5, 0, Math.PI*2); 
      ctx.fill();
      ctx.beginPath(); 
      ctx.arc(centerX + lw/4, y, 3.5, 0, Math.PI*2); 
      ctx.fill();
      ctx.beginPath(); 
      ctx.arc(centerX, y, 5, 0, Math.PI*2); 
      ctx.fill();
      break;
    }

    case 'cyberBlue': {
      ctx.strokeStyle = style.accent; 
      ctx.lineWidth = 2; 
      ctx.shadowColor = style.accent; 
      ctx.shadowBlur = 15;
      const bs = 10;
      ctx.beginPath();
      ctx.moveTo(x1+bs,y-bs); 
      ctx.lineTo(x1,y-bs); 
      ctx.lineTo(x1,y+bs); 
      ctx.lineTo(x1+bs,y+bs);
      ctx.moveTo(x2-bs,y-bs); 
      ctx.lineTo(x2,y-bs); 
      ctx.lineTo(x2,y+bs); 
      ctx.lineTo(x2-bs,y+bs);
      ctx.stroke();
      ctx.setLineDash([15,6,2,6]);
      ctx.shadowBlur = 10;
      ctx.beginPath(); 
      ctx.moveTo(x1+15,y); 
      ctx.lineTo(x2-15,y); 
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = style.accent;
      ctx.shadowBlur = 20;
      ctx.beginPath(); 
      ctx.arc(centerX, y, 4.5, 0, Math.PI*2); 
      ctx.fill();
      break;
    }

    case 'ecoLuxury': {
      const g = ctx.createLinearGradient(x1, 0, x2, 0);
      g.addColorStop(0, 'transparent'); 
      g.addColorStop(0.5, style.accent); 
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g; 
      ctx.lineWidth = 2.5;
      ctx.shadowColor = style.accent;
      ctx.shadowBlur = 12;
      ctx.beginPath(); 
      ctx.moveTo(x1,y); 
      ctx.quadraticCurveTo(centerX-lw/4,y-6,centerX,y); 
      ctx.quadraticCurveTo(centerX+lw/4,y+6,x2,y); 
      ctx.stroke();
      drawLeaf(ctx, centerX, y, 10, -0.2, style.accent, 1);
      drawLeaf(ctx, centerX-14, y-4, 6, -0.6, style.accent, 0.7);
      drawLeaf(ctx, centerX+14, y-4, 6, 0.6, style.accent, 0.7);
      break;
    }

    case 'orangesoft': {
      ctx.save();
      const centerX = W / 2;
      const ornamentY = y;
      
      // Enhanced decorative arch
      ctx.strokeStyle = 'rgba(251,191,36,0.35)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;
      
      // Swirls with glow
      ctx.beginPath();
      ctx.moveTo(centerX - 220, ornamentY);
      ctx.quadraticCurveTo(centerX - 130, ornamentY - 35, centerX - 60, ornamentY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX + 220, ornamentY);
      ctx.quadraticCurveTo(centerX + 130, ornamentY - 35, centerX + 60, ornamentY);
      ctx.stroke();
      
      // Center diamond with glow
      ctx.fillStyle = 'rgba(251,191,36,0.7)';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.moveTo(centerX, ornamentY - 14);
      ctx.lineTo(centerX + 14, ornamentY);
      ctx.lineTo(centerX, ornamentY + 14);
      ctx.lineTo(centerX - 14, ornamentY);
      ctx.closePath();
      ctx.fill();
      
      // Inner diamond
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(centerX, ornamentY - 6);
      ctx.lineTo(centerX + 6, ornamentY);
      ctx.lineTo(centerX, ornamentY + 6);
      ctx.lineTo(centerX - 6, ornamentY);
      ctx.closePath();
      ctx.fill();
      
      // Decorative dots with glow
      ctx.fillStyle = 'rgba(251,191,36,0.5)';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 15;
      for (let i = 1; i <= 6; i++) {
        const dotX = centerX + (i * 30) * (i % 2 === 0 ? 1 : -1);
        ctx.beginPath();
        ctx.arc(dotX, ornamentY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Extra small dots
      ctx.fillStyle = 'rgba(251,191,36,0.25)';
      ctx.shadowBlur = 8;
      for (let i = 1; i <= 8; i++) {
        const dotX = centerX + (i * 22) * (i % 2 === 0 ? -1 : 1);
        ctx.beginPath();
        ctx.arc(dotX, ornamentY + (i % 2 === 0 ? 12 : -12), 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      break;
    }

    case 'minimalLight': {
      ctx.strokeStyle = 'rgba(251,191,36,0.4)'; 
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.beginPath(); 
      ctx.moveTo(x1+40,y); 
      ctx.lineTo(centerX-15,y); 
      ctx.moveTo(centerX+15,y); 
      ctx.lineTo(x2-40,y); 
      ctx.stroke();
      ctx.fillStyle = style.accent; 
      ctx.shadowColor = style.accent; 
      ctx.shadowBlur = 20;
      ctx.beginPath(); 
      ctx.moveTo(centerX,y-8); 
      ctx.lineTo(centerX+8,y); 
      ctx.lineTo(centerX,y+8); 
      ctx.lineTo(centerX-8,y); 
      ctx.closePath(); 
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath(); 
      ctx.arc(centerX-28,y,2.5,0,Math.PI*2); 
      ctx.fill();
      ctx.beginPath(); 
      ctx.arc(centerX+28,y,2.5,0,Math.PI*2); 
      ctx.fill();
      drawFork(ctx, centerX-60, y, 15, style.accent, 0.7);
      drawSpoon(ctx, centerX+60, y, 15, style.accent, 0.7);
      ctx.font = '18px serif';
      ctx.fillStyle = 'rgba(251,191,36,0.3)';
      ctx.fillText('✦', centerX - lw*0.45, y+5);
      ctx.fillText('✦', centerX + lw*0.45, y+5);
      break;
    }

    /* Enhanced Glass Morphism ornament */
    case 'glassMorphism': {
      const g = ctx.createLinearGradient(x1, 0, x2, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.35, 'rgba(200,98,58,0.4)');
      g.addColorStop(0.5,  'rgba(200,98,58,0.7)');
      g.addColorStop(0.65, 'rgba(200,98,58,0.4)');
      g.addColorStop(1, 'transparent');

      // Thin upper line with glow
      ctx.shadowColor = 'rgba(200,98,58,0.2)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = g; 
      ctx.lineWidth = 1.5;
      ctx.beginPath(); 
      ctx.moveTo(x1, y-8); 
      ctx.lineTo(x2, y-8); 
      ctx.stroke();

      // Thicker lower line
      ctx.shadowBlur = 15;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); 
      ctx.moveTo(x1, y+3); 
      ctx.lineTo(x2, y+3); 
      ctx.stroke();

      // Center botanical sprig cluster with enhanced details
      _drawBotanicalLeaf(ctx, centerX,      y-4,  18, -0.15, '#7ab560', 0.9);
      _drawBotanicalLeaf(ctx, centerX-18,   y+3,  14,  0.55, '#8fc96e', 0.7);
      _drawBotanicalLeaf(ctx, centerX+18,   y+3,  14, -0.55, '#8fc96e', 0.7);
      _drawBotanicalLeaf(ctx, centerX-34,   y-2,  10,  1.1,  '#a0d47a', 0.5);
      _drawBotanicalLeaf(ctx, centerX+34,   y-2,  10, -1.1,  '#a0d47a', 0.5);

      // Terracotta dot accents with glow
      ctx.shadowColor = 'rgba(200,98,58,0.3)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(200,98,58,0.6)';
      ctx.beginPath(); 
      ctx.arc(centerX-52, y-3, 3, 0, Math.PI*2); 
      ctx.fill();
      ctx.beginPath(); 
      ctx.arc(centerX+52, y-3, 3, 0, Math.PI*2); 
      ctx.fill();
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(200,98,58,0.35)';
      ctx.beginPath(); 
      ctx.arc(centerX-70, y-3, 2, 0, Math.PI*2); 
      ctx.fill();
      ctx.beginPath(); 
      ctx.arc(centerX+70, y-3, 2, 0, Math.PI*2); 
      ctx.fill();
      break;
    }

    default: {
      const g = ctx.createLinearGradient(x1, 0, x2, 0);
      g.addColorStop(0, 'transparent'); 
      g.addColorStop(0.5, style.accent); 
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g; 
      ctx.lineWidth = 2.2;
      ctx.shadowColor = style.accent;
      ctx.shadowBlur = 15;
      ctx.beginPath(); 
      ctx.moveTo(x1,y); 
      ctx.lineTo(x2,y); 
      ctx.stroke();
      ctx.fillStyle = style.accent;
      ctx.shadowBlur = 20;
      ctx.beginPath(); 
      ctx.arc(centerX, y, 5, 0, Math.PI*2); 
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.beginPath(); 
      ctx.arc(centerX, y, 2, 0, Math.PI*2); 
      ctx.fill();
    }
  }
  ctx.restore();
}

/* ── Utility exports ──────────────────────────────────────────────────────── */

export function drawStarDust(ctx, W, H, color, count = 60) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = Math.random()*W, y = Math.random()*H;
    const size = 0.5 + Math.random()*2.5, opacity = 0.2 + Math.random()*0.8;
    ctx.fillStyle = color; 
    ctx.globalAlpha = opacity; 
    ctx.shadowColor = color; 
    ctx.shadowBlur = size*5;
    ctx.beginPath(); 
    ctx.arc(x, y, size, 0, Math.PI*2); 
    ctx.fill();
    if (size > 1.8) {
      ctx.lineWidth = 0.5;
      ctx.shadowBlur = size*3;
      ctx.beginPath(); 
      ctx.moveTo(x-size*3.5,y); 
      ctx.lineTo(x+size*3.5,y); 
      ctx.moveTo(x,y-size*3.5); 
      ctx.lineTo(x,y+size*3.5); 
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawLightRays(ctx, W, H, color, alpha = 0.05) {
  ctx.save();
  const fullColor = color.length === 4 ? '#'+color[1]+color[1]+color[2]+color[2]+color[3]+color[3] : color;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0.2, 'transparent'); 
  grad.addColorStop(0.5, fullColor+'15'); 
  grad.addColorStop(0.8, 'transparent');
  ctx.fillStyle = grad;
  ctx.rotate(-Math.PI/12); 
  ctx.translate(-W*0.5, 0);
  ctx.fillRect(0, H*0.1, W*3, H*0.4);
  ctx.restore();
}

export function drawSteam(ctx, x, y, radius, color = '#ffffff') {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 8; i++) {
    const ox = (Math.random()-0.5)*radius*0.8, oy = -Math.random()*radius*1.3;
    const size = rand(radius*0.2, radius*0.55), alpha = rand(0.02, 0.1);
    const fullColor = color.length === 4 ? '#'+color[1]+color[1]+color[2]+color[2]+color[3]+color[3] : color;
    const grad = ctx.createRadialGradient(x+ox, y+oy, 0, x+ox, y+oy, size);
    grad.addColorStop(0, fullColor+'77'); 
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = alpha; 
    ctx.fillStyle = grad;
    ctx.beginPath(); 
    ctx.arc(x+ox, y+oy, size, 0, Math.PI*2); 
    ctx.fill();
    ctx.strokeStyle = color; 
    ctx.lineWidth = 0.5; 
    ctx.globalAlpha = alpha*0.4;
    ctx.beginPath(); 
    ctx.moveTo(x+ox, y+oy);
    ctx.bezierCurveTo(x+ox+rand(-20,20), y+oy-40, x+ox+rand(-40,40), y+oy-80, x+ox+rand(-10,10), y+oy-120);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFoodGlow(ctx, x, y, radius, color) {
  ctx.save();
  const grad1 = ctx.createRadialGradient(x, y, radius*0.9, x, y, radius*1.25);
  const fullColor = color.length === 4 ? '#'+color[1]+color[1]+color[2]+color[2]+color[3]+color[3] : color;
  grad1.addColorStop(0, fullColor+'22'); 
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.beginPath(); 
  ctx.arc(x, y, radius*1.25, 0, Math.PI*2); 
  ctx.fill();
  const grad2 = ctx.createRadialGradient(x, y, radius*1.1, x, y, radius*1.9);
  grad2.addColorStop(0, fullColor+'08'); 
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.beginPath(); 
  ctx.arc(x, y, radius*2.2, 0, Math.PI*2); 
  ctx.fill();
  ctx.restore();
}

export function drawFork(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y); 
  ctx.rotate(rand(-0.2, 0.2));
  ctx.globalAlpha = alpha; 
  ctx.strokeStyle = color; 
  ctx.lineWidth = size*0.12;
  ctx.lineCap = 'round'; 
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  ctx.beginPath(); 
  ctx.moveTo(0, size*0.8); 
  ctx.lineTo(0, size*0.2); 
  ctx.stroke();
  ctx.beginPath(); 
  ctx.moveTo(-size*0.25,-size*0.1); 
  ctx.quadraticCurveTo(0,size*0.35,size*0.25,-size*0.1); 
  ctx.stroke();
  for (let i = -1; i <= 1; i++) {
    const tx = i*size*0.2;
    ctx.beginPath(); 
    ctx.moveTo(tx,-size*0.1); 
    ctx.lineTo(tx,-size*(0.6+Math.abs(i)*0.1)); 
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSpoon(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y); 
  ctx.rotate(rand(-0.2, 0.2));
  ctx.globalAlpha = alpha; 
  ctx.strokeStyle = color; 
  ctx.lineWidth = size*0.12; 
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  ctx.beginPath(); 
  ctx.moveTo(0, size*0.8); 
  ctx.lineTo(0, size*0.1); 
  ctx.stroke();
  ctx.beginPath(); 
  ctx.ellipse(0, -size*0.3, size*0.25, size*0.4, 0, 0, Math.PI*2); 
  ctx.stroke();
  ctx.lineWidth = size*0.05;
  ctx.beginPath(); 
  ctx.arc(size*0.08, -size*0.4, size*0.05, 0, Math.PI*2); 
  ctx.stroke();
  ctx.restore();
}

export function drawPlate(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y); 
  ctx.globalAlpha = alpha; 
  ctx.strokeStyle = color; 
  ctx.lineWidth = size*0.12;
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  ctx.beginPath(); 
  ctx.arc(0, 0, size*0.65, 0.2, Math.PI*2-0.2); 
  ctx.stroke();
  ctx.lineWidth = size*0.06;
  ctx.shadowBlur = 3;
  ctx.beginPath(); 
  ctx.arc(0, 0, size*0.4, 0, Math.PI*2); 
  ctx.stroke();
  ctx.restore();
}

export function drawGourmetStickers(ctx, W, H, color, count = 5, alpha = 0.1) {
  for (let i = 0; i < count; i++) {
    const x = rand(100, W-100), y = rand(100, H-100), size = rand(18, 36);
    const type = Math.floor(rand(0, 3));
    if (type === 0) drawFork(ctx, x, y, size, color, alpha);
    else if (type === 1) drawSpoon(ctx, x, y, size, color, alpha);
    else drawPlate(ctx, x, y, size, color, alpha);
  }
}