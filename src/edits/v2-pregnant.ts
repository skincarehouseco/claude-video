import { atSrc } from "../lib/timeline";
import { Edit, Segment } from "../lib/types";

// VIDEO 2 — "Pregnant mom boleh pakai ke?"  (presenter 2)
const segments: Segment[] = [
  // Q
  { clip: "0669", in: 0.35, out: 5.73, zoom: [{ t: 0, s: 1.0 }, { t: 1.4, s: 1.0 }, { t: 2.0, s: 1.1, y: 0.36 }] },
  // A: boleh, sebab tak ada ingredient / percentage yang dilarang
  {
    clip: "0673", in: 16.37, out: 28.95, transIn: 0,
    zoom: [{ t: 0, s: 1.15, y: 0.34 }, { t: 1.6, s: 1.15, y: 0.34 }, { t: 2.2, s: 1.0 }, { t: 8.0, s: 1.0 }, { t: 9.0, s: 1.1, y: 0.36 }],
    cuts: [
      { at: 3.0, dur: 2.3, clip: "0605", in: 13 }, // powder texture
      { at: 6.0, dur: 2.3, clip: "0620", in: 1 }, // scoop into bowl
    ],
  },
  // what's inside: kunyit, nasi, garam …
  { clip: "0673", in: 37.45, out: 44.85, zoom: [{ t: 0, s: 1.0 }, { t: 3.6, s: 1.0 }, { t: 4.3, s: 1.07 }] },
  // … and coconut (jump-cut over a long pause)
  { clip: "0673", in: 46.9, out: 50.3, transIn: 0, zoom: [{ t: 0, s: 1.12, y: 0.36 }, { t: 3.4, s: 1.16, y: 0.36 }] },
  // all from your kitchen
  { clip: "0673", in: 50.35, out: 55.15, zoom: [{ t: 0, s: 1.0 }, { t: 2.5, s: 1.0 }, { t: 3.0, s: 1.08 }] },
  // safe for pregnant mommies, jangan risau
  { clip: "0673", in: 58.28, out: 63.36, transIn: 0, zoom: [{ t: 0, s: 1.13, y: 0.35 }, { t: 3.0, s: 1.13, y: 0.35 }, { t: 3.6, s: 1.02 }] },
  // responsible note: refer to your doctor
  { clip: "0671", in: 8.85, out: 13.2, zoom: [{ t: 0, s: 1.0 }, { t: 4.3, s: 1.06 }] },
  // boleh pakai!
  { clip: "0673", in: 65.45, out: 66.8, zoom: [{ t: 0, s: 1.12, y: 0.35 }] },
  // outro hero
  { clip: "0603", in: 36, out: 40.2, mute: true, transIn: 0.4, zoom: [{ t: 0, s: 1.0 }, { t: 4.2, s: 1.07 }] },
];
const T = atSrc(segments);

const ing = (i: number, src: number, text: string, x: number, y: number, rot: number, end: number) =>
  ({ kind: "label", at: T(i, src), dur: +(end - T(i, src)).toFixed(2), text, x, y, rot, size: 66 }) as const;
const ENDING = T(4, 50.9);

export const v2: Edit = {
  id: "Yello-2-PregnantMom",
  music: "whimsy_b",
  musicVol: 0.12,
  segments,
  drop: ["0673:59", "0673:103"],
  fixes: { "0673:104": "So" },
  overlays: [
    { kind: "title", at: 0.1, dur: 5.2, top: "pregnant mom", script: "boleh pakai ke?" },
    { kind: "sticker", at: 0.35, dur: 4.9, type: "heart", x: 860, y: 250, size: 76 },
    { kind: "sticker", at: 0.55, dur: 4.7, type: "sparkle", x: 170, y: 560, size: 62 },

    { kind: "label", at: T(1, 17.2), dur: 1.9, text: "BOLEH!", x: 505, y: 560, size: 104 },
    { kind: "sticker", at: T(1, 17.25), dur: 1.8, type: "sparkle", x: 250, y: 470, size: 62 },
    { kind: "sticker", at: T(1, 17.35), dur: 1.7, type: "sparkle", x: 780, y: 660, size: 48 },
    { kind: "sticker", at: T(1, 28.35), dur: 1.0, type: "pixelHeart", x: 790, y: 560, size: 64 },

    { kind: "title", at: T(2, 37.6), dur: 2.6, top: "dalam OTMS", script: "ada apa?" },
    ing(2, 41.45, "kunyit", 270, 330, -6, ENDING),
    ing(2, 43.13, "nasi", 800, 350, 5, ENDING),
    ing(2, 43.75, "garam", 280, 470, 4, ENDING),
    ing(3, 49.5, "coconut", 790, 490, -5, ENDING),

    { kind: "label", at: T(4, 53.2), dur: 2.0, text: "ada kat dapur!", x: 505, y: 300, size: 70 },
    { kind: "sticker", at: T(4, 53.3), dur: 1.9, type: "daisy", x: 860, y: 420, size: 70 },

    { kind: "sticker", at: T(5, 59.0), dur: 2.0, type: "heart", x: 820, y: 560, size: 80 },
    { kind: "sticker", at: T(5, 62.4), dur: 1.4, type: "pixelHeart", x: 220, y: 600, size: 60 },
    { kind: "sticker", at: T(5, 62.6), dur: 1.2, type: "pixelHeart", x: 830, y: 520, size: 48 },

    { kind: "bubble", at: T(6, 11.4), dur: 2.2, text: "tanya doktor ya", x: 505, y: 330 },

    { kind: "label", at: T(7, 65.5), dur: 1.6, text: "BOLEH PAKAI!", x: 505, y: 560, size: 92 },
    { kind: "cta", at: T(8, 36.3), dur: 3.9, top: "for mommies too", bottom: "yello OTMS" },
    { kind: "sticker", at: T(8, 36.5), dur: 3.7, type: "heart", x: 180, y: 300, size: 72 },
    { kind: "sticker", at: T(8, 36.7), dur: 3.5, type: "sparkle", x: 880, y: 640, size: 64 },
  ],
  sfx: [
    { at: 0.1, type: "sparkle", vol: 0.16 },
    { at: T(1, 17.2), type: "ding", vol: 0.18 },
    { at: T(1, 19.35), type: "whoosh", vol: 0.1 },
    { at: T(1, 28.35), type: "pop", vol: 0.16 },
    { at: T(2, 37.6), type: "magic", vol: 0.14 },
    { at: T(2, 41.45), type: "pop" }, { at: T(2, 43.13), type: "pop" }, { at: T(2, 43.75), type: "pop" }, { at: T(3, 49.5), type: "pop" },
    { at: T(4, 53.2), type: "sparkle", vol: 0.14 },
    { at: T(5, 59.0), type: "pop", vol: 0.16 },
    { at: T(6, 11.4), type: "click", vol: 0.2 },
    { at: T(7, 65.5), type: "ding", vol: 0.18 },
    { at: T(8, 36.3), type: "magic", vol: 0.18 },
  ],
};
