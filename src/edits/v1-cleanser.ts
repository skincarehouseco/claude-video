import { atSrc } from "../lib/timeline";
import { Edit, Segment } from "../lib/types";

// VIDEO 1 — "Cleanser dulu ke mask dulu?"  (presenter 1 + product B-roll)
const segments: Segment[] = [
  {
    // Q1: before or after cleanser? → clean skin → list of cleansers → then mask
    clip: "0571", in: 3.05, out: 31.95,
    zoom: [
      { t: 0, s: 1.12, y: 0.33 }, { t: 5.2, s: 1.12, y: 0.33 }, { t: 5.9, s: 1.0 },
      { t: 10.0, s: 1.0 }, { t: 10.7, s: 1.07 },
      { t: 18.1, s: 1.07 }, { t: 18.7, s: 1.16, y: 0.33 }, { t: 20.7, s: 1.16, y: 0.33 }, { t: 21.3, s: 1.0 },
      { t: 27.3, s: 1.0 }, { t: 27.9, s: 1.2, y: 0.32 },
    ],
    cuts: [
      { at: 1.75, dur: 2.4, clip: "0603", in: 28 }, // jar hero while she says "yellow mask ni"
      { at: 21.0, dur: 1.9, clip: "0660", in: 14 }, // "baru you pakai this mask"
    ],
  },
  {
    // Q2: just water? → boleh → mix with plain water → filtered water better
    clip: "0573", in: 0.0, out: 14.24,
    zoom: [
      { t: 0, s: 1.0 }, { t: 4.45, s: 1.0 }, { t: 4.9, s: 1.15, y: 0.33 }, { t: 6.0, s: 1.15, y: 0.33 }, { t: 6.5, s: 1.02 },
      { t: 11.7, s: 1.02 }, { t: 12.3, s: 1.1 },
    ],
    cuts: [
      { at: 6.6, dur: 2.3, clip: "0610", in: 17 }, // powder into the bowl
      { at: 9.0, dur: 2.6, clip: "0615", in: 2 }, // mixing
    ],
  },
  {
    // jump-cut (skips a garbled phrase) → dust & rust from pipes
    clip: "0573", in: 15.47, out: 25.85, transIn: 0,
    zoom: [{ t: 0, s: 1.14, y: 0.34 }, { t: 3.0, s: 1.14, y: 0.34 }, { t: 3.6, s: 1.0 }, { t: 8.6, s: 1.0 }, { t: 9.4, s: 1.08 }],
  },
  { clip: "0603", in: 30, out: 34.6, mute: true, transIn: 0.4, zoom: [{ t: 0, s: 1.0 }, { t: 4.6, s: 1.08 }] },
];

const T = atSrc(segments);

export const v1: Edit = {
  id: "Yello-1-CleanserDulu",
  music: "whimsy_a",
  musicVol: 0.12,
  segments,
  drop: ["0571:51"], // stray "Okay."
  fixes: { "0573:41": "Supaya" },
  overlays: [
    { kind: "title", at: 0.15, dur: 4.4, top: "cleanser dulu?", script: "ke mask dulu?" },
    { kind: "sticker", at: 0.4, dur: 4.2, type: "sparkle", x: 860, y: 230, size: 70 },
    { kind: "sticker", at: 0.6, dur: 4.0, type: "pixelHeart", x: 150, y: 560, size: 64 },

    { kind: "label", at: T(0, 13.0), dur: 2.4, text: "kulit bersih!", x: 505, y: 560 },
    { kind: "sticker", at: T(0, 13.1), dur: 2.3, type: "sparkle", x: 790, y: 500, size: 60 },

    { kind: "checklist", at: T(0, 15.1), dur: 8.6, title: "cleanse dulu!", items: ["cleansing balm", "micellar water", "cleansing milk", "cleansing oil"], stepGap: 1.15, y: 190 },

    { kind: "label", at: T(0, 24.25), dur: 1.9, text: "then mask!", x: 505, y: 560, rot: 3 },
    { kind: "sticker", at: T(0, 31.0), dur: 1.0, type: "star", x: 810, y: 600, size: 90 },

    { kind: "title", at: T(1, 0.05), dur: 3.3, top: "campur air je?", script: "boleh ke?" },
    { kind: "sticker", at: T(1, 0.3), dur: 3.0, type: "drop", x: 860, y: 260, size: 70 },
    { kind: "label", at: T(1, 4.95), dur: 1.9, text: "BOLEH!", x: 505, y: 560, size: 104 },
    { kind: "sticker", at: T(1, 5.0), dur: 1.8, type: "sparkle", x: 260, y: 470, size: 64 },
    { kind: "sticker", at: T(1, 5.1), dur: 1.7, type: "sparkle", x: 770, y: 650, size: 50 },
    { kind: "label", at: T(1, 10.7), dur: 1.4, text: "+ air kosong", x: 505, y: 300, rot: -2, size: 64 },
    { kind: "label", at: T(1, 13.4), dur: 2.6, text: "filtered water", x: 505, y: 300, size: 64 },
    { kind: "sticker", at: T(1, 13.5), dur: 2.5, type: "drop", x: 800, y: 390, size: 70 },

    { kind: "label", at: T(2, 17.6), dur: 2.4, text: "no dust", x: 300, y: 620, rot: -7, size: 64 },
    { kind: "label", at: T(2, 18.9), dur: 2.2, text: "no karat", x: 740, y: 680, rot: 6, size: 64 },
    { kind: "sticker", at: T(2, 25.2), dur: 1.4, type: "pixelHeart", x: 790, y: 560, size: 60 },

    { kind: "cta", at: T(3, 30.3), dur: 4.2, top: "save for later", bottom: "yello OTMS" },
    { kind: "sticker", at: T(3, 30.6), dur: 3.9, type: "sparkle", x: 180, y: 300, size: 70 },
    { kind: "sticker", at: T(3, 30.8), dur: 3.7, type: "heart", x: 880, y: 640, size: 80 },
  ],
  sfx: [
    { at: 0.15, type: "sparkle", vol: 0.16 },
    { at: T(0, 4.75), type: "whoosh", vol: 0.12 },
    { at: T(0, 13.0), type: "sparkle", vol: 0.14 },
    { at: T(0, 15.38), type: "pop" }, { at: T(0, 16.34), type: "pop" }, { at: T(0, 17.68), type: "pop" }, { at: T(0, 18.88), type: "pop" },
    { at: T(0, 24.1), type: "whoosh", vol: 0.12 },
    { at: T(0, 31.0), type: "boing", vol: 0.16 },
    { at: T(1, 0.05), type: "magic", vol: 0.14 },
    { at: T(1, 4.95), type: "ding", vol: 0.18 },
    { at: T(1, 6.6), type: "whoosh", vol: 0.1 },
    { at: T(1, 13.4), type: "pop", vol: 0.16 },
    { at: T(2, 17.6), type: "pop" }, { at: T(2, 18.9), type: "pop" },
    { at: T(3, 30.3), type: "magic", vol: 0.18 },
  ],
};
