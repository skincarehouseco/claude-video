import {Easing} from 'remotion';
import {A_SEC} from './theme';

const ease = Easing.inOut(Easing.cubic);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Shot changes in the source clips (ffmpeg scene detection), in OUTPUT seconds.
export const A_CUTS = [21.667, 24.4, 26.933, 29.833, 32.967, 36.7];
export const B_CUTS = [1.3, 1.967, 2.433, 3.367, 6.433, 7.2].map((c) => A_SEC + c);
const EDGES = [0, ...A_CUTS, A_SEC, ...B_CUTS, A_SEC + 12.47];

// Emphasis push-ins [start, end, scale] (never across a cut) — eased in 0.45 s, out 0.7 s.
const EMPHASIS: [number, number, number][] = [
  [7.25, 8.6, 1.06], // "hilang semangat"
  [12.06, 12.75, 1.04], // "kejap panas"
  [16.05, 17.15, 1.09], // "kering sangat"
  [20.45, 21.4, 1.07], // "penyelamat korang"
  [33.35, 36.3, 1.05], // "hyaluronic acid dengan watermelon extract"
  [40.3, 41.15, 1.05], // "complicated"
  [43.9, 45.2, 1.07], // "consider this one"
];

/** Smooth camera scale at output time t (s). Shots alternate a slow 4% push-in / ease-out so scale is continuous. */
export const zoomAt = (t: number) => {
  let i = 0;
  while (i < EDGES.length - 2 && t >= EDGES[i + 1]) i++;
  const u = clamp01((t - EDGES[i]) / (EDGES[i + 1] - EDGES[i]));
  const base = i % 2 === 0 ? 1 + 0.04 * ease(u) : 1.04 - 0.04 * ease(u);
  let emph = 1;
  for (const [s, e, z] of EMPHASIS) {
    if (t > s - 0.01 && t < e + 0.7) {
      emph = 1 + (z - 1) * ease(clamp01((t - s) / 0.45)) * (1 - ease(clamp01((t - e) / 0.7)));
    }
  }
  // zoom-outs: opening of the video and opening of the demo part
  const intro = 1 + 0.08 * (1 - ease(clamp01(t / 1.3)));
  const introB = t >= A_SEC ? 1 + 0.1 * (1 - ease(clamp01((t - A_SEC) / 1.1))) : 1;
  return base * emph * intro * introB;
};

export const ORIGIN = '50% 34%';
export const DISSOLVE = 5; // frames of soft dissolve on part-A shot changes
