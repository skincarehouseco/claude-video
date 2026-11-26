import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {clampI, H, SPEECH_END_FRAME, W} from './theme';

// Frame ranges with a speaker cut-out (talking-head shots). Other ranges are B-roll scenes.
export const CUT_RANGES: [number, number][] = [
  [0, 109],
  [234, 676],
  [838, 952],
  [953, SPEECH_END_FRAME],
];
export const hasCut = (f: number) => CUT_RANGES.some(([a, b]) => f >= a && f <= b);
const pad = (n: number) => String(n).padStart(4, '0');

// "camera" for the cut-out layer: frame, x offset, y offset, scale (origin = bottom centre)
type Key = [number, number, number, number];
const KEYS: Key[] = [
  [0, 0, 140, 0.84],
  [104, 0, 120, 0.88],
  [234, 170, 130, 0.86],
  [292, 170, 120, 0.88],
  [312, 190, 80, 0.84],
  [430, 190, 70, 0.86],
  [448, 205, 130, 0.82],
  [612, 205, 120, 0.85],
  [628, 0, 250, 0.86],
  [676, 0, 215, 0.9],
  [838, 0, 0, 0.8],
  [952, 0, 0, 0.86],
  [953, 205, 120, 0.84],
  [1090, 205, 110, 0.87],
  [1110, 0, 90, 0.86],
  [1227, 0, 70, 0.92],
];
// quick "punch-in" emphasis moments: frame, extra scale
const PUNCH: [number, number][] = [
  [57, 0.035],
  [658, 0.03],
  [1124, 0.045],
];

export const subjectCam = (f: number) => {
  let i = KEYS.findIndex((k, j) => j < KEYS.length - 1 && f >= k[0] && f < KEYS[j + 1][0]);
  if (i < 0) i = f < KEYS[0][0] ? 0 : KEYS.length - 2;
  const [a, b] = [KEYS[i], KEYS[i + 1]];
  const ch = (c: number) => clampI(f, [a[0], b[0]], [a[c], b[c]]);
  let s = ch(3);
  PUNCH.forEach(([pf, amt]) => {
    const d = f - pf;
    if (d >= 0 && d < 40) s += amt * Math.min(d / 5, 1) * Math.exp(-Math.max(0, d - 5) / 14);
  });
  // the hijab touches the source frame's right edge: keep that edge off-canvas
  return {x: Math.max(ch(1), (W / 2) * (1 - s) + 2), y: ch(2), s};
};

export const Subject: React.FC = () => {
  const f = useCurrentFrame();
  const src = Math.min(f, SPEECH_END_FRAME);
  if (!hasCut(src)) return null;
  const {x, y, s} = subjectCam(f);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* contact shadow on the "floor" */}
      <div
        style={{
          position: 'absolute',
          left: W / 2 + x - 420 * s,
          top: H - 70,
          width: 840 * s,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(80,45,60,0.28), rgba(80,45,60,0))',
          filter: 'blur(14px)',
        }}
      />
      <Img
        src={staticFile(`glow/cut/s_${pad(src)}.webp`)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: '50% 100%',
          transform: `translate(${x}px, ${y}px) scale(${s})`,
          // soft white rim + long editorial shadow so the cut-out sits *in* the scene
          filter:
            'brightness(1.03) saturate(1.04) drop-shadow(0 0 2px rgba(255,255,255,0.55)) drop-shadow(-24px 30px 46px rgba(90,50,70,0.26))',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 46px, #000 1034px, transparent 1080px)',
        }}
      />
    </AbsoluteFill>
  );
};
