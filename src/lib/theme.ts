// Design tokens for the yello whimsy series.
// Flat colours only — no gradients anywhere (per brief).
export const W = 1080;
export const H = 1920;
export const FPS = 30;

// TikTok 9:16 safe zone (1080x1920): keep clear of the top bar,
// the right-hand action rail, and the bottom caption/username block.
export const SAFE = {
  top: 170,
  bottom: 1440, // y — everything important stays above this
  left: 80,
  right: 930, // x — action rail lives to the right of this
};
export const SAFE_CX = (SAFE.left + SAFE.right) / 2;

export const C = {
  butter: "#FBEFA0", // soft butter yellow — captions
  butterDeep: "#F6DE6E",
  cream: "#FFF9EC",
  orange: "#F2892B", // yello lid orange
  turmeric: "#E9A322",
  cocoa: "#5A3418", // outline / shadow ink
  blush: "#F7B9C4",
  lilac: "#C9B6F2",
  sky: "#BFE3F5",
  white: "#FFFFFF",
};

export const FONT = {
  caption: "Quicksand", // clean, rounded, non-bold
  pixel: "VT323", // whimsical pixel display
  pixel2: "Pixelify Sans",
  script: "Sacramento", // cursive accents
};

// Gentle "polish" grade: a touch of contrast/clarity, natural hues.
// No LUT, no tint, no gradient overlays.
export const GRADE = "contrast(1.06) saturate(1.07) brightness(1.03)";
