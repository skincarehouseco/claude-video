import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './theme';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);

/** springy 0->1 starting at t0 (seconds) */
export const pop = (t: number, t0: number, stiff = 220, damping = 13) =>
  t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {stiffness: stiff, damping, mass: 0.6}});

/** smooth 0->1 over [t0, t0+d] */
export const ramp = (t: number, t0: number, d = 0.3, easing = easeInOut) =>
  interpolate(t, [t0, t0 + d], [0, 1], {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** visibility: springs in at t0, eases out over 0.2 s at t1 */
export const life = (t: number, t0: number, t1: number) => Math.min(pop(t, t0), 1 - ramp(t, t1 - 0.2, 0.2));

export const between = (t: number, a: number, b: number) => t >= a && t < b;
