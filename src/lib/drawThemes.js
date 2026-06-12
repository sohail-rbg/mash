/**
 * Shared utility for drawing mesh blobs used in various themes.
 */
function drawMeshBlob(ctx, x, y, rx, ry, color, alpha, composite = 'source-over') {
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
}

/**
 * Main entry point for theme drawing.
 * Returns the style object (colors) used by the component for text/accents.
 */
export function drawTheme(ctx, W, H, themeName) {
  let style = {
    bg: '#000000',
    accent: '#3b82f6',
    gold: '#fbbf24',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.6)'
  };

  ctx.save();

  switch (themeName) {
    case "glassmorphism":
      style = { bg: '#0f172a', accent: '#3b82f6', gold: '#60a5fa', text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      drawMeshBlob(ctx, 0, 0, 700, 600, style.accent, 0.4, 'screen');
      drawMeshBlob(ctx, W, H, 600, 800, style.gold, 0.3, 'screen');
      // Glassmorphism Card (Card 1)
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(30, 30, W - 60, H - 60);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.strokeRect(30, 30, W - 60, H - 60);
      break;

    case "neon":
      style = { bg: '#050110', accent: '#ff00ff', gold: '#00ffff', text: '#ffffff', muted: 'rgba(255,255,255,0.5)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Neon Card (Card 2)
      ctx.shadowColor = "#ff00ff";
      ctx.shadowBlur = 40;
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, W - 80, H - 80);
      break;

    case "paper":
      style = { bg: '#fdfbf7', accent: '#4b5563', gold: '#92400e', text: '#1f2937', muted: 'rgba(31,41,55,0.6)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Paper Texture (Card 3)
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      for (let i = 0; i < 3000; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
      break;

    case "dark":
      style = { bg: '#0f0f0f', accent: '#333333', gold: '#aaaaaa', text: '#ffffff', muted: 'rgba(255,255,255,0.6)' };
      // Dark Minimal (Card 4)
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#333";
      ctx.strokeRect(20, 20, W - 40, H - 40);
      break;

    case "organic":
      style = { bg: '#f0fdf4', accent: '#16a34a', gold: '#ca8a04', text: '#14532d', muted: 'rgba(20,83,45,0.6)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Green Organic (Card 5)
      ctx.fillStyle = "rgba(34,197,94,.1)";
      ctx.beginPath();
      ctx.arc(0, 0, 300, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W, H, 300, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "doodle":
      style = { bg: '#ffffff', accent: '#000000', gold: '#2563eb', text: '#000000', muted: 'rgba(0,0,0,0.5)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Doodle Sketch (Card 6)
      ctx.strokeStyle = "rgba(0,0,0,.08)";
      for (let i = 0; i < W; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
      break;

    case "gradient":
      style = { bg: '#ff9a9e', accent: '#a18cd1', gold: '#ff9a9e', text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };
      // Gradient Mesh (Card 7)
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#ff9a9e");
      g.addColorStop(1, "#a18cd1");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      break;

    case "rustic":
      style = { bg: '#451a03', accent: '#f59e0b', gold: '#fbbf24', text: '#fffbeb', muted: 'rgba(255,251,235,0.6)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Rustic Wood (Card 8)
      ctx.fillStyle = "#4a2c17";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.05)";
      for (let i = 0; i < W; i += 20) {
        ctx.strokeRect(i, 0, 2, H);
      }
      break;

    case "islamic":
      style = { bg: '#064e3b', accent: '#fbbf24', gold: '#f59e0b', text: '#ecfdf5', muted: 'rgba(236,253,245,0.6)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Islamic Pattern (Card 9)
      ctx.strokeStyle = "rgba(255,215,0,.12)";
      for (let i = 0; i < W + H; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(0, i);
        ctx.stroke();
      }
      break;

    case "pastel":
      style = { bg: '#f5f3ff', accent: '#a78bfa', gold: '#f472b6', text: '#4c1d95', muted: 'rgba(76,29,149,0.5)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Pastel Card (Card 10)
      drawMeshBlob(ctx, W, 0, 500, 500, "#fbcfe8", 1);
      drawMeshBlob(ctx, 0, H, 500, 500, "#ddd6fe", 1);
      break;

    case "brush":
      style = { bg: '#fafafa', accent: '#ef4444', gold: '#1e2937', text: '#111827', muted: 'rgba(17,24,39,0.6)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Brush Stroke (Card 11)
      ctx.fillStyle = "rgba(239,68,68,.05)";
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2, 300, 100, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "cyber":
      style = { bg: '#020617', accent: '#22d3ee', gold: '#f97316', text: '#ffffff', muted: 'rgba(255,255,255,0.5)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Cyber Tech (Card 12)
      ctx.strokeStyle = "rgba(34,211,238,.1)";
      for (let i = 0; i < W; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
      break;

    case "watercolor":
      style = { bg: '#f8fafc', accent: '#a78bfa', gold: '#f472b6', text: '#4c1d95', muted: 'rgba(76,29,149,0.5)' };
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
      // Watercolor effect
      drawMeshBlob(ctx, W * 0.2, H * 0.3, 400, 300, 'rgba(173, 216, 230, 0.6)', 0.8, 'source-over'); // Light blue
      drawMeshBlob(ctx, W * 0.7, H * 0.2, 350, 250, 'rgba(255, 192, 203, 0.6)', 0.7, 'source-over'); // Pink
      drawMeshBlob(ctx, W * 0.4, H * 0.7, 450, 350, 'rgba(144, 238, 144, 0.6)', 0.9, 'source-over'); // Light green
      drawMeshBlob(ctx, W * 0.9, H * 0.8, 300, 400, 'rgba(255, 223, 186, 0.6)', 0.6, 'source-over'); // Peach
      ctx.globalCompositeOperation = 'multiply'; // Blend colors
      ctx.fillStyle = 'rgba(0,0,0,0.02)'; // Subtle texture
      ctx.fillRect(0, 0, W, H);
      break;


    default:
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
  return style;
}

/**
 * Optional global texture layer that can be applied on top of any theme.
 */
export function drawThemeTexture(ctx, W, H, textureType, color) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  if (textureType === 'lines') {
    for (let i = -H; i < W + H; i += 55) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
    }
  } else if (textureType === 'grid') {
    for (let i = 0; i < W; i += 45) ctx.fillRect(i, 0, 1, H);
    for (let j = 0; j < H; j += 45) ctx.fillRect(0, j, W, 1);
  } else if (textureType === 'dots') {
    for (let i = 30; i < W; i += 55)
      for (let j = 30; j < H; j += 55) {
        ctx.beginPath(); ctx.arc(i, j, 1.8, 0, Math.PI * 2); ctx.fill();
      }
  }
  ctx.restore();
}