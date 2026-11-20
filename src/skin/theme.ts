import {continueRender, delayRender, Easing, interpolate, spring, staticFile} from 'remotion';

// Fonts bundled in public/fonts (SIL Open Font License) so renders work offline. Regular weights only.
const FONTS: [string, string, FontFaceDescriptors][] = [
  ['SkinSans', 'fonts/DMSans.ttf', {weight: '100 1000', style: 'normal'}],
  ['SkinDisplay', 'fonts/DMSerifDisplay-Regular.ttf', {weight: '400', style: 'normal'}],
  ['SkinItalic', 'fonts/PlayfairDisplay-Italic.ttf', {weight: '400 900', style: 'italic'}],
  ['SkinRound', 'fonts/Fredoka.ttf', {weight: '300 700', style: 'normal'}],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(FONTS.map(([family, file, desc]) => new FontFace(family, `url(${staticFile(file)})`, desc).load().then((f) => document.fonts.add(f))))
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const FPS = 30;
export const SOURCE_DURATION = 42.9;
export const DURATION_IN_FRAMES = Math.round(SOURCE_DURATION * FPS);
/** seconds -> frame */
export const sec = (s: number) => Math.round(s * FPS);

/** Clean, easy-to-read regular sans for captions (never bold) */
export const captionFont = 'SkinSans';
/** Elegant display serif for headings (like the "After Marriage" reference) */
export const displayFont = 'SkinDisplay';
/** Italic serif accents */
export const italicFont = 'SkinItalic';
/** Soft rounded sans for small labels */
export const roundFont = 'SkinRound';
export const emojiFont = '"Apple Color Emoji","Noto Color Emoji","Segoe UI Emoji",sans-serif';

export const C = {
  butter: '#FFF1A8', // soft butter yellow (captions)
  butterDeep: '#F7DF7E',
  cream: '#FFFBF0',
  paper: '#FFF8EE',
  ink: '#4A3A4E',
  cocoa: '#5B4636',
  coral: '#F2788C',
  rose: '#F7B7C6',
  blush: '#FFD3DC',
  lavender: '#D9CCF7',
  mint: '#BFEBD0',
  okGreen: '#58B97E',
  noRed: '#EE6F82',
  sky: '#CDE6FB',
  peach: '#FFD9C2',
  skin: '#FFE0CC',
};

// TikTok 9:16 safe zone (px, 1080x1920): keep text/graphics inside this box.
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const SAFE_CENTER_X = (SAFE.left + SAFE.right) / 2; // 495

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeIO = Easing.inOut(Easing.cubic);

/** springy 0->1 pop starting at time `at` (s) */
export const pop = (frame: number, at: number, fps = FPS, stiff = 170, damp = 13) =>
  spring({frame: frame - sec(at), fps, config: {damping: damp, stiffness: stiff, mass: 0.7}});

/** smooth 1->0 exit between `at` and `at + dur` (s) */
export const exitAt = (frame: number, at: number, dur = 0.3) =>
  1 - interpolate(frame, [sec(at), sec(at + dur)], [0, 1], {easing: Easing.in(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** gentle floating bob */
export const bob = (frame: number, amp = 5, period = 70, phase = 0) => Math.sin(((frame + phase) / period) * Math.PI * 2) * amp;
