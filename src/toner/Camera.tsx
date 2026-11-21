import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {CUTS, DURATION, ZOOM_THROUGH} from './theme';

const ease = Easing.inOut(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Per-shot camera moves: [from, to, scale keyframes (frame -> scale), transform-origin]
type Shot = {from: number; to: number; keys: [number, number][]; origin: string};
const SHOTS: Shot[] = [
  {from: 0, to: 39, keys: [[0, 1.14], [39, 1.0]], origin: '45% 32%'}, // intro: ease out to reveal
  {from: 39, to: 59, keys: [[39, 1.0], [59, 1.05]], origin: '55% 30%'}, // spray: gentle push
  {from: 59, to: 73, keys: [[59, 1.05], [73, 1.09]], origin: '50% 32%'},
  {from: 73, to: 101, keys: [[73, 1.1], [101, 1.0]], origin: '40% 32%'}, // bottle close-up: zoom out
  {from: 101, to: 193, keys: [[101, 1.0], [146, 1.06], [193, 1.12]], origin: '58% 46%'}, // arm: slow push to the rub
  {from: 193, to: 216, keys: [[193, 1.04], [216, 1.12]], origin: '45% 36%'}, // "plump" punch-in
  {from: 216, to: 242, keys: [[216, 1.09], [242, 1.0]], origin: '45% 36%'},
  // last shot: push in on "dehydrated skin", ease out for the benefits card, then a slow drift in
  {from: 242, to: DURATION, keys: [[242, 1.0], [280, 1.08], [302, 1.0], [374, 1.045]], origin: '50% 30%'},
];

const shotAt = (f: number) => SHOTS.find((s) => f >= s.from && f < s.to) ?? SHOTS[SHOTS.length - 1];

const scaleAt = (f: number) => {
  const s = shotAt(f);
  const ks = s.keys;
  for (let i = 0; i < ks.length - 1; i++) {
    if (f <= ks[i + 1][0]) return interpolate(f, [ks[i][0], ks[i + 1][0]], [ks[i][1], ks[i + 1][1]], {...clamp, easing: ease});
  }
  return ks[ks.length - 1][1];
};

const ZT = 6; // zoom-through half length (frames)
// extra zoom + blur around topic-change cuts
const zoomThrough = (f: number) => {
  for (const c of ZOOM_THROUGH) {
    if (f >= c - ZT && f < c) {
      const p = Easing.in(Easing.cubic)((f - (c - ZT)) / ZT);
      return {z: 1 + 0.16 * p, blur: 9 * p};
    }
    if (f >= c && f < c + ZT) {
      const p = 1 - Easing.out(Easing.cubic)((f - c) / ZT);
      return {z: 1 + 0.16 * p, blur: 9 * p};
    }
  }
  return {z: 1, blur: 0};
};

const Footage: React.FC<{f: number}> = ({f}) => {
  const {z, blur} = zoomThrough(f);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${(scaleAt(f) * z).toFixed(5)})`,
        transformOrigin: shotAt(f).origin,
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
      }}
    >
      <OffthreadVideo src={staticFile('toner/main.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

const DISSOLVE = 4;
export const Camera: React.FC = () => {
  const f = useCurrentFrame();
  const soft = CUTS.filter((c) => !ZOOM_THROUGH.includes(c)).find((c) => f >= c && f < c + DISSOLVE);
  const flash = ZOOM_THROUGH.map((c) => interpolate(f, [c - 3, c, c + 6], [0, 0.35, 0], clamp)).reduce((a, b) => Math.max(a, b), 0);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Footage f={f} />
      {soft !== undefined && (
        // hold the outgoing frame and dissolve it away so quick cuts feel smooth, not jumpy
        <AbsoluteFill style={{opacity: 1 - interpolate(f - soft, [0, DISSOLVE], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)})}}>
          <Freeze frame={soft - 1}>
            <Footage f={soft - 1} />
          </Freeze>
        </AbsoluteFill>
      )}
      {/* creamy light flash on the zoom-through transitions */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #FFFDF2 0%, rgba(255,246,220,0.6) 70%)', opacity: flash}} />
    </AbsoluteFill>
  );
};
