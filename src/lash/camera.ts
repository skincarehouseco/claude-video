import {clamp01, ease, SECTION_CUTS, SHOTS} from './timeline';

// Per-shot camera move: [scale at shot start, scale at shot end, transform-origin]
// Mix of slow zoom-outs (reveals) and push-ins (detail moments).
const MOVES: [number, number, string][] = [
  [1.14, 1.0, '50% 62%'], // products: zoom-out reveal
  [1.0, 1.045, '55% 45%'], // tonic hold
  [1.045, 1.0, '50% 40%'], // tonic open
  [1.0, 1.07, '58% 45%'], // tonic brush tip
  [1.0, 1.16, '42% 54%'], // tonic on lash line: slow push-in
  [1.0, 1.05, '50% 50%'], // jelly hold
  [1.05, 1.0, '50% 40%'], // jelly open
  [1.0, 1.07, '62% 52%'], // jelly brush
  [1.0, 1.0, '56% 50%'], // lashes: handled by finalShot()
];

const shotIndex = (t: number) => {
  let i = 0;
  while (i < SHOTS.length - 2 && t >= SHOTS[i + 1]) i++;
  return i;
};

// last shot: push in while brushing, then a gentle zoom-out to finish
const finalShot = (t: number) => {
  const inP = ease(clamp01((t - 9.167) / 2.3));
  const outP = ease(clamp01((t - 11.5) / 1.1));
  return 1 + 0.13 * inP - 0.1 * outP;
};

export type Cam = {scale: number; origin: string; blur: number; flash: number};

export const camera = (t: number): Cam => {
  const i = shotIndex(t);
  const [a, b, origin] = MOVES[i];
  const u = clamp01((t - SHOTS[i]) / (SHOTS[i + 1] - SHOTS[i]));
  let scale = i === MOVES.length - 1 ? finalShot(t) : a + (b - a) * ease(u);
  let blur = 0;
  let flash = 0;

  // zoom-through transition around section cuts: outgoing shot rushes in, incoming shot settles back
  for (const c of SECTION_CUTS) {
    const pre = (t - (c - 0.2)) / 0.2;
    const post = (t - c) / 0.3;
    if (pre >= 0 && pre < 1) {
      const p = ease(pre);
      scale *= 1 + 0.22 * p;
      blur = 9 * p;
      flash = 0.35 * p;
    } else if (post >= 0 && post < 1) {
      const p = 1 - ease(post);
      scale *= 1 + 0.18 * p;
      blur = 9 * p;
      flash = 0.35 * p;
    }
  }
  // soft punch-in on the smaller cuts inside a section
  for (const c of SHOTS.slice(1, -1)) {
    if (SECTION_CUTS.includes(c)) continue;
    const k = (t - c) / 0.33;
    if (k >= 0 && k < 1) scale *= 1 + 0.035 * (1 - ease(k));
  }
  return {scale, origin, blur, flash};
};
