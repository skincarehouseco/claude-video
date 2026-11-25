import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';
import track from './swatch_track.json';

/* Simple, aesthetic UGC version (like the Judydoll reference): original footage + original colours,
   clean white TikTok-style text, no graphics. */
export const NOFA_SIMPLE_FRAMES = 763;
const TRACK = track as unknown as Record<string, [number, number][]>;
const TT = 'TikTokSans';
const ease = Easing.inOut(Easing.cubic);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const vis = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => ease(clamp((t - a) / fi)) * (1 - ease(clamp((t - (b - fo)) / fo)));

const txt = (size: number, weight: number): React.CSSProperties => ({
  fontFamily: TT,
  fontWeight: weight,
  fontSize: size,
  color: '#fff',
  lineHeight: 1.05,
  textAlign: 'center',
  letterSpacing: weight >= 800 ? -0.5 : 0,
  textShadow: '0 1px 3px rgba(0,0,0,0.35), 0 2px 16px rgba(0,0,0,0.3)',
});

const Center: React.FC<{t: number; a: number; b: number; small?: string; big?: string; y: number; bigSize?: number}> = ({t, a, b, small, big, y, bigSize = 112}) => {
  const o = vis(t, a, b);
  if (o <= 0) return null;
  const p = ease(clamp((t - a) / 0.35));
  return (
    <div style={{position: 'absolute', left: 60, width: 870, top: y, opacity: o, transform: `translateY(${(1 - p) * 10}px)`}}>
      {small && <div style={{...txt(40, 500), marginBottom: 6}}>{small}</div>}
      {big && <div style={{...txt(bigSize, 800)}}>{big}</div>}
    </div>
  );
};

// camera: barely-there push-ins so it still feels handheld/organic
const CUTS = [0, 1.533, 2.367, 4.333, 7.933, 13.033, 14.933, 16.967, 19.7, 21.833, NOFA_SIMPLE_FRAMES / FPS];
const scaleAt = (t: number) => {
  let i = 0;
  while (i < CUTS.length - 2 && t >= CUTS[i + 1]) i++;
  const p = clamp((t - CUTS[i]) / (CUTS[i + 1] - CUTS[i]));
  return 1 + 0.03 * ease(p) + (i === 9 ? 0.05 * ease(p) : 0);
};
const ORIGIN = {x: 540, y: 864};
const toScreen = (t: number, x: number, y: number): [number, number] => {
  const s = scaleAt(t);
  return [ORIGIN.x + (x - ORIGIN.x) * s, ORIGIN.y + (y - ORIGIN.y) * s];
};

const SHADES = [
  {name: 'Vanilla', at: 5.9, dx: -250},
  {name: 'Light', at: 8.3, dx: -240},
  {name: 'Natural', at: 9.35, dx: -190},
];

/** small white label just left of each swatch's tip (never on the swatch); only on the first arm angle */
const SwatchLabels: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < 5.8 || t >= 13.03) return null;
  const pts = TRACK[String(frame + 1)];
  if (!pts) return null;
  return (
    <>
      {SHADES.map((s, i) => {
        const o = vis(t, s.at, 13.03, 0.3, 0.15);
        if (o <= 0) return null;
        const [x, y] = toScreen(t, pts[i][0] + s.dx, pts[i][1]);
        return (
          <div key={s.name} style={{position: 'absolute', left: x - 22, top: y, transform: 'translate(-100%, -50%)', opacity: o, ...txt(44, 700), textAlign: 'right', whiteSpace: 'nowrap'}}>
            {s.name}
          </div>
        );
      })}
    </>
  );
};

type Cue = [number, string, number];
const CUES: Cue[] = [
  [0.2, 'n_handle', 0.35],
  [4.75, 'n_creamy', 0.5],
  [5.25, 'n_swipe', 0.45],
  [5.9, 'n_pop', 0.3],
  [8.0, 'n_creamy', 0.5],
  [8.45, 'n_swipe', 0.45],
  [8.3, 'n_pop', 0.3],
  [9.1, 'n_creamy', 0.5],
  [9.55, 'n_swipe', 0.45],
  [9.35, 'n_pop', 0.3],
  [14.93, 'n_handle', 0.35],
  [19.7, 'n_handle', 0.3],
  [22.05, 'n_squeeze', 0.65],
  [22.8, 'n_creamy', 0.4],
  [23.35, 'n_squeeze', 0.55],
  [24.1, 'n_creamy', 0.35],
];

export const NofaSimple: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const end = interpolate(frame, [NOFA_SIMPLE_FRAMES - 12, NOFA_SIMPLE_FRAMES - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <OffthreadVideo src={staticFile('nofa/source.mp4')} muted style={{width: '100%', height: '100%', transform: `scale(${scaleAt(t)})`, transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`}} />
      </AbsoluteFill>

      {/* hook — small line + one big bold line, like the reference */}
      <Center t={t} a={0.15} b={4.3} small="find your perfect shade" big="NOFA TINT?" y={1020} />
      {/* swatches */}
      <SwatchLabels t={t} frame={frame} />
      <Center t={t} a={10.4} b={14.9} small="three shades, side by side" y={200} />
      <Center t={t} a={13.1} b={14.9} small="Vanilla · Light · Natural" y={1300} />
      {/* end */}
      <Center t={t} a={22.6} b={25.5} small="which one is your perfect shade?" big="Vanilla, Light or Natural?" y={250} bigSize={78} />

      <AbsoluteFill style={{background: '#fff', opacity: end}} />
      <Audio
        src={staticFile('audio/n_music.wav')}
        volume={(f) => 0.32 * interpolate(f, [0, 12, NOFA_SIMPLE_FRAMES - 30, NOFA_SIMPLE_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      {CUES.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={60} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
