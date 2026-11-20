import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {clamp, CUTS, easeIO, faceAt, FPS} from './theme';

/*
 * Smooth zoom keyframes [time (s), scale]. Values ease (cubic in-out) between keys.
 * Pushes land on key words; the two jump cuts get a "zoom-through" (push in before, ease out after).
 */
const ZOOM: [number, number][] = [
  [0, 1.13], [1.5, 1.0], // intro reveal
  [2.05, 1.0], [2.6, 1.06], // "basic"
  [3.6, 1.03], [4.25, 1.1], [5.0, 1.1], // "sensitive or breakout" (blush)
  [5.5, 1.0], [6.9, 1.0], // room for the product pop-ups
  [7.6, 1.04], [8.7, 1.04], [9.2, 1.12], [10.3, 1.12], // "bukan MORE skincare"
  [10.9, 1.0], [11.8, 1.0], [12.25, 1.07], [13.2, 1.02], // "excited"
  [14.6, 1.02], [15.1, 1.07], [15.45, 1.07], [15.8, 1.12], // "5 ke 6 layer"
  [16.2, 1.12], [16.7, 1.0], // "but honestly" reset
  [17.25, 1.0], [17.7, 1.08], [18.3, 1.08], // "less is better"
  [18.9, 1.02], [19.4, 1.02], [19.8, 1.06], [20.4, 1.0], // "break"
  [20.7, 1.0], [21.2, 1.04], [21.733, 1.1], // push into jump cut 1
  [21.734, 1.09], [22.4, 1.0], [24.0, 1.0], // three things (room for icons)
  [24.6, 1.04], [25.9, 1.06], [26.399, 1.1], // push into jump cut 2
  [26.4, 1.09], [27.0, 1.0], [27.6, 1.0], [28.1, 1.08], // "meragam"
  [28.5, 1.03], [29.0, 1.03], [29.45, 1.11], [29.9, 1.11], // "keep it SIMPLE"
  [30.5, 1.02], [31.3, 1.02], [31.75, 1.07], [32.3, 1.0], // "experiment"
  [33.0, 1.0], [33.35, 1.06], [33.83, 1.07], // "Okay?" thumbs up
];

export const zoomAt = (t: number) => {
  let i = 0;
  while (i < ZOOM.length - 2 && t >= ZOOM[i + 1][0]) i++;
  const [t0, z0] = ZOOM[i];
  const [t1, z1] = ZOOM[i + 1];
  return interpolate(t, [t0, t1], [z0, z1], {...clamp, easing: easeIO});
};

export const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = zoomAt(t);
  const face = faceAt(frame);
  // zoom about the (smoothed) face so she always stays centred in the push-ins
  const ox = face.x;
  const oy = face.y - face.w * 0.05;
  // soft motion blur only across the zoom-through cuts
  const d = Math.min(...CUTS.map((c) => Math.abs(frame - c)));
  const blur = interpolate(d, [0, 4], [5, 0], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill
        style={{
          transform: `scale(${s.toFixed(5)})`,
          transformOrigin: `${ox.toFixed(1)}px ${oy.toFixed(1)}px`,
          filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        }}
      >
        <OffthreadVideo src={staticFile('v2/main.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** screen position of a point given in footage coordinates (follows the camera zoom) */
export const toScreen = (frame: number, x: number, y: number) => {
  const s = zoomAt(frame / FPS);
  const f = faceAt(frame);
  const ox = f.x;
  const oy = f.y - f.w * 0.05;
  return {x: ox + (x - ox) * s, y: oy + (y - oy) * s, s};
};

/** soft white flash + glow that rides over the zoom-through at each jump cut */
export const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const d = Math.min(...CUTS.map((c) => frame - c).filter((x) => x > -6 && x < 10), 99);
  if (d === 99) return null;
  const o = d < 0 ? interpolate(d, [-6, 0], [0, 0.32], clamp) : interpolate(d, [0, 9], [0.32, 0], {...clamp, easing: easeIO});
  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 55% 45%, rgba(255,251,234,1) 0%, rgba(255,240,166,0.7) 45%, rgba(255,214,228,0.4) 100%)',
        opacity: o,
        mixBlendMode: 'screen',
      }}
    />
  );
};
