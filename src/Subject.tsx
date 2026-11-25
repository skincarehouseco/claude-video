import React from 'react';
import {AbsoluteFill, Freeze, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {clamp01, easeInOut} from './anim';
import {bgAt} from './Backgrounds';
import {FPS} from './theme';

/**
 * Presenter "camera": layout keyframes [time, translateY px, scale].
 * translateY >= 0 only (moving her down frees the top band for graphics; the cut-out's bottom edge
 * stays below the frame), scale >= 1 around the face so the frame edges are always covered.
 */
const LAYOUT: [number, number, number][] = [
  [0, 0, 1.0],
  // hook: a punch-in on every "tak payah"
  [0.82, 0, 1.05],
  [1.86, 0, 1.1],
  [3.02, 0, 1.15],
  [4.3, 0, 1.28],
  [4.72, 0, 1.0],
  [6.5, 0, 1.06], //  "kenal tak skin type you apa?"
  [8.1, 0, 1.0],
  [12.25, 0, 1.0],
  [15.32, 0, 1.12], // "tak tahu pun skin type dia apa" (confused-math meme)
  [16.9, 230, 1.0], // consequences list on top
  [21.46, 230, 1.08], // "skin problem" (vine boom)
  [22.5, 120, 1.0],
  [26.74, 0, 1.24], // "macam mana?"
  [27.8, 0, 1.0],
  [36.0, 0, 1.0], // keep 1:1 while the source's own caption is baked in (36.5-42.5) — the cover label rides along
  [41.26, 0, 1.1], // "ini part yang paling penting"
  [42.45, 60, 1.0],
  [45.0, 270, 1.0], // face map on top
  [48.5, 210, 1.0],
  [51.8, 210, 1.0],
  [57.22, 210, 1.06], // "most probably ... combination skin"
  [59.1, 170, 1.0],
  [64.3, 170, 1.0],
  [67.64, 170, 1.06],
  [68.3, 120, 1.0],
  [72.86, 0, 1.42], // "look closely" — magnify the face
  [73.75, 140, 1.0],
  [78.84, 140, 1.06],
  [79.4, 320, 1.0], // recap cards on top
  [83.55, 260, 1.0], // follow card on top
  [86.62, 60, 1.12], // "Bye!"
];
const MOVE_S = 0.35;

// hard switches (no easing): the cut-aways cover these moments
const SNAP = new Set([4.72, 8.1, 12.25, 27.8]);

export const layoutAt = (t: number) => {
  let i = 0;
  while (i < LAYOUT.length - 1 && t >= LAYOUT[i + 1][0]) i++;
  const [t1, y1, s1] = LAYOUT[i];
  if (i === 0 || SNAP.has(t1)) return {y: y1, s: s1};
  const [, y0, s0] = LAYOUT[i - 1];
  const p = easeInOut(clamp01((t - t1) / MOVE_S));
  return {y: y0 + (y1 - y0) * p, s: s0 + (s1 - s0) * p};
};

export const SubjectTransform: React.FC<{children: React.ReactNode}> = ({children}) => {
  const t = useCurrentFrame() / FPS;
  const {y, s} = layoutAt(t);
  // slow breathing drift for parallax against the background
  const drift = 1 + 0.012 * Math.sin(t * 0.5);
  return (
    <AbsoluteFill style={{transform: `translateY(${y}px) scale(${s * drift})`, transformOrigin: '50% 36%'}}>{children}</AbsoluteFill>
  );
};

/** cut-out of the presenter (public/subject.webm, VP9 + alpha) */
export const Subject: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (bgAt(t) === 'raw') return null; // source composite segment is shown as-is
  const vid = (
    <OffthreadVideo
      src={staticFile('subject.webm')}
      transparent
      muted
      style={{width: '100%', height: '100%', filter: 'drop-shadow(0 18px 36px rgba(0,0,0,0.28))'}}
    />
  );
  // frames 1-9 of the source are a white flash; hold the first clean frame instead (0.3s)
  const hook = frame <= 10;
  const shine = interpolate(frame, [0, 6], [0.6, 0], {extrapolateRight: 'clamp'});
  return (
    <SubjectTransform>
      {hook ? <Freeze frame={11}>{vid}</Freeze> : vid}
      {children}
      {shine > 0 && <AbsoluteFill style={{background: '#fff', opacity: shine}} />}
    </SubjectTransform>
  );
};
