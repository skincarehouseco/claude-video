import {Easing, interpolate} from 'remotion';

// Jump cuts in the source footage, in frames (detected with ffmpeg scene detection)
export const CUT_FRAMES = [188, 327, 820, 903, 1179, 1245, 1419, 1665, 1981];
const SHOT_EDGES = [0, ...CUT_FRAMES.map((f) => f / 30), 76.8];

const ease = Easing.inOut(Easing.cubic);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Gentle emphasis push-ins: [start, end, scale]. Never straddle a jump cut.
const EMPHASIS: [number, number, number][] = [
  [18.6, 21.2, 1.08], // "too harsh"
  [31.1, 33.5, 1.05], // "good combo"
  [41.7, 43.4, 1.08], // "be careful"
  [50.1, 52.3, 1.05], // "great combo"
  [57.9, 60.1, 1.06], // "super flexible"
  [73.9, 99, 1.08], // "make sure you layer them correctly"
];

/**
 * Smooth camera scale at time t (seconds).
 * Each shot slowly pushes in (even shots) or eases out (odd shots) by 4%, so the scale is continuous
 * across every jump cut; emphasis zooms ease in over 0.5s and out over 0.8s on top of that.
 */
export const zoomAt = (t: number) => {
  let i = 0;
  while (i < SHOT_EDGES.length - 2 && t >= SHOT_EDGES[i + 1]) i++;
  const u = clamp01((t - SHOT_EDGES[i]) / (SHOT_EDGES[i + 1] - SHOT_EDGES[i]));
  const base = i % 2 === 0 ? 1 + 0.04 * ease(u) : 1.04 - 0.04 * ease(u);
  let emph = 1;
  for (const [s, e, z] of EMPHASIS) {
    if (t > s - 0.01 && t < e + 0.8) {
      const inP = ease(clamp01((t - s) / 0.5));
      const outP = ease(clamp01((t - e) / 0.8));
      emph = 1 + (z - 1) * inP * (1 - outP);
    }
  }
  const intro = 1 + 0.07 * (1 - ease(clamp01(t / 1.4)));
  return base * emph * intro;
};

export const ORIGIN = '50% 34%'; // roughly face height
export const cameraTransform = (t: number) => `scale(${zoomAt(t).toFixed(5)})`;

// opacity of the outgoing-shot overlay used to dissolve each jump cut (6 frames)
export const DISSOLVE_FRAMES = 6;
export const dissolveOpacity = (k: number) =>
  1 - interpolate(k, [0, DISSOLVE_FRAMES], [0, 1], {easing: Easing.inOut(Easing.sin), extrapolateRight: 'clamp'});
