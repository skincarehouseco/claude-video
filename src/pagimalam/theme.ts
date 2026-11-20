import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts bundled in public/fonts (SIL Open Font License), picked to match the 4 style references:
//  - thin clean sans (captions)            -> Poppins Light
//  - elegant display serif ("After Marriage") -> DM Serif Display (+ italic)
//  - handwritten marker ("playdate")        -> Caveat
//  - bubbly rounded ("what's that edit")    -> Sniglet
//  - soft rounded sans for small notes      -> Quicksand
const FONTS: [string, string, string, string][] = [
  ['PM Caption', 'fonts/Poppins-Light.ttf', '300', 'normal'],
  ['PM Serif', 'fonts/DMSerifDisplay-Regular.ttf', '400', 'normal'],
  ['PM Serif', 'fonts/DMSerifDisplay-Italic.ttf', '400', 'italic'],
  ['PM Hand', 'fonts/Caveat[wght].ttf', '400 700', 'normal'],
  ['PM Bubble', 'fonts/Sniglet-Regular.ttf', '400', 'normal'],
  ['PM Round', 'fonts/Quicksand[wght].ttf', '300 700', 'normal'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading Pagi/Malam fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    FONTS.map(([family, file, weight, style]) =>
      new FontFace(family, `url("${staticFile(file)}")`, {weight, style}).load().then((f) => document.fonts.add(f)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const F = {
  caption: '"PM Caption"',
  serif: '"PM Serif"',
  hand: '"PM Hand"',
  bubble: '"PM Bubble"',
  round: '"PM Round"',
};

export const FPS = 30;
export const SOURCE_SECONDS = 59.9;
export const DURATION = Math.round(SOURCE_SECONDS * FPS); // footage plays at 1x: nothing cut or sped up
export const fr = (s: number) => Math.round(s * FPS);

export const C = {
  butter: '#FFF1A8', // soft butter yellow (captions)
  butterDeep: '#F7DD7A',
  cream: '#FFFBEF',
  pink: '#F9C9DA',
  rose: '#EE93B3',
  lilac: '#DCCBF7',
  lavender: '#B9A2EA',
  mint: '#C7EFD9',
  sky: '#CFE6FB',
  peach: '#FFD6BF',
  plum: '#4A3352',
  cocoa: '#5A4338',
  ok: '#7CCB98',
  no: '#F0899C',
  warn: '#F7C873',
};

// TikTok 9:16 safe zone on 1080x1920 (top bar, right action rail, bottom caption/UI)
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const CX = (SAFE.left + SAFE.right) / 2; // 495
