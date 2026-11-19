import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string][] = [
  ['WhimsyCaption', 'fonts/PatrickHand-Regular.ttf', 'normal'],
  ['WhimsyPixel', 'fonts/PixelifySans.ttf', 'normal'],
  ['WhimsySerif', 'fonts/PlayfairDisplay-Italic.ttf', 'italic'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading fonts');
  Promise.all(
    FONTS.map(([family, file, style]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, {weight: '400', style});
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
export const DURATION_IN_FRAMES = Math.round(76.8 * FPS);

// Clean, light handwritten font for captions (regular weight only — no bold)
export const captionFont = 'WhimsyCaption';
// Pixel display font (like the "whimsical sound effects" reference)
export const pixelFont = 'WhimsyPixel';
// Elegant italic serif accents (like the Scholar / Sylvan reference)
export const serifFont = 'WhimsySerif';

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
  okGreen: '#7CCB98',
  softRed: '#F08A9B',
};

// TikTok 9:16 safe zone (px, 1080x1920): keep text/graphics inside this box.
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const SAFE_CENTER_X = (SAFE.left + SAFE.right) / 2; // 495

export const sec = (s: number) => Math.round(s * FPS);
