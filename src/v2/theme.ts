import {continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';
import faceData from './face.json';

// Fonts bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string, string][] = [
  ['SkCaption', 'fonts/Quicksand.ttf', 'normal', '300 700'],
  ['SkSerif', 'fonts/PlayfairDisplay-Italic.ttf', 'italic', '400 900'],
  ['SkScript', 'fonts/DancingScript.ttf', 'normal', '400 700'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading v2 fonts', {timeoutInMilliseconds: 120000, retries: 2});
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
export const SRC_DURATION = 33.83; // seconds of source footage
export const DURATION_IN_FRAMES = Math.floor(SRC_DURATION * FPS);
export const sec = (s: number) => Math.round(s * FPS);

/** clean, light rounded sans for captions (regular weight, never bold) */
export const captionFont = 'SkCaption';
/** italic serif accent for key words / titles */
export const serifFont = 'SkSerif';
/** whimsical handwritten script accent */
export const scriptFont = 'SkScript';

export const C = {
  butter: '#FFF0A6', // soft butter yellow (captions)
  butterDeep: '#F6DE7C',
  cream: '#FFFBEA',
  pink: '#F9C6D5',
  blush: '#FF9FB8',
  rose: '#EE8FAE',
  lavender: '#D8CBF6',
  mint: '#C8EED6',
  sky: '#CBE4FA',
  peach: '#FFD8BE',
  ink: '#4A3A4E',
  okGreen: '#7FCB98',
  softRed: '#F08A9B',
};

// TikTok 9:16 safe zone (1080x1920): nothing important outside this box.
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const SAFE_CX = (SAFE.left + SAFE.right) / 2; // 495

// The two jump cuts in the source footage (frames)
export const CUTS = [652, 792];

// Smoothed face track (x, y, width in px) from scripts/v2_face_track.py
const FACE = faceData as number[][];
export const faceAt = (frame: number) => {
  const r = FACE[Math.max(0, Math.min(FACE.length - 1, Math.round(frame)))];
  return {x: r[0], y: r[1], w: r[2]};
};

export const easeIO = Easing.inOut(Easing.cubic);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [a, a+d] with smooth easing */
export const ramp = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], {...clamp, easing: easeIO});
