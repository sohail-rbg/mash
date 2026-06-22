// 10 curated canvas themes for the Share Card.
// The active theme is picked in ShareCardCanvas via:
//   cardThemes[refreshKey % cardThemes.length]
// and drawn by drawTheme(ctx, W, H, themeName) in drawThemes.js.
//
//  1. Dark Elegant    – Wood Texture · Warm Glow · Soft Shadow · Leaf Particles
//  2. Neon Blue       – Neon Border · Dots Pattern · Blue Glow · Floating Leaves
//  3. Green Fresh     – Green Gradient · Leaf Elements · Soft Light · Clean Look
//  4. Minimal Light   – White Clean BG · Green Accent · Soft Shadow · Leaf Speckles
//  5. Purple Glow     – Purple Gradient · Neon Circles · Glow Effect · Modern Look
//  6. Orange Spice    – Spice Splash · Orange Accent · Brush Stroke · Bold Look
//  7. Cyber Blue      – Tech Lines · Futuristic Frame · Blue Highlights · Modern UI
//  8. Soft Pastel     – Pastel Gradient · Brush Stroke · Soft Shadow · Gentle Look
//  9. Luxury Gold     – Gold Accents · Premium Shine · Wave Lines · Elegant Look
// 10. Glass Morphism  – Glass Effect · Floating Leaves · Blur BG · Clean UI

export const cardThemes = [
  "darkElegant",
  "midnightNoir",
  "ecoLuxury",
  "minimalLight",
  "purpleGlow",
  "orangeSpice",
  "cyberBlue",
  "softPastel",
  "luxuryGold",
  "glassMorphism",
];

// Human-readable labels for each theme key — handy for showing the active
// design name in the UI (e.g. next to the Shuffle button) without having
// to hardcode strings in multiple places.
export const cardThemeLabels = {
  darkElegant: "Dark Elegant",
  midnightNoir: "Midnight Noir",
  ecoLuxury: "Eco Luxury",
  minimalLight: "Minimal Light",
  purpleGlow: "Purple Glow",
  orangeSpice: "Orange Spice",
  cyberBlue: "Cyber Blue",
  softPastel: "Soft Pastel",
  luxuryGold: "Luxury Gold",
  glassMorphism: "Glass Morphism",
};