import {lerp, prog} from '../theme';

/**
 * Speaker framing for the explainer edit (full-frame only). The cut-out and, in "room" scenes,
 * the original footage share this exact transform, so they stay pixel-aligned.
 * Scale s about the bottom-centre, then shift (x, y). y >= 0 keeps the frame-cut torso hidden.
 */
export type F = {ix: number; iy: number; is: number};
const full = (s: number, x = 0, y = 0): F => ({is: s, ix: 540 * (1 - s) + x, iy: 1920 * (1 - s) + y});

const KEYS: [number, F, number][] = [
  // [time, framing, transition seconds]
  [0, full(1.34, 0, 660), 0],
  [0.05, full(1.1, 0, 430), 0.7], // hook: speaker low, headline above
  [1.85, full(1.15, 0, 250), 0.4], // intro, real room
  [3.3, full(1.24, 120, 380), 0.45], // checklist on the left (she points at it)
  [8.62, full(1.17, 40, 280), 0.4], // drying + meme
  [10.78, full(1.24, -120, 400), 0.4], // product slides in on the right
  [13.72, full(1.12, -60, 240), 0.4], // holding the bottle
  [15.0, full(1.3, 0, 560), 0.18], // "dua" — snap punch-in
  [15.72, full(1.08, 0, 160), 0.35], // cara 1
  [17.8, full(1.2, 0, 330), 0.35], // cara 2 (real room)
  [20.75, full(1.08, 0, 640), 0.45], // split: diagram on top, speaker below
  [23.6, full(1.12, 0, 300), 0.35], // recap
  [24.22, full(1.1, 0, 470), 0.3], // promo
  [27.55, full(1.06, 0, 110), 0.4], // free serum
  [30.05, full(1.32, 0, 590), 0.3], // CTA close-up
];

// emphasis push-ins [start, end, amount]
const EMPH: [number, number, number][] = [
  [0.76, 1.7, 0.05],
  [5.98, 6.5, 0.06],
  [7.86, 8.5, 0.05],
  [10.4, 10.84, 0.06],
  [12.44, 13.3, 0.04],
  [16.64, 17.4, 0.05],
  [19.84, 20.6, 0.05],
  [24.72, 25.5, 0.05],
  [29.6, 30.0, 0.06],
  [30.6, 31.6, 0.05],
];
// camera shake on the big beats
export const SHAKES = [15.06, 22.3, 24.72, 29.78];

/** scenes that keep her real room: the footage must always cover the whole frame there */
export const ROOM: [number, number][] = [
  [1.93, 10.84],
  [17.85, 20.8],
];
export const inRoom = (t: number) => ROOM.some(([a, b]) => t >= a && t < b);

export const frameAt = (t: number): F => {
  let i = 0;
  while (i < KEYS.length - 1 && t >= KEYS[i + 1][0]) i++;
  const [k0, f0, dur] = KEYS[i];
  const prev = i > 0 ? KEYS[i - 1][1] : f0;
  const p = dur > 0 ? prog(t, k0, k0 + dur) : 1;
  let f: F = {ix: lerp(prev.ix, f0.ix, p), iy: lerp(prev.iy, f0.iy, p), is: lerp(prev.is, f0.is, p)};
  const drift = 1 + 0.012 * Math.sin(t * 0.9);
  let e = 1;
  for (const [a, b, z] of EMPH) if (t > a - 0.01 && t < b + 0.5) e = 1 + z * prog(t, a, a + 0.22) * (1 - prog(t, b, b + 0.4));
  const k = drift * e;
  const fx = f.ix + 540 * f.is;
  const fy = f.iy + 450 * f.is;
  f = {is: f.is * k, ix: fx - (fx - f.ix) * k, iy: fy - (fy - f.iy) * k};
  for (const a of SHAKES) {
    if (t >= a && t < a + 0.35) {
      const d = 1 - (t - a) / 0.35;
      f = {...f, ix: f.ix + Math.sin(t * 95) * 13 * d, iy: f.iy + Math.cos(t * 81) * 10 * d};
    }
  }
  // keep the frame-cut sides / bottom of the footage off screen
  const maxX = 540 * (f.is - 1);
  const off = f.ix - 540 * (1 - f.is);
  if (Math.abs(off) > maxX) f.ix = 540 * (1 - f.is) + Math.sign(off) * maxX;
  if (f.iy < 1920 * (1 - f.is)) f.iy = 1920 * (1 - f.is);
  if (inRoom(t)) f.iy = Math.min(f.iy, 0); // no exposed top edge over the real room
  return f;
};

/** source-footage pixel -> screen pixel at time t */
export const toScreen = (t: number, px: number, py: number) => {
  const f = frameAt(t);
  return {x: f.ix + px * f.is, y: f.iy + py * f.is};
};
