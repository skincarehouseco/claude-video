import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import clipsJson from './clips.json';
import voiceJson from '../../deliverables/facedemo/voice/manifest.json';
import '../booih2/BooihWhimsy'; // BW* fonts

/* Face-demo assembly: generated clips (public/facedemo/clips/Cxx.mp4, made with an image-to-video tool from the
   creator's own portrait) + original Malay voice-over + soft mask sounds + word-synced subtitles.
   A missing clip shows its pose-reference frame as an animatic placeholder so timing can be checked early. */

const FPS = 30;
export const FD_DURATION = 55 * FPS;
const sec = (s: number) => Math.round(s * FPS);

// shot timeline (matches the reference segment's cut points)
export const SHOTS: {id: string; from: number; to: number; note: string}[] = [
  {id: 'C01', from: 0, to: 3.23, note: 'intro: bowl + spatula, texture'},
  {id: 'C02', from: 3.23, to: 12.0, note: 'scoop, first layer on right cheek'},
  {id: 'C03', from: 12.0, to: 21.43, note: 'spreading cheek'},
  {id: 'C04', from: 21.43, to: 25.2, note: 'nose'},
  {id: 'C05', from: 25.2, to: 30.33, note: 'under-eye / upper cheek'},
  {id: 'C06', from: 30.33, to: 37.73, note: 'forehead + other cheek'},
  {id: 'C07', from: 37.73, to: 45.7, note: 'full mask, talking with bowl'},
  {id: 'C08', from: 45.7, to: 50.17, note: 'full mask, finger gesture "10–15 min"'},
  {id: 'C10', from: 50.17, to: 55.0, note: 'clean face (after rinse)'},
];
const clips = clipsJson as Record<string, number>; // id -> clip duration (s); absent = not generated yet

type Word = {w: string; s: number; e: number};
type Line = {id: string; display: string; words?: Word[]; duration?: number};
const LINES = voiceJson as unknown as Line[];
const SLOT: Record<string, number> = {c01: 0.15, c02: 3.4, c03: 12.1, c04: 21.5, c05: 25.3, c06: 30.4, c07: 37.8, c08: 45.8, c10: 51.4};

const Shot: React.FC<{id: string; len: number}> = ({id, len}) => {
  const f = useCurrentFrame();
  const d = clips[id];
  if (d) {
    const rate = d >= len ? 1 : d / len; // fit a slightly short clip by slowing it a touch
    return <OffthreadVideo src={staticFile(`facedemo/clips/${id}.mp4`)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  }
  return (
    <AbsoluteFill style={{background: '#2a1f18'}}>
      <Img src={staticFile(`facedemo/pose/${id}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.5) blur(22px)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: 'BWNunito', fontWeight: 900, color: '#fff', fontSize: 64, textAlign: 'center'}}>
        {id}
        <div style={{fontSize: 34, fontWeight: 700, opacity: 0.85, marginTop: 12}}>{SHOTS.find((s) => s.id === id)?.note}</div>
        <div style={{fontSize: 28, opacity: 0.6, marginTop: 10}}>clip belum ada · animatic {Math.round(f / FPS * 10) / 10}s</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** word-synced subtitles, ≤5 words per chunk, words appear when spoken */
const Subs: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  for (const l of LINES) {
    const at = SLOT[l.id];
    if (at === undefined || !l.words?.length) continue;
    const ws = l.words.map((w) => ({...w, s: w.s + at, e: w.e + at}));
    if (t < ws[0].s - 0.05 || t > ws[ws.length - 1].e + 0.5) continue;
    const chunks: (typeof ws)[] = [];
    let cur: typeof ws = [];
    for (const w of ws) {
      cur.push(w);
      if (cur.length >= 5 || /[.,!?]$/.test(w.w)) {
        chunks.push(cur);
        cur = [];
      }
    }
    if (cur.length) chunks.push(cur);
    const ch = chunks.find((c, i) => t <= (chunks[i + 1] ? chunks[i + 1][0].s - 0.02 : c[c.length - 1].e + 0.5)) ?? chunks[chunks.length - 1];
    return (
      <div style={{position: 'absolute', top: 1260, left: 90, width: 900, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12}}>
        {ch.map((w, i) => (
          <span key={i} style={{fontFamily: 'BWNunito', fontWeight: 800, fontSize: 46, color: '#fff', WebkitTextStroke: '7px rgba(40,25,20,0.85)', paintOrder: 'stroke fill', opacity: t >= w.s - 0.03 ? 1 : 0, lineHeight: 1.25}}>
            {w.w}
          </span>
        ))}
      </div>
    );
  }
  return null;
};

// soft real-world mask sounds, well under the voice
const SFX: [number, string, number][] = [
  [0.9, 'k3_scoop', 0.12], [3.6, 'k3_scoop', 0.14], [5.2, 'k3_spread', 0.1], [7.6, 'k3_spread', 0.1], [10.1, 'k3_spread_short', 0.09],
  [12.6, 'k3_spread', 0.1], [15.3, 'k3_spread', 0.09], [18.4, 'k3_spread_short', 0.09], [21.8, 'k3_spread_short', 0.1], [23.4, 'k3_spread_short', 0.09],
  [25.6, 'k3_scoop', 0.1], [26.8, 'k3_spread_short', 0.08], [30.6, 'k3_spread', 0.1], [33.2, 'k3_spread', 0.1], [35.6, 'k3_spread_short', 0.09],
  [38.4, 'k3_bowl_tap', 0.1], [42.0, 'k3_scoop', 0.08], [50.0, 'k3_swish', 0.14], [50.25, 'k3_waterdrop', 0.08],
];

export const FaceDemo: React.FC<{captions: boolean}> = ({captions}) => {
  const f = useCurrentFrame();
  // C08 -> C10: quick whip transition (the "rinse off" moment), no generated rinse shot needed
  const whip = interpolate(f, [sec(50.0), sec(50.17), sec(50.4)], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: whip > 0 ? `blur(${whip * 30}px)` : undefined, transform: `translateX(${(f < sec(50.17) ? -1 : 1) * whip * 160}px)`}}>
        {SHOTS.map((s) => (
          <Sequence key={s.id} from={sec(s.from)} durationInFrames={sec(s.to) - sec(s.from)}>
            <Shot id={s.id} len={s.to - s.from} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: whip * 0.35}} />
      {captions && <Subs />}
      {LINES.map((l) =>
        SLOT[l.id] === undefined ? null : (
          <Sequence key={l.id} from={sec(SLOT[l.id])} layout="none">
            <Audio src={staticFile(`facedemo/voice/${l.id}.wav`)} volume={1} />
          </Sequence>
        ),
      )}
      {SFX.map(([at, n, v], i) => (
        <Sequence key={i} from={sec(at)} durationInFrames={45} layout="none">
          <Audio src={staticFile(`audio/${n}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
