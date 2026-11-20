import {continueRender, delayRender, staticFile} from 'remotion';

/*
 * Lash-serum edit (14.57 s, 30 fps, 1080x1920).
 * All times are in seconds of the original clip; the edit plays at 1x so the
 * original audio (the "You got two choices… yes or yes" track) stays untouched.
 */
export const LASH_FPS = 30;
export const LASH_DURATION = 437; // 14.567 s
export const f = (s: number) => Math.round(s * LASH_FPS);

// Extra fonts for this edit (SIL OFL, bundled in public/fonts)
// [family, file, weight, style]
const EXTRA_FONTS: [string, string, string, string][] = [
  ['LashHand', 'fonts/SwankyandMooMoo-Regular.ttf', '400', 'normal'],
  ['LashScript', 'fonts/PinyonScript-Regular.ttf', '400', 'normal'],
  // typography references (unboxing / date-idea / "what's that edit" / pasar-anyar clips)
  ['LashSans', 'fonts/Poppins-Regular.ttf', '400', 'normal'], // clean rounded sans (refs 1 + 4)
  ['LashSans', 'fonts/Poppins-Medium.ttf', '500', 'normal'],
  ['LashSans', 'fonts/Poppins-SemiBoldItalic.ttf', '600', 'italic'],
  ['LashSerif', 'fonts/PlayfairDisplay.ttf', '400 900', 'normal'], // editorial serif (ref 2)
  ['LashSerif', 'fonts/PlayfairDisplay-Italic.ttf', '400 900', 'italic'],
  ['LashBrush', 'fonts/Yellowtail-Regular.ttf', '400', 'normal'], // brush script, like "makan" (ref 2)
  ['LashY2K', 'fonts/Comfortaa.ttf', '300 700', 'normal'], // bubbly geometric, like "what's that edit" (ref 3)
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading lash fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    EXTRA_FONTS.map(([family, file, weight, style]) =>
      new FontFace(family, `url(${staticFile(file)})`, {weight, style}).load().then((ff) => document.fonts.add(ff)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}
export const handFont = 'LashHand';
export const scriptFont = 'LashScript';
export const sansFont = 'LashSans';
export const serifFont2 = 'LashSerif';
export const brushFont = 'LashBrush';
export const y2kFont = 'LashY2K';

// Hard cuts in the source (ffmpeg scene detection), in frames.
export const CUTS = [57, 79, 102, 118, 138, 174, 216, 263, 298, 333, 359, 380, 396, 410];

/*
 * Text beats copied from the reference video (same wording, same order),
 * re-timed so each one lands on the matching action in this footage.
 */
export type Beat = {id: string; from: number; to: number};
export const BEATS: Beat[] = [
  {id: 'comment', from: 0, to: 57}, // holding both tubes: "pakai mana dulu? merah or pink?"
  {id: 'tonic', from: 57, to: 102}, // finger "1" + rose-gold tube
  {id: 'root', from: 102, to: 174}, // opening tonic + applying at the root
  {id: 'focus', from: 174, to: 216}, // close-up on lashes
  {id: 'jelly', from: 216, to: 298}, // peace sign + red tube
  {id: 'hydrate', from: 298, to: 359}, // applying jelly lash oil
  {id: 'worry', from: 359, to: 410}, // with the mirror
  {id: 'cta', from: 410, to: LASH_DURATION}, // eye close-up
];
// cuts that start a new text beat get the bigger zoom-through transition
export const SECTION_CUTS = BEATS.slice(1).map((b) => b.from);

/*
 * Sung lyric captions. Word timings from Whisper large-v3, then corrected by hand
 * against the vocal harmonics in the spectrogram (Whisper put "Yes" ~0.6 s early).
 */
export type LyricWord = {text: string; start: number; end: number};
export const LYRICS: {start: number; end: number; words: LyricWord[]}[] = [
  {
    start: 0.0,
    end: 1.7,
    words: [
      {text: 'You', start: 0.05, end: 0.22},
      {text: 'got', start: 0.22, end: 0.38},
      {text: 'two', start: 0.38, end: 0.62},
      {text: 'choices', start: 0.64, end: 1.45},
    ],
  },
  {
    start: 2.45,
    end: 4.85,
    words: [
      {text: 'Yes', start: 2.55, end: 3.0},
      {text: 'or', start: 3.02, end: 3.6},
      {text: 'yes', start: 3.64, end: 4.6},
    ],
  },
];
