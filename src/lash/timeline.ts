import {Easing} from 'remotion';

export const LASH_FPS = 30;
export const LASH_DURATION_S = 12.7;
export const LASH_FRAMES = Math.round(LASH_DURATION_S * LASH_FPS); // 381

export const t2f = (s: number) => Math.round(s * LASH_FPS);
export const f2t = (f: number) => f / LASH_FPS;

// Shot cuts in the source clip (ffmpeg scene detection), seconds.
// 0 products | 1.67 tonic hold | 2.30 tonic open | 3.07 tonic brush | 4.20 tonic on lash line
// 6.30 jelly hold | 7.30 jelly open | 8.30 jelly brush | 9.17 brushing lashes (eye open) -> end
export const SHOTS = [0, 1.667, 2.3, 3.067, 4.2, 6.3, 7.3, 8.3, 9.167, LASH_DURATION_S];
// cuts that start a new section get a zoom-through transition; the rest get a soft punch-in
export const SECTION_CUTS = [1.667, 6.3, 9.167];

export const ease = Easing.inOut(Easing.cubic);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Section windows (s)
export const HOOK = {from: 0, to: 1.667};
export const TONIC = {from: 1.72, to: 6.3};
export const JELLY = {from: 6.36, to: 9.167};
export const BOTH = {from: 9.3, to: LASH_DURATION_S};
