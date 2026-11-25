import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';
import track from './swatch_track.json';

export const NOFA_FRAMES = 763; // full original length (25.43 s)
const TRACK = track as unknown as Record<string, [number, number][]>;

const SERIF = 'Cormorant';
const SANS = 'Montserrat';
const INK = '#3A2A20'; // espresso
const GLOW = '0 0 18px rgba(246,239,228,0.85), 0 0 4px rgba(246,239,228,0.9)';

const ease = Easing.inOut(Easing.cubic);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const fadeIn = (t: number, a: number, d = 0.5) => ease(clamp((t - a) / d));
const fadeOut = (t: number, b: number, d = 0.4) => 1 - ease(clamp((t - (b - d)) / d));

/* ---------------------------------------------------------------- shots (detected cuts) + camera */
const CUTS = [0, 1.533, 2.367, 4.333, 7.933, 13.033, 14.933, 16.967, 19.7, 21.833, NOFA_FRAMES / FPS];
// scale at start -> end of each shot (push-ins / gentle pull-backs); swatching kept almost still
const ZOOM: [number, number][] = [
  [1.0, 1.07], [1.05, 1.09], [1.0, 1.05], [1.0, 1.025], [1.0, 1.03], [1.03, 1.0], [1.0, 1.06], [1.05, 1.0], [1.0, 1.06], [1.0, 1.14],
];
const ORIGIN = {x: 540, y: 864}; // 50% 45%

const shotAt = (t: number) => {
  let i = 0;
  while (i < CUTS.length - 2 && t >= CUTS[i + 1]) i++;
  return i;
};
const scaleAt = (t: number) => {
  const i = shotAt(t);
  const p = clamp((t - CUTS[i]) / (CUTS[i + 1] - CUTS[i]));
  const [a, b] = ZOOM[i];
  return a + (b - a) * ease(p);
};
/** source pixel -> screen pixel through the camera */
const toScreen = (t: number, x: number, y: number): [number, number] => {
  const s = scaleAt(t);
  return [ORIGIN.x + (x - ORIGIN.x) * s, ORIGIN.y + (y - ORIGIN.y) * s];
};

const Plate: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // soft-focus transition: a brief blur that peaks on each cut (lighter on the jump cut inside the swatching)
  let blur = 0;
  CUTS.slice(1, -1).forEach((c) => {
    const d = Math.abs(t - c);
    const peak = c === 7.933 ? 3 : 9;
    if (d < 0.17) blur = Math.max(blur, peak * (1 - d / 0.17));
  });
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#F4ECE0'}}>
      <OffthreadVideo
        src={staticFile('nofa/plate.mp4')}
        muted
        style={{width: '100%', height: '100%', transform: `scale(${scaleAt(t)})`, transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`, filter: blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : undefined}}
      />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- typography */
const Title: React.FC<{t: number}> = ({t}) => {
  const a = fadeIn(t, 0.25, 0.7);
  const b = fadeIn(t, 0.7, 0.7);
  const o = fadeOut(t, 2.3, 0.35);
  const line = fadeIn(t, 0.9, 0.8);
  if (t > 2.35) return null;
  return (
    <div style={{position: 'absolute', top: 210, left: 0, width: 1080, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 78, color: INK, letterSpacing: 0.5, textShadow: GLOW, opacity: a, transform: `translateY(${(1 - a) * 14}px)`, filter: `blur(${(1 - a) * 6}px)`}}>
        Find your perfect shade.
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 14, opacity: b}}>
        <div style={{height: 1.5, width: 70 * line, background: INK, opacity: 0.7}} />
        <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 25, letterSpacing: '0.42em', color: INK, textShadow: GLOW, paddingLeft: '0.42em'}}>NOFA TINTED SUNSCREEN</div>
        <div style={{height: 1.5, width: 70 * line, background: INK, opacity: 0.7}} />
      </div>
    </div>
  );
};

const SHADES = [
  {name: 'VANILLA', note: 'lightest shade', at: 5.9},
  {name: 'LIGHT', note: 'middle shade', at: 8.3},
  {name: 'NATURAL', note: 'deepest shade', at: 9.35},
];
const COMPARE_AT = 10.4;
const COMPARE_END = 14.93;

/** editorial legend in the clear background corner, with hairlines tracking each swatch on the arm */
const ShadeLabels: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < 5.8 || t >= COMPARE_END) return null;
  const pts = TRACK[String(frame + 1)]; // track is keyed by 1-based source frame
  if (!pts) return null;
  const blended = frame + 1 >= 392; // second comparison angle: legend moves to the right
  const notesOut = 1 - fadeIn(t, COMPARE_AT, 0.5);
  const seg2In = blended ? fadeIn(t, 13.05, 0.35) : 1;
  return (
    <AbsoluteFill style={{opacity: seg2In}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {SHADES.map((s, i) => {
          const p = fadeIn(t, s.at, 0.45);
          if (p <= 0) return null;
          const [sx, sy] = toScreen(t, pts[i][0], pts[i][1]);
          // end the hairline at the swatch's outer tip, not on the swatch body
          const ex = blended ? sx + [200, 250, 300][i] : sx - [250, 240, 190][i];
          const ey = sy;
          // the hairline leaves from the label's OUTER edge (left edge, or right edge on the second angle),
          // so it runs down the side of the arm and meets each swatch at its tip without crossing another swatch
          const lx = blended ? 905 : 100;
          const ly = (blended ? 300 : 290) + i * 138 + 50;
          const mx = lx + (ex - lx) * p;
          const my = ly + (ey - ly) * p;
          return (
            <g key={i} opacity={Math.min(1, p * 1.5)}>
              <line x1={lx} y1={ly} x2={mx} y2={my} stroke={INK} strokeWidth={1.6} strokeOpacity={0.75} />
              <circle cx={mx} cy={my} r={6} fill="none" stroke={INK} strokeWidth={1.6} opacity={p} />
              <circle cx={mx} cy={my} r={2.2} fill={INK} opacity={p} />
            </g>
          );
        })}
      </svg>
      {SHADES.map((s, i) => {
        const p = fadeIn(t, s.at, 0.45);
        if (p <= 0) return null;
        return (
          <div
            key={s.name}
            style={{
              position: 'absolute',
              left: blended ? undefined : 100,
              right: blended ? 1080 - 905 : undefined,
              top: (blended ? 300 : 290) + i * 138 - 8,
              textAlign: blended ? 'right' : 'left',
              opacity: p,
              transform: `translateX(${(1 - p) * (blended ? 12 : -12)}px)`,
              textShadow: GLOW,
            }}
          >
            <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, letterSpacing: '0.3em', color: INK}}>{s.name}</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, color: INK, opacity: 0.9 * notesOut, height: 44 * Math.max(notesOut, 0.0001)}}>{s.note}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const CompareHeading: React.FC<{t: number}> = ({t}) => {
  if (t < COMPARE_AT || t >= COMPARE_END) return null;
  const a = fadeIn(t, COMPARE_AT + 0.15, 0.6);
  const o = fadeOut(t, COMPARE_END, 0.3);
  return (
    <div style={{position: 'absolute', top: 168, left: 0, width: 1080, textAlign: 'center', opacity: a * o, textShadow: GLOW}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 58, color: INK}}>Three shades, side by side.</div>
      <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 25, letterSpacing: '0.36em', color: INK, marginTop: 6, paddingLeft: '0.36em'}}>VANILLA · LIGHT · NATURAL</div>
    </div>
  );
};

const ProductName: React.FC<{t: number}> = ({t}) => {
  const a = 15.25;
  const b = 19.6;
  if (t < a - 0.1 || t > b + 0.05) return null;
  const p1 = fadeIn(t, a, 0.8);
  const p2 = fadeIn(t, a + 0.45, 0.7);
  const p3 = fadeIn(t, a + 0.9, 0.7);
  const o = fadeOut(t, b, 0.45);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 800, background: 'linear-gradient(rgba(244,236,224,0), rgba(244,236,224,0.88) 40%, rgba(244,236,224,0.94))', opacity: p1}} />
      <div style={{position: 'absolute', top: 1250, left: 0, width: 1080, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 104, letterSpacing: '0.32em', paddingLeft: '0.32em', color: INK, opacity: p1, filter: `blur(${(1 - p1) * 8}px)`}}>NOFA</div>
        <div style={{margin: '6px auto 12px', height: 1.4, width: 150 * p2, background: INK, opacity: 0.6}} />
        <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 27, letterSpacing: '0.34em', paddingLeft: '0.34em', color: INK, opacity: p2}}>CRYSTAL GLOW TINTED SUNSCREEN</div>
        <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 24, letterSpacing: '0.3em', paddingLeft: '0.3em', color: INK, opacity: 0.85 * p3, marginTop: 12}}>SPF 50 · PA++++</div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const a = 23.0;
  if (t < a) return null;
  const p = fadeIn(t, a, 0.9);
  const end = interpolate(frame, [NOFA_FRAMES - 16, NOFA_FRAMES - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <>
      <div style={{position: 'absolute', top: 250, left: 0, width: 1080, textAlign: 'center', opacity: p * (1 - end), textShadow: GLOW, transform: `translateY(${(1 - p) * 12}px)`, filter: `blur(${(1 - p) * 6}px)`}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 76, color: INK}}>Vanilla, Light or Natural?</div>
      </div>
      <AbsoluteFill style={{background: '#F4ECE0', opacity: end}} />
    </>
  );
};

/* ---------------------------------------------------------------- sound: every cue tied to an on-screen action */
type Cue = [number, string, number];
const CUES: Cue[] = [
  [0.0, 'n_air', 0.18], //       open
  [0.2, 'n_handle', 0.45], //    tubes in hand
  [0.3, 'n_chime', 0.16], //     title reveal
  [1.53, 'n_handle', 0.4], //    tubes turned around
  [2.37, 'n_click', 0.35],
  [4.33, 'n_air', 0.14],
  [4.75, 'n_creamy', 0.55], //   Vanilla dab
  [5.25, 'n_swipe', 0.5], //     spread
  [5.9, 'n_pop', 0.4], //        label
  [7.93, 'n_air', 0.1],
  [8.0, 'n_creamy', 0.55], //    Light dab
  [8.45, 'n_swipe', 0.5],
  [8.3, 'n_pop', 0.4],
  [9.1, 'n_creamy', 0.55], //    Natural dab
  [9.55, 'n_swipe', 0.5],
  [9.35, 'n_pop', 0.4],
  [10.45, 'n_shutter', 0.3], //  side-by-side
  [13.03, 'n_air', 0.14],
  [14.93, 'n_handle', 0.45],
  [15.25, 'n_chime', 0.18], //   NOFA
  [16.97, 'n_click', 0.3],
  [19.7, 'n_handle', 0.35],
  [21.83, 'n_air', 0.12],
  [22.05, 'n_squeeze', 0.7], //  product starts to emerge
  [22.8, 'n_creamy', 0.45],
  [23.35, 'n_squeeze', 0.6],
  [24.1, 'n_creamy', 0.4],
  [23.0, 'n_chime', 0.14], //    outro text
];

const Sound: React.FC = () => (
  <>
    <Audio
      src={staticFile('audio/n_music.wav')}
      volume={(f) => 0.34 * interpolate(f, [0, 12, NOFA_FRAMES - 30, NOFA_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    {CUES.map(([at, name, v], i) => (
      <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={60} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

export const NofaEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#F4ECE0'}}>
      <Plate />
      <Title t={t} />
      <ShadeLabels t={t} frame={frame} />
      <CompareHeading t={t} />
      <ProductName t={t} />
      <Outro t={t} frame={frame} />
      <Sound />
    </AbsoluteFill>
  );
};
