import {continueRender, delayRender, staticFile} from 'remotion';

/* Skin Talks by Skincarehouse — master style (shared by every episode) */
const FONTS: [string, string, FontFaceDescriptors][] = [
  ['STRound', 'fonts/Fredoka.ttf', {weight: '300 700'}],
  ['STSans', 'fonts/Poppins-SemiBold.ttf', {weight: '600'}],
  ['STSansMed', 'fonts/Poppins-Medium.ttf', {weight: '500'}],
  ['STSerif', 'fonts/PlayfairDisplay-Italic.ttf', {weight: '400 900', style: 'italic'}],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const h = delayRender('skintalks fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(FONTS.map(([fam, file, d]) => new FontFace(fam, `url(${staticFile(file)})`, d).load().then((f) => document.fonts.add(f))))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
}
export const ROUND = 'STRound'; // captions (clean, rounded)
export const SANS = 'STSans';
export const SANS_MED = 'STSansMed';
export const SERIF = 'STSerif';

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
export const c01 = (x: number) => Math.min(1, Math.max(0, x));

export const P = {
  cream: '#FFF9F1',
  warmWhite: '#FFFDF8',
  beige: '#EADBC8',
  sand: '#D9C3A5',
  cocoa: '#4E3B30',
  sage: '#A8BF9C',
  sageDeep: '#7F9A72',
  butter: '#F3DE9C',
  blush: '#E9B7B1',
  blushDeep: '#D98F88',
  skin: '#F3D3BE',
  skinDeep: '#E7B99C',
  red: '#D9735F',
};

/* TikTok working safe zone (approx.): top 12%, bottom 22%, left 8%, right 17% */
export const SAFE = {top: 230, bottom: 1498, left: 86, right: 896};
export const SAFE_CX = (SAFE.left + SAFE.right) / 2;

/* host reference image (1536x1024) — approved character identities, never regenerated */
export const HOSTS_IMG = 'skintalks/hosts.png';
export const HOSTS = {
  maya: {name: 'Maya', role: 'Host', face: {x: 470, y: 300}, tint: P.blush},
  nadia: {name: 'Nadia', role: 'Co-Host', face: {x: 1130, y: 330}, tint: P.sage},
} as const;
export type HostId = keyof typeof HOSTS;
