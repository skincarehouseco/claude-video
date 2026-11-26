import {continueRender, delayRender, Easing, interpolate, spring, staticFile} from 'remotion';

/* Fonts (SIL OFL, bundled in public/fonts so renders work offline) */
const FONTS: [string, string, FontFaceDescriptors][] = [
  // bold explainer typography: Montserrat throughout; "display" faces are registered heavy-only so every headline renders 800-900
  ['BSans', 'fonts/Montserrat.ttf', {weight: '100 900'}],
  ['BSerif', 'fonts/Montserrat.ttf', {weight: '800 900'}],
  ['BSerifItalic', 'fonts/Montserrat-Italic.ttf', {weight: '800 900', style: 'italic'}],
  // annotations: heavy italic "marker" style instead of cute handwriting
  ['BHand', 'fonts/Montserrat-Italic.ttf', {weight: '800 900', style: 'italic'}],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading Blumé fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    FONTS.map(([family, file, desc]) =>
      new FontFace(family, `url(${staticFile(file)})`, desc).load().then((f) => document.fonts.add(f)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const SANS = 'BSans';
export const SERIF = 'BSerif';
export const SERIF_I = 'BSerifItalic';
export const HAND = 'BHand';

export const FPS = 30;
export const DURATION = 949; // 31.633 s — full original length, real-time (no speed change)
export const W = 1080;
export const H = 1920;

/** Explainer palette: white / charcoal / signal yellow / product coral-red / clear blue (keys kept for compatibility) */
export const C = {
  blush: '#F1F1EE',
  blushDeep: '#DCDCD6',
  rose: '#FF6A3D',
  dusty: '#E5532E',
  cherry: '#E63B2E',
  lilac: '#E9EEF6',
  lilacMid: '#C7D5EC',
  lilacDeep: '#2E5BBA',
  cream: '#FFFFFF',
  butter: '#FFF2A8',
  butterDeep: '#FFC400',
  sky: '#E2F0FB',
  skyMid: '#B3D7F3',
  skyDeep: '#1C74C9',
  peach: '#FFE3D3',
  peachMid: '#FFC0A2',
  coral: '#F2643C',
  coralDeep: '#D9432A',
  beige: '#ECE7DE',
  ink: '#141414',
  inkSoft: '#4A4A4A',
  white: '#FFFFFF',
};

// TikTok 9:16 safe zone: keep text and key graphics inside
export const SAFE = {top: 160, bottom: 1490, left: 70, right: 905};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = Easing.bezier(0.45, 0, 0.2, 1);
/** eased 0..1 progress of t between a and b */
export const prog = (t: number, a: number, b: number, e: (x: number) => number = smooth) => e(clamp01((t - a) / (b - a)));
/** spring starting at time `at` (seconds) */
export const pop = (t: number, at: number, cfg = {damping: 15, stiffness: 150, mass: 0.7}) =>
  spring({frame: (t - at) * FPS, fps: FPS, config: cfg});
export const popSoft = (t: number, at: number) => pop(t, at, {damping: 18, stiffness: 110, mass: 0.9});
/** fade-in at `a`, fade-out around `b` */
export const life = (t: number, a: number, b: number, fin = 0.18, fout = 0.22) =>
  Math.min(prog(t, a, a + fin), 1 - prog(t, b - fout, b));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ramp = (t: number, pts: number[], vals: number[]) =>
  interpolate(t, pts, vals, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: smooth});
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** section boundaries (seconds, source time = composition time) */
export const S = {
  hook: [0, 1.93],
  hello: [1.93, 3.3],
  guide: [3.3, 5.95],
  cleanse: [5.95, 8.7],
  dry: [8.7, 10.84],
  product: [10.84, 13.78],
  two: [13.78, 15.78],
  way1: [15.78, 17.85],
  way2: [17.85, 20.8],
  lock: [20.8, 23.7],
  recap: [23.7, 24.3],
  promo: [24.3, 27.62],
  free: [27.62, 30.1],
  cta: [30.1, 31.64],
} as const;
export type SectionKey = keyof typeof S;

/* ---------- edit variant (A = original, B = polaroid / scrapbook alternate) ---------- */
import {createContext, useContext} from 'react';
export type Variant = 'A' | 'B';
export const VariantCtx = createContext<Variant>('A');
export const useVariant = () => useContext(VariantCtx);
