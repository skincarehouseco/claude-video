import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Camera, CutFlash} from './Camera';
import captions from './captions.json';
import {Captions} from './Captions';
import {Graphics} from './Graphics';
import {clamp, DURATION_IN_FRAMES, sec} from './theme';

/* ---------- music bed, ducked well under her voice ---------- */
type Chunk = {words: {start: number; end: number}[]};
const useMusicVolume = () =>
  useMemo(() => {
    const n = DURATION_IN_FRAMES + 30;
    const speaking = new Array(n).fill(0);
    (captions as Chunk[]).forEach((c) =>
      c.words.forEach((w) => {
        for (let f = sec(w.start - 0.15); f <= sec(w.end + 0.25); f++) if (f >= 0 && f < n) speaking[f] = 1;
      }),
    );
    const vol = new Array(n).fill(0);
    const W = 10; // ~0.33 s smoothing
    for (let f = 0; f < n; f++) {
      let s = 0;
      let k = 0;
      for (let j = f - W; j <= f + W; j++) if (j >= 0 && j < n) (s += speaking[j]), k++;
      const sp = s / k;
      vol[f] = 0.06 * sp + 0.14 * (1 - sp); // ~-24 dB under speech, lifts a little in pauses
    }
    return vol;
  }, []);

// [time s, sfx, volume] — soft, never over her voice
const SFX: [number, string, number][] = [
  [0.25, 'sparkle', 0.16],
  [1.75, 'pop', 0.12],
  [4.12, 'pop', 0.13],
  [4.76, 'oops', 0.12],
  [5.2, 'pop', 0.1],
  [5.82, 'pop', 0.1],
  [6.4, 'pop', 0.1],
  [6.72, 'whoosh', 0.12],
  [7.6, 'pop', 0.12],
  [8.72, 'pop', 0.12],
  [9.75, 'boing', 0.1],
  [12.15, 'sparkle', 0.12],
  [13.38, 'pop', 0.09],
  [13.88, 'pop', 0.09],
  [14.7, 'pop', 0.1],
  [15.42, 'pop', 0.12],
  [16.22, 'boing', 0.12],
  [16.3, 'whoosh', 0.1],
  [17.3, 'ding', 0.12],
  [19.0, 'pop', 0.1],
  [21.5, 'whoosh', 0.14],
  [21.8, 'sparkle', 0.1],
  [22.74, 'pop', 0.12],
  [23.2, 'pop', 0.12],
  [23.58, 'pop', 0.12],
  [25.48, 'ding', 0.11],
  [26.2, 'whoosh', 0.14],
  [27.55, 'oops', 0.11],
  [28.85, 'sparkle', 0.14],
  [31.0, 'pop', 0.1],
  [31.78, 'boing', 0.1],
  [33.1, 'ding', 0.12],
  [33.15, 'sparkle', 0.1],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Audio src={staticFile('v2/voice.wav')} volume={1} />
      <Audio
        src={staticFile('v2/music.wav')}
        volume={(f) =>
          vol[Math.min(f, vol.length - 1)] *
          interpolate(f, [0, 12, DURATION_IN_FRAMES - 24, DURATION_IN_FRAMES], [0, 1, 1, 0], clamp)
        }
      />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={45} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

/* ---------- soft cream fade in / out ---------- */
const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 7, DURATION_IN_FRAMES - 9, DURATION_IN_FRAMES - 1], [1, 0, 0, 1], clamp);
  return <AbsoluteFill style={{background: '#FFF6EC', opacity: o * 0.9}} />;
};

export const SkipcareEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Camera />
    <CutFlash />
    <Graphics />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
