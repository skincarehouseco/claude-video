import {continueRender, delayRender, staticFile} from 'remotion';

// All fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string][] = [
  ['Cap', 'fonts/Quicksand.ttf', '300 700'], // captions: clean rounded sans, medium weight (not bold)
  ['Round', 'fonts/Fredoka.ttf', '300 700'], // "stop pakai", "TAPI JAP!", "consistency"
  ['Hand', 'fonts/GochiHand.ttf', '400'], // "WHAT IF I STOP"
  ['Script', 'fonts/Sacramento.ttf', '400'], // neon script "gugur", "understand"
  ['Scribble', 'fonts/Caveat.ttf', '400 700'], // "using lash serum?", "3 months", "dalam keadaan asal"
  ['Thin', 'fonts/NothingYouCouldDo.ttf', '400'], // "lash serum tak bagi permanent result?"
  ['Serif', 'fonts/InstrumentSerif.ttf', '400'], // yellow highlight boxes
  ['Cond', 'fonts/BarlowCondensed-MediumItalic.ttf', '500'], // anagen / telogen copy
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    FONTS.map(([family, file, weight]) =>
      new FontFace(family, `url(${staticFile(file)})`, {weight, style: family === 'Cond' ? 'italic' : 'normal'})
        .load()
        .then((f) => document.fonts.add(f)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const FPS = 30;
export const VOICE_SECONDS = 55.14; // cleaned + tightened voice-over (scripts/edit_voice.py)
export const DURATION_IN_FRAMES = Math.ceil((VOICE_SECONDS + 0.1) * FPS);
export const f = (s: number) => Math.round(s * FPS);

export const C = {
  butter: '#FFF1A8', // soft butter yellow (captions)
  butterBox: '#FFF3A0',
  cream: '#FFFDF3',
  pink: '#FF5FA2',
  neon: '#FF8CC6',
  rose: '#E2367E',
  ink: '#2B2230',
  lilac: '#E9D8FF',
  mint: '#BFEFD9',
};

// TikTok 9:16 safe zone (px, 1080x1920): keep all text/graphics inside this box.
export const SAFE = {top: 160, bottom: 1920 - 430, left: 80, right: 1080 - 170};
export const SAFE_CX = (SAFE.left + SAFE.right) / 2; // 495
