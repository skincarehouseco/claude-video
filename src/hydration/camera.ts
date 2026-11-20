import {Easing} from 'remotion';
import {faceAt, FPS} from './theme';

// Zoom keyframes [time s, scale]; eased with a smooth cubic in/out between keys.
// Pushes in on each new sign, a big "magnify" on fine lines, eases back out between beats.
const KEYS: [number, number][] = [
  [0, 1.13], [0.95, 1.0], // intro reveal (zoom out)
  [2.7, 1.04], [3.6, 1.0], // slow push on the hook, settle
  [4.15, 1.07], [7.1, 1.09], [8.0, 1.0], // sign 1
  [9.1, 1.02], [10.35, 1.17], [10.95, 1.17], [11.55, 1.0], // sign 2: magnify "fine lines"
  [14.75, 1.06], [15.15, 1.0], // sign 3: slow drift in
  [16.2, 1.02], [17.6, 1.06], [18.7, 1.09], [19.2, 1.0], // sign 4
  [20.25, 1.0], [22.35, 1.08], [23.0, 1.0], // sign 5
  [24.05, 1.0], [25.2, 1.1], [26.2, 1.12], // outro: punch in on "hydration"
];
const e = Easing.inOut(Easing.cubic);

export const zoomAt = (t: number) => {
  if (t <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [t0, z0] = KEYS[i];
    const [t1, z1] = KEYS[i + 1];
    if (t <= t1) return z0 + (z1 - z0) * e((t - t0) / (t1 - t0));
  }
  return KEYS[KEYS.length - 1][1];
};

// tiny decaying shake on "crack" (17.44 s)
const shake = (t: number) => {
  const d = t - 17.44;
  if (d < 0 || d > 0.4) return {x: 0, r: 0};
  const k = Math.exp(-d * 9);
  return {x: Math.sin(d * 70) * 6 * k, r: Math.sin(d * 55) * 0.35 * k};
};

/** CSS transform + origin for the footage at a frame. Zooms are centred on the tracked face. */
export const camera = (frame: number) => {
  const t = frame / FPS;
  const f = faceAt(frame);
  const s = shake(t);
  return {
    transform: `translateX(${s.x.toFixed(2)}px) rotate(${s.r.toFixed(3)}deg) scale(${zoomAt(t).toFixed(5)})`,
    transformOrigin: `${f.x.toFixed(1)}px ${(f.y - 40).toFixed(1)}px`,
  };
};

/** Map a source-pixel point to its on-screen position under the current camera. */
export const toScreen = (frame: number, x: number, y: number) => {
  const t = frame / FPS;
  const f = faceAt(frame);
  const z = zoomAt(t);
  const ox = f.x;
  const oy = f.y - 40;
  return {x: ox + (x - ox) * z, y: oy + (y - oy) * z, z};
};
