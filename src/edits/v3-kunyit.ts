import { atSrc } from "../lib/timeline";
import { Edit, Segment } from "../lib/types";

// VIDEO 3 — "Kunyit kat muka, selamat ke sis?"  (the fun one)
const segments: Segment[] = [
  // hook + curry joke
  { clip: "0674", in: 31.35, out: 36.5, zoom: [{ t: 0, s: 1.0 }, { t: 2.5, s: 1.0 }, { t: 3.0, s: 1.1, y: 0.36 }, { t: 3.5, s: 1.2, y: 0.35 }] },
  // you don't have to worry, selamat je
  { clip: "0675", in: 9.0, out: 14.85, zoom: [{ t: 0, s: 1.0 }, { t: 4.4, s: 1.0 }, { t: 4.9, s: 1.1, y: 0.36 }] },
  // bukan kunyit masak curry — oatmeal turmeric mask
  { clip: "0675", in: 20.1, out: 26.38, transIn: 0, zoom: [{ t: 0, s: 1.14, y: 0.35 }, { t: 2.9, s: 1.14, y: 0.35 }, { t: 3.5, s: 1.0 }] },
  // dalam bentuk powder macam ni
  { clip: "0675", in: 28.0, out: 30.7, transIn: 0, zoom: [{ t: 0, s: 1.08 }], cuts: [{ at: 1.3, dur: 1.4, clip: "0605", in: 14 }] },
  // organik: oat …
  { clip: "0676", in: 0.0, out: 3.62, zoom: [{ t: 0, s: 1.0 }, { t: 3.6, s: 1.06 }] },
  // … garam, kunyit, nasi
  { clip: "0676", in: 7.56, out: 10.15, transIn: 0, zoom: [{ t: 0, s: 1.12, y: 0.36 }] },
  // don't sleep in it! 10–15 min or you'll look like a minion
  {
    clip: "0666", in: 9.05, out: 23.62,
    zoom: [{ t: 0, s: 1.0 }, { t: 1.8, s: 1.0 }, { t: 2.6, s: 1.12, y: 0.35 }, { t: 5.8, s: 1.12, y: 0.35 }, { t: 6.4, s: 1.0 }, { t: 13.0, s: 1.0 }, { t: 13.8, s: 1.2, y: 0.34 }],
    cuts: [{ at: 13.95, dur: 0.75, clip: "0663", in: 0.2 }], // "…macam minion" → goofy close-up
  },
  // pro tip: spot treatment overnight
  {
    clip: "0668", in: 0.1, out: 14.3,
    zoom: [{ t: 0, s: 1.0 }, { t: 7.8, s: 1.0 }, { t: 8.4, s: 1.1, y: 0.36 }, { t: 11.4, s: 1.1, y: 0.36 }, { t: 11.9, s: 1.18, y: 0.36 }],
  },
  // rinse in the morning
  { clip: "0668", in: 17.95, out: 20.15, zoom: [{ t: 0, s: 1.04 }] },
  // outro
  { clip: "0678", in: 14.0, out: 17.6, mute: true, transIn: 0.4, zoom: [{ t: 0, s: 1.0 }, { t: 3.6, s: 1.06 }] },
];
const T = atSrc(segments);
const END_ING = T(5, 10.6);

export const v3: Edit = {
  id: "Yello-3-KunyitSafe",
  music: "whimsy_c",
  musicVol: 0.12,
  segments,
  fixes: { "0674:30": "mer-mer-mer", mermer: "mer-mer", "0675:1": "Untuk" },
  drop: ["0674:31", "0674:32", "0674:33", "0674:34", "0674:35", "0674:36", "0674:37"],
  overlays: [
    { kind: "title", at: 0.1, dur: 3.4, top: "kunyit kat muka?", script: "selamat ke sis?" },
    { kind: "sticker", at: 0.35, dur: 3.1, type: "sparkle", x: 860, y: 240, size: 68 },
    { kind: "label", at: T(0, 35.6), dur: 1.4, text: "curry??", x: 760, y: 600, rot: 9, size: 80 },

    { kind: "label", at: T(1, 11.6), dur: 1.6, text: "don't worry~", x: 505, y: 300, size: 68 },
    { kind: "label", at: T(1, 13.8), dur: 1.4, text: "SELAMAT!", x: 505, y: 560, size: 100 },
    { kind: "sticker", at: T(1, 13.85), dur: 1.3, type: "star", x: 820, y: 640, size: 80 },

    { kind: "label", at: T(2, 23.65), dur: 2.8, text: "oatmeal", x: 300, y: 330, rot: -6, size: 66 },
    { kind: "label", at: T(2, 25.3), dur: 1.3, text: "turmeric", x: 760, y: 360, rot: 5, size: 66 },
    { kind: "sticker", at: T(2, 23.8), dur: 2.6, type: "oat", x: 200, y: 460, size: 70 },

    { kind: "label", at: T(4, 1.0), dur: 2.4, text: "organik", x: 505, y: 300, size: 72 },
    { kind: "sticker", at: T(4, 1.2), dur: 2.2, type: "daisy", x: 820, y: 400, size: 68 },
    { kind: "label", at: T(4, 3.15), dur: +(END_ING - T(4, 3.15)).toFixed(2), text: "oat", x: 270, y: 470, rot: -6, size: 66 },
    { kind: "label", at: T(5, 7.64), dur: +(END_ING - T(5, 7.64)).toFixed(2), text: "garam", x: 790, y: 470, rot: 5, size: 66 },
    { kind: "label", at: T(5, 8.46), dur: +(END_ING - T(5, 8.46)).toFixed(2), text: "kunyit", x: 280, y: 600, rot: 4, size: 66 },
    { kind: "label", at: T(5, 9.3), dur: +(END_ING - T(5, 9.3)).toFixed(2), text: "nasi", x: 790, y: 610, rot: -5, size: 66 },

    { kind: "step", at: T(6, 9.4), dur: 5.4, n: 1, text: "jangan bawa tidur" },
    { kind: "sticker", at: T(6, 15.55), dur: 4.0, type: "clock", x: 810, y: 600, size: 96 },
    { kind: "label", at: T(6, 15.6), dur: 4.0, text: "10-15 min je!", x: 470, y: 330, size: 76 },
    { kind: "label", at: T(6, 23.1), dur: 1.4, text: "kuning!!", x: 505, y: 560, rot: -6, size: 96 },

    { kind: "bubble", at: T(7, 0.4), dur: 3.0, text: "pro tip!", x: 330, y: 330 },
    { kind: "label", at: T(7, 6.9), dur: 2.6, text: "area jerawat je", x: 505, y: 300, size: 64 },
    { kind: "sticker", at: T(7, 11.88), dur: 1.6, type: "sparkle", x: 330, y: 600, size: 52 },
    { kind: "sticker", at: T(7, 12.2), dur: 1.3, type: "sparkle", x: 760, y: 560, size: 52 },
    { kind: "sticker", at: T(7, 12.45), dur: 1.1, type: "sparkle", x: 520, y: 460, size: 52 },
    { kind: "label", at: T(7, 13.2), dur: 1.4, text: "overnight ok", x: 505, y: 300, size: 64 },
    { kind: "sticker", at: T(8, 18.1), dur: 2.0, type: "drop", x: 820, y: 560, size: 76 },

    { kind: "cta", at: T(9, 14.2), dur: 3.4, top: "follow for more", bottom: "yello OTMS" },
    { kind: "sticker", at: T(9, 14.4), dur: 3.2, type: "pixelHeart", x: 190, y: 280, size: 64 },
    { kind: "sticker", at: T(9, 14.6), dur: 3.0, type: "sparkle", x: 880, y: 650, size: 64 },
  ],
  sfx: [
    { at: 0.1, type: "sparkle", vol: 0.16 },
    { at: T(0, 35.6), type: "boing", vol: 0.18 },
    { at: T(1, 13.8), type: "ding", vol: 0.18 },
    { at: T(2, 23.65), type: "pop" }, { at: T(2, 25.3), type: "pop" },
    { at: T(3, 29.3), type: "whoosh", vol: 0.1 },
    { at: T(4, 1.0), type: "sparkle", vol: 0.14 },
    { at: T(4, 3.15), type: "pop" }, { at: T(5, 7.64), type: "pop" }, { at: T(5, 8.46), type: "pop" }, { at: T(5, 9.3), type: "pop" },
    { at: T(6, 9.4), type: "click", vol: 0.2 },
    { at: T(6, 15.6), type: "ding", vol: 0.16 },
    { at: T(6, 23.05), type: "boing", vol: 0.2 },
    { at: T(7, 0.4), type: "magic", vol: 0.14 },
    { at: T(7, 11.88), type: "pop", vol: 0.14 }, { at: T(7, 12.2), type: "pop", vol: 0.14 }, { at: T(7, 12.45), type: "pop", vol: 0.14 },
    { at: T(9, 14.2), type: "magic", vol: 0.18 },
  ],
};
