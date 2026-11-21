import {continueRender, delayRender, staticFile} from 'remotion';

// All fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
// Styles follow the reference edits: chunky rounded titles, calligraphy script, elegant serif, clean caption sans.
const FONTS: [string, string, string, string][] = [
  ['HmCaption', 'fonts/Quicksand.ttf', 'normal', '300 700'], // captions (used at weight 500, never bold)
  ['HmRound', 'fonts/Fredoka.ttf', 'normal', '300 700'], // chunky rounded titles ("kecil" / "menebak" style)
  ['HmScript', 'fonts/GreatVibes-Regular.ttf', 'normal', '400'], // calligraphy ("Bellamee" / "playdate" style)
  ['HmSerif', 'fonts/DMSerifDisplay-Regular.ttf', 'normal', '400'], // serif ("After Marriage Date Idea" style)
  ['HmSerif', 'fonts/DMSerifDisplay-Italic.ttf', 'italic', '400'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading Hyalumelon fonts', {timeoutInMilliseconds: 120000, retries: 2});
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

export const F = {caption: 'HmCaption', round: 'HmRound', script: 'HmScript', serif: 'HmSerif'};

export const FPS = 30;
// Part A = talking video (src1, 45.53 s), Part B = spray demo (src2, 12.47 s), played back to back, untouched.
export const A_FRAMES = 1366;
export const B_FRAMES = 374;
export const A_SEC = A_FRAMES / FPS;
export const DURATION_IN_FRAMES = A_FRAMES + B_FRAMES;
export const sec = (s: number) => Math.round(s * FPS);

export const C = {
  butter: '#FFF0A6', // soft butter yellow (captions)
  butterDeep: '#F7DD78',
  cream: '#FFFBEA',
  melon: '#FF8FA3', // watermelon flesh pink
  melonDeep: '#F0657F',
  rind: '#8CCB7E', // watermelon rind green
  rindDeep: '#5FAE63',
  mint: '#CDEFD6',
  sky: '#CFE8FB',
  aqua: '#9AD7F0',
  lavender: '#DCD0F7',
  peach: '#FFD9C2',
  plum: '#4A3046',
  cocoa: '#5B4636',
  softRed: '#F08A9B',
  ok: '#6CC48C',
};

// TikTok 9:16 safe zone (1080x1920): text/graphics stay inside this box.
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const SAFE_W = SAFE.right - SAFE.left; // 830
export const SAFE_CX = (SAFE.left + SAFE.right) / 2; // 495
