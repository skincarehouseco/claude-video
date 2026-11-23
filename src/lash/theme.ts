import {continueRender, delayRender, Easing, staticFile} from 'remotion';
import edit from './edit.json';

// Fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string, string][] = [
  ['LashSans', 'fonts/Poppins-Regular.ttf', 'normal', '400'],
  ['LashSansLight', 'fonts/Poppins-Light.ttf', 'normal', '300'],
  ['LashSerif', 'fonts/PlayfairDisplay-Regular.ttf', 'normal', '400 900'],
  ['LashSerifItalic', 'fonts/PlayfairDisplay-Italic.ttf', 'italic', '400 900'],
  ['LashHand', 'fonts/Caveat.ttf', 'normal', '400 700'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading lash fonts', {timeoutInMilliseconds: 120000, retries: 2});
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

export const FPS = edit.fps;
export const DURATION = edit.duration;
export const DURATION_IN_FRAMES = Math.ceil(DURATION * FPS);
export const A = edit.anchors as Record<string, number>;
export const f = (s: number) => Math.round(s * FPS);

// clean, regular-weight sans for captions (no bold)
export const sans = 'LashSans';
export const sansLight = 'LashSansLight';
// elegant serif + italic for step titles (like the reference: "3. Apply in a *zigzag motion*")
export const serif = 'LashSerif';
export const serifItalic = 'LashSerifItalic';
// handwritten notes + arrows (like "Mascara-like effect" in the reference)
export const hand = 'LashHand';

export const C = {
  butter: '#FFF1A8', // soft butter yellow captions
  cream: '#FFFBF0',
  white: '#FFFFFF',
  blush: '#F8C8D4',
  rose: '#EE9AB2',
  lilac: '#D9CCF5',
  mint: '#C9EEDA',
  cocoa: '#4B3640',
  ink: '#2E2229',
};

// TikTok 9:16 safe zone (1080x1920): keep text/graphics inside this box
export const SAFE = {top: 160, bottom: 1490, left: 80, right: 910};
export const CX = (SAFE.left + SAFE.right) / 2; // 495

export const softShadow = '0 2px 3px rgba(30,20,25,0.55), 0 0 18px rgba(30,20,25,0.35)';
export const ease = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
