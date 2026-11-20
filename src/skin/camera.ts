import {Easing} from 'remotion';
import {clamp01, SOURCE_DURATION} from './theme';

// Jump cuts already in the source footage (s), found with ffmpeg scene detection.
export const CUTS = [1.0, 1.3, 6.33, 9.23, 10.82, 16.48, 18.67, 22.65, 25.07, 26.03, 29.8, 33.23, 34.43, 35.43, 39.77, 40.0];
const EDGES = [0, ...CUTS, SOURCE_DURATION];

// Cuts where a new numbered point starts: they get a soft light flash and a "settle" zoom
export const SECTION_CUTS = [6.33, 9.23, 16.48, 25.07, 33.23, 39.77];

const ease = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

// Emphasis push-ins on key phrases: [start, end, scale]
const EMPHASIS: [number, number, number][] = [
  [3.85, 5.75, 1.1], // "but why are the results so different?"
  [12.42, 14.05, 1.07], // "jangan exfoliate setiap hari"
  [20.34, 22.3, 1.07], // "jangan terlalu kerap cuci muka"
  [29.72, 31.0, 1.05], // "gel moisturizer"
  [36.62, 37.6, 1.08], // "jangan skip sunscreen"
  [41.3, 43, 1.05], // "jangan lupa follow"
];

/** Smooth camera scale at time t (s). */
export const zoomAt = (t: number) => {
  // slow drift per shot: alternately pushes in / eases out by 3% so scale stays continuous over cuts
  let i = 0;
  while (i < EDGES.length - 2 && t >= EDGES[i + 1]) i++;
  const u = clamp01((t - EDGES[i]) / (EDGES[i + 1] - EDGES[i]));
  const base = i % 2 === 0 ? 1 + 0.03 * ease(u) : 1.03 - 0.03 * ease(u);

  let emph = 1;
  for (const [s, e, z] of EMPHASIS) {
    if (t > s && t < e + 0.7) {
      const inP = ease(clamp01((t - s) / 0.45));
      const outP = ease(clamp01((t - e) / 0.7));
      emph = Math.max(emph, 1 + (z - 1) * inP * (1 - outP));
    }
  }
  // section cuts: start 8% in and settle out over 0.6 s (smooth "landing" into each point)
  let settle = 1;
  for (const c of SECTION_CUTS) {
    if (t >= c && t < c + 0.6) settle = 1 + 0.08 * (1 - easeOut(clamp01((t - c) / 0.6)));
  }
  const intro = 1 + 0.03 * (1 - easeOut(clamp01(t / 1.0)));
  return base * emph * settle * intro;
};

export const ORIGIN = '50% 45%'; // roughly face height, so zooms keep the head below the top graphics
