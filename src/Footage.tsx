import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {f, FPS} from './theme';

/**
 * Shot list: footage re-cut to follow the voice-over, in the same order as the reference edit.
 * [start (s, timeline), source in-point (s, public/main.mp4), playback rate, transform-origin, zoom direction]
 * Each shot ends where the next one starts.
 */
type Shot = {at: number; src: number; rate?: number; origin?: string; dir: 1 | -1};
export const SHOTS: Shot[] = [
  {at: 0.0, src: 0.2, dir: -1, origin: '45% 35%'}, // hook – applying serum
  {at: 3.15, src: 4.1, dir: 1, origin: '55% 40%'}, // "bila you stop pakai" – desk with products
  {at: 7.05, src: 9.75, dir: 1, origin: '50% 32%'}, // "bulu mata you akan gugur" – cotton pad
  {at: 8.95, src: 13.32, rate: 0.95, dir: -1, origin: '45% 45%'}, // "tumbuh semula" – lash close-up
  {at: 12.15, src: 16.52, rate: 0.62, dir: 1, origin: '50% 35%'}, // "tapi jap, before you assume"
  {at: 14.05, src: 18.0, dir: -1, origin: '50% 30%'}, // "lash serum tak bagi permanent result?"
  {at: 17.3, src: 29.0, dir: 1, origin: '50% 38%'}, // "you need to understand" – removing makeup
  {at: 20.6, src: 35.4, dir: -1, origin: '50% 50%'}, // fallen lashes on tissue
  {at: 22.45, src: 39.6, dir: 1, origin: '45% 35%'}, // "part of our body's biology"
  {at: 24.85, src: 43.25, dir: -1, origin: '50% 35%'}, // anagen
  {at: 27.65, src: 46.5, dir: 1, origin: '50% 35%'},
  {at: 31.6, src: 51.99, rate: 0.98, dir: -1, origin: '50% 35%'},
  {at: 33.8, src: 54.26, dir: 1, origin: '50% 35%'}, // "tak boleh menghentikan natural lash cycle"
  {at: 36.5, src: 59.8, dir: -1, origin: '50% 32%'}, // telogen
  {at: 39.4, src: 62.86, dir: 1, origin: '45% 35%'},
  {at: 41.5, src: 65.01, dir: -1, origin: '45% 40%'},
  {at: 42.85, src: 22.5, dir: 1, origin: '50% 30%'},
  {at: 44.6, src: 57.3, dir: -1, origin: '50% 45%'},
  {at: 46.6, src: 66.45, dir: 1, origin: '50% 35%'}, // "consistency is very important"
  {at: 50.0, src: 70.66, rate: 0.88, dir: -1, origin: '50% 45%'}, // "bukan sekadar..." – two tubes
  {at: 52.6, src: 73.0, dir: 1, origin: '50% 40%'}, // "tapi juga untuk maintain the result"
];
export const SHOT_END = 55.3;

// Emphasis push-ins on key words: [start, end, extra zoom]
const PUNCH: [number, number, number][] = [
  [8.3, 8.9, 0.07], // gugur
  [12.2, 12.95, 0.1], // TAPI JAP!
  [15.9, 17.1, 0.06], // permanent result
  [17.75, 18.5, 0.06], // understand
  [28.8, 30.0, 0.05], // anagen
  [39.7, 40.5, 0.05], // telogen
  [48.0, 49.9, 0.07], // consistency is important
  [53.5, 55.3, 0.06], // maintain the result
];

const ease = Easing.inOut(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const zoomAt = (t: number) => {
  const i = Math.max(0, SHOTS.findIndex((s, k) => t >= s.at && t < (SHOTS[k + 1]?.at ?? SHOT_END)));
  const s = SHOTS[i];
  const end = SHOTS[i + 1]?.at ?? SHOT_END;
  const u = interpolate(t, [s.at, end], [0, 1], {...clamp, easing: ease});
  // slow drift: push in (1.03 -> 1.10) or ease out (1.10 -> 1.03)
  const base = s.dir === 1 ? 1.03 + 0.07 * u : 1.1 - 0.07 * u;
  let punch = 0;
  for (const [a, b, z] of PUNCH) {
    const inP = interpolate(t, [a - 0.05, a + 0.3], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
    const outP = interpolate(t, [b, b + 0.7], [0, 1], {...clamp, easing: ease});
    punch = Math.max(punch, z * inP * (1 - outP));
  }
  return base + punch;
};

const Clip: React.FC<{shot: Shot; index: number}> = ({shot}) => {
  const frame = useCurrentFrame();
  const t = shot.at + frame / FPS;
  return (
    <AbsoluteFill style={{transform: `scale(${zoomAt(t).toFixed(5)})`, transformOrigin: shot.origin ?? '50% 40%'}}>
      <OffthreadVideo
        src={staticFile('main.mp4')}
        startFrom={f(shot.src)}
        playbackRate={shot.rate ?? 1}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </AbsoluteFill>
  );
};

const DISSOLVE = 7; // frames

/** One shot plus a soft dissolve from the frozen last frame of the previous shot (no hard jump cuts). */
const ShotWithDissolve: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const shot = SHOTS[i];
  const prev = SHOTS[i - 1];
  const prevLen = prev ? f(shot.at) - f(prev.at) : 0;
  const o = interpolate(frame, [0, DISSOLVE], [1, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  // tiny scale "breath" into the new shot
  const settle = interpolate(frame, [0, 10], [1.035, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${settle})`}}>
        <Clip shot={shot} index={i} />
      </AbsoluteFill>
      {prev && frame < DISSOLVE && (
        <AbsoluteFill style={{opacity: o, filter: `blur(${(1 - o) * 6}px)`}}>
          <Freeze frame={prevLen - 1}>
            <Clip shot={prev} index={i - 1} />
          </Freeze>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const Footage: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
    {SHOTS.map((s, i) => {
      const from = f(s.at);
      const to = f(SHOTS[i + 1]?.at ?? SHOT_END);
      return (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          <ShotWithDissolve i={i} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
