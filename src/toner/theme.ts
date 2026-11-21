import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts bundled in public/fonts (OFL / Apache) so renders work offline.
const FONTS: [string, string, string, string][] = [
  ['TonerSans', 'fonts/Quicksand.ttf', 'normal', '300 700'], // clean caption font (regular/medium only)
  ['TonerScript', 'fonts/GreatVibes-Regular.ttf', 'normal', '400'], // "Bellamee"-style script
  ['TonerSerif', 'fonts/PlayfairDisplay-Italic.ttf', 'italic', '400 900'], // "After Marriage"-style serif italic
  ['TonerBubble', 'fonts/Chewy-Regular.ttf', 'normal', '400'], // "makan nonton pulang"-style bubbly hand
  ['TonerPixel', 'fonts/PixelifySans.ttf', 'normal', '400 700'], // tiny pixel accents
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading toner fonts', {timeoutInMilliseconds: 120000, retries: 2});
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

export const F = {
  sans: 'TonerSans',
  script: 'TonerScript',
  serif: 'TonerSerif',
  bubble: 'TonerBubble',
  pixel: 'TonerPixel',
};

export const FPS = 30;
export const DURATION = 374; // 12.47 s – the full original clip, nothing trimmed

// Hard cuts in the source (ffmpeg scene detection), in frames
export const CUTS = [39, 59, 73, 101, 193, 216, 242];
// cuts that get the zoom-through + blur transition (topic changes); the rest get a soft dissolve
export const ZOOM_THROUGH = [101, 193, 242];

export const C = {
  butter: '#FFF0A6', // soft butter yellow – captions
  butterDeep: '#F7DF7E',
  cream: '#FFFBEA',
  milk: '#FFFDF6',
  pink: '#F9C6D5',
  rose: '#EE8FAE',
  lavender: '#D8CBF6',
  mint: '#CDEFD2',
  sage: '#A9CDA0',
  sky: '#CBE4FA',
  cocoa: '#5B4636',
  plum: '#3E2C4A',
};

// TikTok 9:16 safe zone on 1080x1920 (top bar, right action rail, bottom caption/UI)
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const SAFE_CX = (SAFE.left + SAFE.right) / 2; // 495
