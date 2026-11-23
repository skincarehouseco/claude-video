import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string, string][] = [
  ['PSans', 'fonts/Poppins-Regular.ttf', '400', 'normal'], // clean, regular-weight caption font
  ['PSansMed', 'fonts/Poppins-Medium.ttf', '500', 'normal'],
  ['PScript', 'fonts/NothingYouCouldDo.ttf', '400', 'normal'], // handwritten, like the reference's "Pestana Tinted Serum"
  ['PSerif', 'fonts/PlayfairDisplay.ttf', '400 600', 'normal'], // like the reference's "dramatic"
  ['PSerifIt', 'fonts/PlayfairDisplay-Italic.ttf', '400', 'italic'], // like "intensive growth"
  ['PRound', 'fonts/Fredoka.ttf', '300 700', 'normal'], // soft rounded display for pop words
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading Pestana fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    FONTS.map(([family, file, weight, style]) =>
      new FontFace(family, `url(${staticFile(file)})`, {weight, style}).load().then((ff) => document.fonts.add(ff)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const P = {
  butter: '#FFF0A6', // soft butter yellow — all caption text
  butterSoft: '#FFF6CC',
  cream: '#FFFBEF',
  pink: '#F7B8CC',
  rose: '#EC7FA6',
  berry: '#C2306F',
  lilac: '#D9C8F5',
  mint: '#BFEBD3',
  sky: '#C6E3FA',
  cocoa: '#4B3036',
};

// TikTok 9:16 safe zone (1080x1920): nothing important outside this box.
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};

// soft cocoa shadow keeps light butter-yellow text readable on any shot without making it look bold
export const TEXT_SHADOW =
  '0 0 2px rgba(52,24,34,0.95), 0 2px 3px rgba(52,24,34,0.75), 0 0 12px rgba(45,20,30,0.55), 0 5px 22px rgba(40,18,26,0.5)';
