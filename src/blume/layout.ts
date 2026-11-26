import {lerp, prog} from './theme';

/**
 * Speaker framing. The cut-out speaker (1080x1920) is drawn inside a container rect
 * (cx, cy, cw, ch, radius cr) at inner offset (ix, iy) and scale is (origin top-left).
 * `ca` = how much the container looks like an editorial card (background, border, shadow).
 */
export type Frame = {cx: number; cy: number; cw: number; ch: number; cr: number; ix: number; iy: number; is: number; ca: number};

/** full-frame framing: scale s about the bottom-centre, then shift (x, y). y >= 0 keeps the frame-cut torso below the edge. */
const full = (s: number, x = 0, y = 0): Frame => ({
  cx: 0, cy: 0, cw: 1080, ch: 1920, cr: 0, is: s, ix: 540 * (1 - s) + x, iy: 1920 * (1 - s) + y, ca: 0,
});
/** editorial arch card (picture-in-picture), framed on the face (source face ≈ (540, 450)) */
const card = (cx: number, cy: number, cw: number, ch: number, k = 0.62): Frame => ({
  cx, cy, cw, ch, cr: cw / 2, is: k, ix: cw / 2 - 540 * k, iy: ch * 0.36 - 450 * k, ca: 1,
});

export const L = {
  intro: full(1.32, 0, 640),
  low: full(1.1, 0, 430),
  centre: full(1.12, 0, 260),
  right: full(1.3, 162, 470),
  rightHi: full(1.3, 162, 440),
  leftish: full(1.12, -60, 240),
  wide: full(1.08, 0, 160),
  process: full(1.05, 0, 330),
  close: full(1.32, 0, 590),
  arch: card(505, 300, 400, 640),
  archLow: card(505, 560, 400, 600),
  freeWide: full(1.06, 0, 110),
};

// [time (s), framing]; transitions ease over TR seconds starting at each key time
const TR = 0.42;
const KEYS: [number, Frame][] = [
  [0, L.intro],
  [0.05, L.low],
  [1.85, L.centre],
  [3.3, L.right],
  [5.9, L.rightHi],
  [8.62, L.arch],
  [10.78, L.right],
  [13.72, L.leftish],
  [15.72, L.wide],
  [17.8, L.process],
  [20.75, L.arch],
  [24.22, L.low],
  [27.55, L.freeWide],
  [30.05, L.close],
];

const mix = (a: Frame, b: Frame, p: number): Frame => ({
  cx: lerp(a.cx, b.cx, p), cy: lerp(a.cy, b.cy, p), cw: lerp(a.cw, b.cw, p), ch: lerp(a.ch, b.ch, p),
  cr: lerp(a.cr, b.cr, p), ix: lerp(a.ix, b.ix, p), iy: lerp(a.iy, b.iy, p), is: lerp(a.is, b.is, p), ca: lerp(a.ca, b.ca, p),
});

// short emphasis push-ins [start, end, amount] (scale about the face)
const EMPH: [number, number, number][] = [
  [5.98, 6.5, 0.06], // "First,"
  [15.0, 15.6, 0.06], // "dua cara"
  [18.3, 19.0, 0.04], // spray into the palm
  [25.9, 26.4, 0.04], // "terawal"
  [0.76, 1.7, 0.05], // product name in hook
  [10.4, 10.84, 0.05], // "kering"
  [22.28, 22.9, 0.05], // "lock"
  [24.72, 25.5, 0.04], // "50"
  [29.6, 30.0, 0.05], // "free"
  [30.6, 31.6, 0.05], // "now!"
];

export const frameAt = (t: number): Frame => {
  let i = 0;
  while (i < KEYS.length - 1 && t >= KEYS[i + 1][0]) i++;
  const [k0, f0] = KEYS[i];
  const prev = i > 0 ? KEYS[i - 1][1] : f0;
  const dur = i === 1 ? 0.75 : TR; // the opening punch-out is a touch slower
  let f = mix(prev, f0, prog(t, k0, k0 + dur));
  // slow drift so the frame is never static (±1.5%)
  const drift = 1 + 0.012 * Math.sin(t * 0.9);
  let e = 1;
  for (const [a, b, z] of EMPH) {
    if (t > a - 0.01 && t < b + 0.5) e = 1 + z * prog(t, a, a + 0.28) * (1 - prog(t, b, b + 0.45));
  }
  const k = drift * e;
  // scale about the speaker's face (source ≈ 540, 450)
  const fx = f.ix + 540 * f.is;
  const fy = f.iy + 450 * f.is;
  f = {...f, is: f.is * k, ix: fx - (fx - f.ix) * k, iy: fy - (fy - f.iy) * k};
  // full-frame framings must keep the frame-cut bottom/sides hidden
  if (f.ca < 0.01) {
    const maxX = 540 * (f.is - 1);
    const cxOff = f.ix - 540 * (1 - f.is);
    if (Math.abs(cxOff) > maxX) f.ix = 540 * (1 - f.is) + Math.sign(cxOff) * maxX;
    const minIy = 1920 * (1 - f.is);
    if (f.iy < minIy) f.iy = minIy;
  }
  return f;
};

/** map a point in source-footage pixels to screen pixels at time t */
export const toScreen = (t: number, px: number, py: number) => {
  const f = frameAt(t);
  return {x: f.cx + f.ix + px * f.is, y: f.cy + f.iy + py * f.is, s: f.is};
};
