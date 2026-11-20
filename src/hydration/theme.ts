import {continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';
import face from './face.json';

// Fonts bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string, string][] = [
  ['HySans', 'fonts/Quicksand-500.woff2', 'normal', '500'], // captions: clean, rounded, NOT bold
  ['HySansLight', 'fonts/Quicksand-400.woff2', 'normal', '400'],
  ['HyDisplay', 'fonts/DMSerifDisplay.woff2', 'normal', '400'], // headline serif (like "Marriage")
  ['HyDisplayItalic', 'fonts/DMSerifDisplay-Italic.woff2', 'italic', '400'],
  ['HySerif', 'fonts/Cormorant-500.woff2', 'normal', '500'], // light elegant serif (like "Date Idea")
  ['HySerifItalic', 'fonts/Cormorant-500-Italic.woff2', 'italic', '500'], // italic accents (like "After")
  ['HyHand', 'fonts/Caveat-500.woff2', 'normal', '500'], // handwritten notes
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    FONTS.map(([family, file, style, weight]) =>
      new FontFace(family, `url(${staticFile(file)})`, {style, weight}).load().then((f) => document.fonts.add(f)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const FPS = 30;
export const DURATION_S = 26.17;
export const DURATION_IN_FRAMES = Math.round(DURATION_S * FPS);
export const sec = (s: number) => Math.round(s * FPS);

export const F = {
  caption: 'HySans',
  light: 'HySansLight',
  display: 'HyDisplay',
  displayItalic: 'HyDisplayItalic',
  serif: 'HySerif',
  serifItalic: 'HySerifItalic',
  hand: 'HyHand',
};

export const C = {
  butter: '#FFF0A6', // soft butter yellow
  butterDeep: '#F7DC7A',
  cream: '#FFFBEF',
  water: '#9FD3F2',
  waterDeep: '#5AAEE0',
  aqua: '#CDEFF7',
  pink: '#F8C8D6',
  lilac: '#DCD0F7',
  mint: '#CDEFD9',
  peach: '#FFD9C2',
  ink: '#3B3140',
  cocoa: '#4B3A3F',
};

// TikTok 9:16 safe zone (1080x1920): keep captions and key graphics inside.
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const SAFE_CX = (SAFE.left + SAFE.right) / 2; // 495

export const ease = Easing.inOut(Easing.cubic);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (f: number, i: number[], o: number[], e = ease) => interpolate(f, i, o, {...clamp, easing: e});

/** Smoothed face centre/width in source pixels for a frame (OpenCV track, scripts/hydration/track_face.py) */
export const faceAt = (frame: number) => {
  const r = (face as number[][])[Math.max(0, Math.min(face.length - 1, frame))];
  return {x: r[0], y: r[1], w: r[2]};
};
