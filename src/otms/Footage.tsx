import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';

/** one shot: clip file (public/otms/<src>.mp4), in-point (s), length on the timeline (s) */
export type Shot = {
  src: string;
  in: number;
  dur: number;
  rate?: number; // playback speed (slow-mo < 1)
  zoom?: [number, number]; // scale at start -> end of the shot
  pan?: [number, number]; // vertical drift in px start -> end
  origin?: string; // transform-origin for zooms (e.g. '50% 35%')
  punch?: number; // quick zoom-in on the cut (1E)
};

export type Transition = 'cut' | 'swipe' | 'fade' | 'zoom' | 'whip';

const ease = Easing.inOut(Easing.cubic);
// one consistent, light grade across the main video and the Drive clips
const GRADE = 'saturate(1.06) contrast(1.04) brightness(1.02)';

const ShotView: React.FC<{shot: Shot; len: number}> = ({shot, len}) => {
  const f = useCurrentFrame();
  const p = Math.min(1, Math.max(0, f / Math.max(1, len - 1)));
  const [z0, z1] = shot.zoom ?? [1.0, 1.04];
  const [p0, p1] = shot.pan ?? [0, 0];
  let z = z0 + (z1 - z0) * ease(p);
  if (shot.punch) z *= 1 + (shot.punch - 1) * interpolate(f, [0, 5], [1, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo
        src={staticFile(`otms/${shot.src}.mp4`)}
        startFrom={Math.round(shot.in * FPS)}
        playbackRate={shot.rate ?? 1}
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translateY(${p0 + (p1 - p0) * ease(p)}px) scale(${z})`,
          transformOrigin: shot.origin ?? '50% 45%',
          filter: GRADE,
        }}
      />
    </AbsoluteFill>
  );
};

/** lays shots end to end; shot i (i>0) enters over the last `tf` frames of shot i-1 */
export const Footage: React.FC<{shots: Shot[]; transition: Transition; tf?: number}> = ({shots, transition, tf = 8}) => {
  const frame = useCurrentFrame();
  const T = transition === 'cut' ? 0 : tf;
  let at = 0;
  const items = shots.map((s, i) => {
    const len = Math.round(s.dur * FPS);
    const from = at;
    at += len;
    return {s, i, from, len};
  });
  return (
    <AbsoluteFill>
      {items.map(({s, i, from, len}) => {
        const pre = i === 0 ? 0 : T; // frames this shot is visible before its cut point
        const start = from - pre;
        const p = pre ? ease(Math.min(1, Math.max(0, (frame - start) / pre))) : 1;
        let style: React.CSSProperties = {};
        if (transition === 'swipe') style = {transform: `translateX(${(1 - p) * 1080}px)`};
        if (transition === 'whip') style = {transform: `translateX(${(1 - p) * 1080}px)`, filter: p < 1 ? `blur(${(1 - p) * 16}px)` : undefined};
        if (transition === 'fade') style = {opacity: p};
        if (transition === 'zoom') style = {opacity: p, transform: `scale(${1.12 - 0.12 * p})`};
        // the in-point is pulled back by the pre-roll so the cut point lands on `in`
        const shot = {...s, in: Math.max(0, s.in - pre / FPS)};
        return (
          <Sequence key={i} from={start} durationInFrames={len + pre + (i < items.length - 1 ? T : 0)} layout="none">
            <AbsoluteFill style={style}>
              <ShotView shot={shot} len={len + pre} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const totalDur = (shots: Shot[]) => shots.reduce((a, s) => a + Math.round(s.dur * FPS), 0);
export const cutTimes = (shots: Shot[]) => {
  let at = 0;
  return shots.map((s) => {
    const t = at;
    at += Math.round(s.dur * FPS);
    return t / FPS;
  });
};
