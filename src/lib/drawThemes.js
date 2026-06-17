/**
 * Draws a subtle radial gradient blob for background depth.
 */
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

export  function drawThemeTexture(ctx, W, H, textureType = 'dots', color = '#ffffff') {
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

export function drawTheme(ctx, W, H, themeName) {
  let style = {
    bg: '#0f172a',
    accent: '#f97316',
    gold: '#fbbf24',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.75)',
  };

  ctx.save();

  console.log("🎭 Switching to Theme:", themeName);

  switch (themeName) {
    case "glassmorphism":
      style = { bg: '#0f172a', accent: '#3b82f6', gold: '#60a5fa', text: '#ffffff', muted: 'rgba(255,255,255,0.8)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.2, H * 0.25, 620, 520, '#3b82f6', 0.38, 'screen');
      drawMeshBlob(ctx, W * 0.85, H * 0.75, 680, 580, '#60a5fa', 0.3, 'screen');
      ctx.fillStyle = "rgba(255,255,255,0.13)";
      ctx.fillRect(32, 32, W - 64, H - 64);
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(32, 32, W - 64, H - 64);
      break;

    case "paper":
      style = { bg: '#f8f5f0', accent: '#3f2a1e', gold: '#b45309', text: '#1c1917', muted: 'rgba(31,41,55,0.8)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0,0,0,0.028)';
      for (let i = 0; i < 4500; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1);
      }
      drawThemeTexture(ctx, W, H, 'dots', '#3f2a1e');
      break;

    case "dark":
      style = { bg: '#0a0a0a', accent: '#f97316', gold: '#fbbf24', text: '#f1f5f9', muted: 'rgba(241,245,249,0.75)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      const darkGrad = ctx.createRadialGradient(W/2, H/2, 80, W/2, H/2, Math.max(W,H));
      darkGrad.addColorStop(0, 'rgba(249,115,22,0.09)');
      darkGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, W, H);
      break;

    case "organic":
      style = { bg: '#f0fdf4', accent: '#16a34a', gold: '#ca8a04', text: '#14532d', muted: 'rgba(20,83,45,0.75)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.15, H * 0.3, 480, 420, '#4ade80', 0.45);
      drawMeshBlob(ctx, W * 0.8, H * 0.75, 520, 380, '#86efac', 0.38);
      break;

    case "rustic":
      style = { bg: '#3f2720', accent: '#f59e0b', gold: '#fbbf24', text: '#fefce8', muted: 'rgba(254,252,232,0.75)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(245,158,11,0.09)';
      ctx.fillRect(0, 0, W, H);
      break;

    case "pastel":
      style = { bg: '#f3e8ff', accent: '#a855f7', gold: '#ec4899', text: '#4c1d95', muted: 'rgba(76,29,149,0.7)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.25, H * 0.2, 550, 480, '#c084fc', 0.6);
      drawMeshBlob(ctx, W * 0.75, H * 0.75, 480, 520, '#f9a8d4', 0.55);
      break;

    case "cyber":
      style = { bg: '#020617', accent: '#22d3ee', gold: '#f97316', text: '#e0f2fe', muted: 'rgba(224,242,254,0.7)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(34,211,238,0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 36) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
      break;

    case "watercolor":
      style = { bg: '#f8fafc', accent: '#8b5cf6', gold: '#ec4899', text: '#1e2937', muted: 'rgba(30,41,59,0.75)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, W * 0.2, H * 0.3, 420, 380, 'rgba(167,139,250,0.7)', 0.75);
      drawMeshBlob(ctx, W * 0.7, H * 0.25, 380, 340, 'rgba(251,146,154,0.65)', 0.7);
      drawMeshBlob(ctx, W * 0.4, H * 0.75, 460, 390, 'rgba(134,239,172,0.6)', 0.65);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0,0,0,0.035)';
      ctx.fillRect(0, 0, W, H);
      break;

    default:
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#1e2937');
      grad.addColorStop(1, '#334155');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
  }

  drawThemeTexture(ctx, W, H, 'dots', style.text);

  console.log("✨ Applied Style Properties:", style);

  ctx.restore();
  return style;
}
