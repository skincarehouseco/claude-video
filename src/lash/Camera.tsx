import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {CUTS, EXTEND, LASH_DURATION, SECTION_CUTS, SOURCE_FRAMES} from './timeline';

const ease = Easing.inOut(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EDGES = [0, ...CUTS, LASH_DURATION];

/*
 * Per-shot camera move: [scaleStart, scaleEnd, originX%, originY%].
 * Alternating slow push-ins / pull-outs so every shot breathes; bigger moves on the
 * moments worth emphasising (tonic reveal, peace-sign pull-back, final eye macro).
 */
const SHOT_MOVES: [number, number, number, number][] = [
  [1.1, 1.0, 50, 38], // 0  two tubes (intro settle)
  [1.0, 1.06, 50, 40], // 1  finger "1"
  [1.02, 1.1, 58, 40], // 2  rose-gold tonic next to face  ("yes or yes")
  [1.08, 1.02, 50, 40], // 3  tonic up close
  [1.0, 1.06, 50, 36], // 4  opening the brush
  [1.06, 1.0, 40, 30], // 5  root treatment close-up
  [1.0, 1.07, 35, 25], // 6  lashes close-up
  [1.1, 1.0, 50, 40], // 7  peace sign (pull back reveal)
  [1.0, 1.06, 55, 38], // 8  opening the red tube
  [1.0, 1.07, 55, 36], // 9  applying
  [1.06, 1.0, 55, 36], // 10 applying (wider)
  [1.0, 1.06, 50, 36], // 11 mirror
  [1.06, 1.0, 50, 36], // 12 mirror
  [1.0, 1.05, 50, 36], // 13 lash close
  [1.0, 1.12, 50, 50], // 14 eye macro, slow push in
];

const shotIndex = (frame: number) => {
  let i = 0;
  while (i < EDGES.length - 2 && frame >= EDGES[i + 1]) i++;
  return i;
};

// tiny "punch" on musical accents (sung "Yes", "yes") and on text-beat starts
const PUNCHES = [f30(2.55), f30(3.64), ...SECTION_CUTS.map((c) => c + 1)];
function f30(s: number) {
  return Math.round(s * 30);
}
const punch = (frame: number) => {
  let p = 0;
  for (const at of PUNCHES) {
    const k = frame - at;
    if (k >= 0 && k < 14) p = Math.max(p, Math.sin((k / 14) * Math.PI) * (1 - k / 14) * 0.045);
  }
  return p;
};

export const cameraFor = (frame: number) => {
  // 20 s extension: the extra live eye footage plays, then its last frame holds; the final push-in keeps going very slowly (1.12 -> 1.30)
  if (frame >= LASH_DURATION) {
    const u = interpolate(frame - LASH_DURATION, [0, EXTEND], [0, 1], clamp);
    return {scale: 1.12 * (1 + 0.16 * Easing.inOut(Easing.sin)(u)), origin: '50% 50%'};
  }
  const i = shotIndex(frame);
  const [s0, s1, ox, oy] = SHOT_MOVES[Math.min(i, SHOT_MOVES.length - 1)];
  const u = interpolate(frame, [EDGES[i], EDGES[i + 1]], [0, 1], clamp);
  let s = s0 + (s1 - s0) * ease(u);
  // zoom-through on section cuts (+9% over 10 frames); in-section hard cuts get a softer +4% settle
  if (EDGES[i] > 0) {
    const big = SECTION_CUTS.includes(EDGES[i]);
    const k = interpolate(frame - EDGES[i], [0, big ? 10 : 8], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
    s *= 1 + (big ? 0.09 : 0.04) * k;
  }
  s *= 1 + punch(frame);
  return {scale: s, origin: `${ox}% ${oy}%`};
};

const Shot: React.FC<{frame: number; extraScale?: number}> = ({frame, extraScale = 1}) => {
  const {scale, origin} = cameraFor(frame);
  return (
    <AbsoluteFill style={{transform: `scale(${(scale * extraScale).toFixed(5)})`, transformOrigin: origin}}>
      {frame >= SOURCE_FRAMES ? (
        <Freeze frame={SOURCE_FRAMES - 1}>
          <OffthreadVideo src={staticFile('lash/footage.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Freeze>
      ) : (
        <OffthreadVideo src={staticFile('lash/footage.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      )}
    </AbsoluteFill>
  );
};

/*
 * Transitions:
 *  - section cuts: the outgoing frame zooms forward + blurs while fading (zoom-through)
 *  - jump cuts inside a section: hard cut on the beat + small zoom settle
 */
export const LashCamera: React.FC = () => {
  const frame = useCurrentFrame();
  // only section cuts get an overlay; in-section cuts are crisp on-beat hard cuts
  const cut = SECTION_CUTS.find((c) => frame >= c && frame < c + 6);
  const isSection = cut !== undefined;
  const k = cut === undefined ? 0 : frame - cut;
  const len = 6;
  const outOpacity = cut === undefined ? 0 : interpolate(k, [0, len], [1, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  const inBlur = isSection ? interpolate(k, [0, 6], [6, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill style={{filter: inBlur > 0.05 ? `blur(${inBlur.toFixed(2)}px)` : undefined}}>
        <Shot frame={frame} />
      </AbsoluteFill>
      {cut !== undefined && (
        <AbsoluteFill
          style={{
            opacity: outOpacity,
            filter: isSection ? `blur(${(k * 1.4).toFixed(2)}px)` : undefined,
          }}
        >
          <Freeze frame={cut - 1}>
            <Shot frame={cut - 1} extraScale={isSection ? 1 + 0.025 * k : 1} />
          </Freeze>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
