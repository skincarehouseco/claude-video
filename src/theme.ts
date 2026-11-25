import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
const FONTS: [string, string, string, string][] = [
  ['Poppins', 'fonts/Poppins-SemiBold.ttf', '600', 'normal'],
  ['Poppins', 'fonts/Poppins-ExtraBold.ttf', '800', 'normal'],
  ['Poppins', 'fonts/Poppins-BlackItalic.ttf', '900', 'italic'],
  ['Lilita', 'fonts/LilitaOne-Regular.ttf', '400', 'normal'],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading fonts', {timeoutInMilliseconds: 120000, retries: 2});
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
// Same length as the source video (87.53 s, 2626 frames) — nothing is cut or sped up.
export const DURATION_IN_FRAMES = 2626;
export const sec = (s: number) => Math.round(s * FPS);

export const SANS = 'Poppins';
export const DISPLAY = 'Lilita';

export const C = {
  ink: '#0E1B24',
  ink2: '#17303D',
  yellow: '#FFD23F',
  red: '#FF4545',
  green: '#1FBF6A',
  teal: '#12B5A6',
  blue: '#2F7BF6',
  white: '#FFFFFF',
  cream: '#F6F1E9',
  gold: '#F2A900',
  skin: '#E8B796',
  mute: '#5C6B73',
};

// TikTok 9:16 safe zone (px, 1080x1920): keep text/graphics inside this box.
export const SAFE = {top: 160, bottom: 1490, left: 80, right: 910};
export const CX = (SAFE.left + SAFE.right) / 2; // 495
