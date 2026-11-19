import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string][] = [
  ['WhimsyCaption', 'fonts/PatrickHand-Regular.ttf', 'normal'],
  ['WhimsyPixel', 'fonts/PixelifySans.ttf', 'normal'],
  ['WhimsySerif', 'fonts/PlayfairDisplay-Italic.ttf', 'italic'],
  ['WhimsyRound', 'fonts/Fredoka.ttf', 'normal'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    FONTS.map(([family, file, style]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, {weight: family === 'WhimsyRound' ? '300 700' : '400', style});
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const FPS = 30;
// Whole edit plays 1.3x faster (77 s source -> ~59 s) so it stays under one minute.
// All timings in the code are written in SOURCE seconds and mapped through these helpers.
export const SPEED = 1.3;
export const DURATION_IN_FRAMES = Math.round((76.8 * FPS) / SPEED);
/** composition frame -> source time (s) */
export const srcTime = (frame: number) => (frame / FPS) * SPEED;

// Clean, light handwritten font for captions (regular weight only — no bold)
export const captionFont = 'WhimsyCaption';
// Pixel display font (like the "whimsical sound effects" reference)
export const pixelFont = 'WhimsyPixel';
// Elegant italic serif accents (like the Scholar / Sylvan reference)
export const serifFont = 'WhimsySerif';
// Clean, modern rounded sans for ingredient names + info notes
export const roundFont = 'WhimsyRound';

export const C = {
  butter: '#FFF0A6', // soft butter yellow (captions)
  butterDeep: '#F6DE7C',
  cream: '#FFFBEA',
  pink: '#F9C6D5',
  rose: '#EE8FAE',
  lavender: '#D8CBF6',
  mint: '#C8EED6',
  sky: '#CBE4FA',
  peach: '#FFD8BE',
  ink: '#4A3A4E',
  cocoa: '#5B4636',
  okGreen: '#6CC48C',
  plum: '#3E2C4A',
  softRed: '#F08A9B',
};

// TikTok 9:16 safe zone (px, 1080x1920): keep text/graphics inside this box.
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const SAFE_CENTER_X = (SAFE.left + SAFE.right) / 2; // 495

/** source time (s) -> composition frame */
export const sec = (s: number) => Math.round((s * FPS) / SPEED);
