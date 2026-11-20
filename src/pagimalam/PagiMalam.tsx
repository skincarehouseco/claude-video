import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {Captions} from './Captions';
import {Graphics, SECTION_STARTS, SECTIONS} from './Graphics';
import {DURATION, FPS, fr} from './theme';

/* ================= camera ================= */
// jump cuts in the original footage (ffmpeg scene detection), seconds
const CUTS = [1.967, 7.267, 9.2, 12.667, 13.767, 19.467, 20.767, 27.3, 33.4, 34.3, 49.533, 51.1, 55.8];
const EDGES = [0, ...CUTS, 59.9];
const ease = Easing.inOut(Easing.cubic);
const c01 = (x: number) => Math.min(1, Math.max(0, x));

// smooth push-ins on key words: [start, end, scale]
const EMPHASIS: [number, number, number][] = [
  [2.34, 3.1, 1.1], // "korang tahu tak?"
  [10.7, 12.4, 1.07], // "highly recommend waktu pagi"
  [21.04, 22.7, 1.08], // "works 24/7"
  [31.2, 32.7, 1.06], // "support your skin barrier"
  [38.94, 41.9, 1.08], // "lebih sensitif ... cahaya matahari"
  [48.38, 49.3, 1.07], // "jadi lebih sensitif"
  [54.06, 55.3, 1.06], // "exfoliating ingredient"
];

const zoomAt = (t: number) => {
  let i = 0;
  while (i < EDGES.length - 2 && t >= EDGES[i + 1]) i++;
  const u = c01((t - EDGES[i]) / (EDGES[i + 1] - EDGES[i]));
  // each shot drifts slowly in or out by 4% so scale stays continuous over jump cuts
  let z = i % 2 === 0 ? 1 + 0.04 * ease(u) : 1.04 - 0.04 * ease(u);
  if (t >= 55.8) z = 1 + 0.06 * ease(c01((t - 55.8) / 4.1)); // slow outro push-in
  for (const [s, e, k] of EMPHASIS) {
    if (t > s - 0.01 && t < e + 0.9) z *= 1 + (k - 1) * ease(c01((t - s) / 0.5)) * (1 - ease(c01((t - e) / 0.9)));
  }
  // opening: start punched-in and ease out to reveal the frame
  z *= 1 + 0.12 * (1 - ease(c01(t / 1.6)));
  // each new ingredient: a gentle zoom "breath" (out then back)
  for (const s of SECTION_STARTS) {
    const k = (t - s) / 0.7;
    if (k > 0 && k < 1) z *= 1 - 0.03 * Math.sin(k * Math.PI);
  }
  // never go below 1.0 (would reveal black borders)
  return Math.max(1.001, z * 1.03);
};

const Footage: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{transform: `scale(${zoomAt(t).toFixed(5)})`, transformOrigin: '50% 42%'}}>
    <OffthreadVideo src={staticFile('pagimalam/main.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);

const DISSOLVE = 5;
const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const cut = CUTS.map(fr).find((c) => frame >= c && frame < c + DISSOLVE);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Footage t={frame / FPS} />
      {cut !== undefined && (
        // hold the outgoing shot's last frame and dissolve it away so jump cuts feel smooth
        <AbsoluteFill style={{opacity: 1 - interpolate(frame - cut, [0, DISSOLVE], [0, 1], {easing: Easing.inOut(Easing.sin), extrapolateRight: 'clamp'})}}>
          <Freeze frame={cut - 1}>
            <Footage t={(cut - 1) / FPS} />
          </Freeze>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ================= audio: clear voice, ducked music bed, soft SFX ================= */
type Chunk = {words: {start: number; end: number}[]};
const useMusicVolume = () =>
  useMemo(() => {
    const speaking = new Array(DURATION).fill(0);
    (captions as Chunk[]).forEach((c) =>
      c.words.forEach((w) => {
        for (let f = fr(w.start - 0.15); f <= fr(w.end + 0.25); f++) if (f >= 0 && f < DURATION) speaking[f] = 1;
      }),
    );
    const vol = new Array(DURATION).fill(0);
    const W = 12;
    for (let f = 0; f < DURATION; f++) {
      let s = 0;
      let k = 0;
      for (let j = Math.max(0, f - W); j <= Math.min(DURATION - 1, f + W); j++) {
        s += speaking[j];
        k++;
      }
      const sp = s / k;
      vol[f] = 0.055 * sp + 0.13 * (1 - sp); // ~-24 dB under speech, lifts gently in pauses
    }
    return vol;
  }, []);

type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0.0, 'sparkle', 0.2],
  [0.05, 'pop', 0.15],
  [1.1, 'pop', 0.14],
  [2.36, 'boing', 0.14],
  [3.2, 'sparkle', 0.1],
  [5.6, 'pop', 0.1],
  [6.74, 'pop', 0.1],
  ...SECTION_STARTS.map((s) => [s - 0.12, 'whoosh', 0.13] as Sfx),
  ...SECTIONS.flatMap((d): Sfx[] => {
    const out: Sfx[] = [[d.nameAt + 0.05, 'sparkle', 0.1], [d.chip.at, 'pop', 0.13]];
    for (const s of [d.pagi, d.malam]) {
      if (s.mark === 'check') out.push([s.at, 'ding', 0.09]);
      if (s.mark === 'cross') out.push([s.at, 'oops', 0.14]);
      if (s.star !== undefined) out.push([s.star, 'sparkle', 0.1]);
      if (s.warn !== undefined) out.push([s.warn, 'boing', 0.1]);
    }
    return out;
  }),
  [55.55, 'whoosh', 0.12],
  [55.68, 'sparkle', 0.14],
  [56.3, 'pop', 0.12],
  [58.74, 'ding', 0.13],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Audio src={staticFile('pagimalam/voice.wav')} volume={1} />
      <Audio
        src={staticFile('audio/music.wav')}
        volume={(f) =>
          vol[Math.min(f, DURATION - 1)] *
          interpolate(f, [0, 10, DURATION - 40, DURATION], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
        }
      />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, fr(at))} durationInFrames={45} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

/* ================= open / close fades ================= */
const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, DURATION - 12, DURATION], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#FFF7EC', opacity: o * 0.9}} />;
};

export const PagiMalam: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Camera />
    <Graphics />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
