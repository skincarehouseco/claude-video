import {continueRender, delayRender, staticFile} from 'remotion';

/* ------------------------------------------------------------------
   Fonts (SIL OFL, bundled in public/fonts)
   ------------------------------------------------------------------ */
const FONTS: [string, string, FontFaceDescriptors][] = [
  ['BeigeSans', 'fonts/Poppins-SemiBold.ttf', {weight: '600'}],
  ['BeigeSansMed', 'fonts/Poppins-Medium.ttf', {weight: '500'}],
  ['BeigeSerif', 'fonts/PlayfairDisplay-Italic.ttf', {weight: '400 900', style: 'italic'}],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const h = delayRender('beige fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(FONTS.map(([fam, file, d]) => new FontFace(fam, `url(${staticFile(file)})`, d).load().then((f) => document.fonts.add(f))))
    .then(() => continueRender(h))
    .catch((e) => {
      console.error(e);
      continueRender(h);
    });
}
export const SANS = 'BeigeSans';
export const SANS_MED = 'BeigeSansMed';
export const SERIF = 'BeigeSerif';

/* ------------------------------------------------------------------
   Timeline basics: 1080x1920, 30 fps, exactly 24 s = 720 frames
   ------------------------------------------------------------------ */
export const FPS = 30;
export const DURATION = 720;
export const sec = (s: number) => Math.round(s * FPS);

/* Palette: bright airy beige + soft accents */
export const P = {
  cream: '#FFF9F1',
  warmWhite: '#FFFDF8',
  beige: '#EADBC8',
  sand: '#D9C3A5',
  cocoa: '#4E3B30',
  charcoal: '#3B3533',
  butter: '#F3DE9C',
  sage: '#A8BF9C',
  sageDeep: '#7F9A72',
  blush: '#E9B7B1',
  blushDeep: '#D98F88',
};

/* TikTok working safe zone (approx.): top 12%, bottom 22%, left 8%, right 17% */
export const SAFE = {top: 230, bottom: 1920 - 422, left: 86, right: 1080 - 184};
export const SAFE_W = SAFE.right - SAFE.left;
export const SAFE_CX = (SAFE.left + SAFE.right) / 2; // 491

/* ------------------------------------------------------------------
   Scenes in the source (s). Shelf section is a locked-off stop-motion shot.
   ------------------------------------------------------------------ */
export const CUT_SHELF = 3.47;
export const CUT_END = 21.97;
export const APPEAR = [4.5, 8.43, 12.9, 18.4]; // partner product pops in
export const REMOVE = [7.43, 11.9, 17.4]; // partner product taken away
export const PRODUCT = {x: 765, y: 1150, w: 220, h: 900}; // partner product (centre / approx. size) on the shelf

/* ------------------------------------------------------------------
   Transcript — word-level. Wording/spelling per the creator's own draft
   (product names, "toink toink", "ni", "mencuba"); start times verified against
   the audio energy envelope (phrase-initial words snapped to the actual voice onset).
   key: true = keyword highlight
   ------------------------------------------------------------------ */
export type Word = {t: string; s: number; e: number; key?: 'product' | 'benefit' | 'brand'};
export type Phrase = {id: string; start: number; end: number; place: 'low' | 'shelf'; lines: Word[][]};

export const PHRASES: Phrase[] = [
  {
    id: 'hook', start: 0.03, end: 1.75, place: 'low',
    lines: [
      [{t: 'OTMS', s: 0.03, e: 0.42, key: 'brand'}, {t: 'ni', s: 0.42, e: 0.6}, {t: 'boleh', s: 0.62, e: 0.82}],
      [{t: 'mix', s: 0.82, e: 1.04}, {t: 'dengan', s: 1.04, e: 1.2}, {t: 'apa?', s: 1.2, e: 1.61}],
    ],
  },
  {id: 'jom', start: 2.26, end: 3.3, place: 'low', lines: [[{t: 'Jom', s: 2.26, e: 2.42}, {t: 'kita', s: 2.42, e: 2.54}, {t: 'tengok!', s: 2.54, e: 3.03}]]},
  {id: 'p1a', start: 3.52, end: 5.55, place: 'shelf', lines: [[{t: 'OTMS', s: 3.52, e: 4.0, key: 'brand'}, {t: '+', s: 4.0, e: 4.32}, {t: 'Jelita', s: 4.32, e: 4.8, key: 'product'}, {t: 'KL', s: 4.8, e: 5.33, key: 'product'}]]},
  {id: 'p1b', start: 5.7, end: 7.3, place: 'shelf', lines: [[{t: 'untuk', s: 5.7, e: 5.98}, {t: 'toink', s: 5.98, e: 6.26, key: 'benefit'}, {t: 'toink', s: 6.26, e: 6.52, key: 'benefit'}, {t: 'skin!', s: 6.52, e: 7.12, key: 'benefit'}]]},
  {id: 'p2a', start: 7.46, end: 9.8, place: 'shelf', lines: [[{t: 'OTMS', s: 7.46, e: 7.9, key: 'brand'}, {t: '+', s: 7.9, e: 8.4}, {t: 'Cyanara', s: 8.4, e: 9.12, key: 'product'}, {t: 'Essence', s: 9.12, e: 9.77, key: 'product'}]]},
  {id: 'p2b', start: 9.82, end: 11.75, place: 'shelf', lines: [[{t: 'untuk', s: 9.82, e: 10.6}, {t: 'kulit', s: 10.6, e: 10.92, key: 'benefit'}, {t: 'berjerawat!', s: 10.92, e: 11.49, key: 'benefit'}]]},
  {
    id: 'p3a', start: 11.89, end: 15.6, place: 'shelf',
    lines: [
      [{t: 'OTMS', s: 11.89, e: 12.5, key: 'brand'}, {t: '+', s: 12.5, e: 13.0}, {t: 'Blumé', s: 13.0, e: 13.84, key: 'product'}],
      [{t: 'Bright', s: 13.84, e: 14.28, key: 'product'}, {t: 'Toner', s: 14.28, e: 15.08, key: 'product'}, {t: 'Mist', s: 15.08, e: 15.44, key: 'product'}],
    ],
  },
  {id: 'p3b', start: 15.9, end: 17.3, place: 'shelf', lines: [[{t: 'untuk', s: 15.9, e: 16.2}, {t: 'kulit', s: 16.2, e: 16.56, key: 'benefit'}, {t: 'kusam!', s: 16.56, e: 16.99, key: 'benefit'}]]},
  {id: 'p4a', start: 17.43, end: 19.65, place: 'shelf', lines: [[{t: 'OTMS', s: 17.43, e: 17.92, key: 'brand'}, {t: '+', s: 17.92, e: 18.46}, {t: 'Bulaney', s: 18.46, e: 18.98, key: 'product'}, {t: 'Essence', s: 18.98, e: 19.58, key: 'product'}]]},
  {id: 'p4b', start: 19.69, end: 21.8, place: 'shelf', lines: [[{t: 'untuk', s: 19.69, e: 20.44}, {t: 'soothe', s: 20.44, e: 20.66, key: 'benefit'}, {t: 'redness!', s: 20.66, e: 21.52, key: 'benefit'}]]},
  {id: 'end', start: 22.13, end: 23.75, place: 'low', lines: [[{t: 'selamat', s: 22.13, e: 22.56}, {t: 'mencuba!', s: 22.56, e: 23.21}]]},
];

/* the four pairings (for badges / icons) */
export const PAIRS = [
  {n: 1, from: 3.52, to: 7.3, benefitAt: 5.7, icon: 'bounce' as const},
  {n: 2, from: 7.46, to: 11.75, benefitAt: 9.82, icon: 'acne' as const},
  {n: 3, from: 11.89, to: 17.3, benefitAt: 15.9, icon: 'glow' as const},
  {n: 4, from: 17.43, to: 21.8, benefitAt: 19.69, icon: 'calm' as const},
];
