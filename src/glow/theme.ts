import {continueRender, delayRender, Easing, interpolate, spring, staticFile} from 'remotion';

// Fonts bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string, string][] = [
  ['Poppins', 'fonts/Poppins-400.woff2', '400', 'normal'],
  ['Poppins', 'fonts/Poppins-500.woff2', '500', 'normal'],
  ['Poppins', 'fonts/Poppins-600.woff2', '600', 'normal'],
  ['Poppins', 'fonts/Poppins-700.woff2', '700', 'normal'],
  ['DM Sans', 'fonts/DMSans.woff2', '400 700', 'normal'],
  ['Instrument Serif', 'fonts/InstrumentSerif-Regular.woff2', '400', 'normal'],
  ['Instrument Serif', 'fonts/InstrumentSerif-Italic.woff2', '400', 'italic'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading glow fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    FONTS.map(([family, file, weight, style]) =>
      new FontFace(family, `url(${staticFile(file)})`, {weight, style}).load().then((f) => document.fonts.add(f)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const FPS = 30;
export const SPEECH_END_FRAME = 1196; // last frame of the source footage
export const DURATION = 1227; // + 1 s end-card hold
export const W = 1080;
export const H = 1920;

export const SANS = "'Poppins', 'DM Sans', sans-serif";
export const BODY = "'DM Sans', 'Poppins', sans-serif";
export const SERIF = "'Instrument Serif', Georgia, serif";

// Skincare palette
export const C = {
  blush: '#F7D9DF',
  blushMid: '#EFB8C4',
  rose: '#D98A9C',
  cream: '#FBF3E8',
  beige: '#EBDCC9',
  sand: '#D9C2A7',
  lavender: '#E6DFF5',
  lavMid: '#C9BBEB',
  lavDeep: '#9E8BD6',
  milk: '#FFFCF8',
  sky: '#DCECF8',
  skyMid: '#B4D5F0',
  skyDeep: '#7FB2DE',
  peach: '#FCDCC8',
  peachMid: '#F6BC9B',
  peachDeep: '#E99674',
  sage: '#B9CDB0',
  sageDeep: '#86A57C',
  ink: '#4B3442',
  inkSoft: '#8C7080',
};

export const sec = (s: number) => Math.round(s * FPS);
export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 -> 1 over `dur` frames starting at time `at` (seconds) */
export const prog = (f: number, at: number, dur = 14, easing = easeOut) =>
  interpolate(f, [at * FPS, at * FPS + dur], [0, 1], {...clamp, easing});
/** springy 0 -> ~1 starting at `at` seconds */
export const pop = (f: number, at: number, damping = 13, stiffness = 170) =>
  spring({frame: f - Math.round(at * FPS), fps: FPS, config: {damping, stiffness, mass: 0.7}});
/** visibility window: fades in at `a`, out at `b` (seconds) */
export const win = (f: number, a: number, b: number, inDur = 10, outDur = 9) =>
  Math.min(prog(f, a, inDur), 1 - prog(f, b - outDur / FPS, outDur, inOut));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clampI = (f: number, inp: number[], out: number[], easing = inOut) =>
  interpolate(f, inp, out, {...clamp, easing});
