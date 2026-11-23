import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {Captions} from './Captions';
import {Footage, SHOTS} from './Footage';
import {Graphics} from './Graphics';
import {DURATION_IN_FRAMES, f} from './theme';

/* ------------ music bed: ducked under the voice so speech stays clear ------------ */
type Chunk = {words: {start: number; end: number}[]};
const useMusicVolume = () =>
  useMemo(() => {
    const n = DURATION_IN_FRAMES;
    const speaking = new Array(n).fill(0);
    (captions as Chunk[]).forEach((c) =>
      c.words.forEach((w) => {
        for (let k = f(w.start - 0.2); k <= f(w.end + 0.3); k++) if (k >= 0 && k < n) speaking[k] = 1;
      }),
    );
    const W = 10; // ~0.33 s smoothing -> no pumping
    return speaking.map((_, i) => {
      let s = 0;
      let c = 0;
      for (let j = i - W; j <= i + W; j++) if (j >= 0 && j < n) (s += speaking[j]), c++;
      const sp = s / c;
      return 0.06 * sp + 0.12 * (1 - sp); // ~-24 dB under voice, lifts gently in pauses
    });
  }, []);

type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0.05, 'sparkle', 0.14],
  [0.3, 'pop', 0.12],
  [1.35, 'pop', 0.1],
  [3.5, 'pop', 0.1],
  [3.7, 'pop', 0.08],
  [8.3, 'sparkle', 0.12],
  [9.26, 'pop', 0.09],
  [12.18, 'boing', 0.13],
  [12.99, 'pop', 0.1],
  [13.2, 'pop', 0.08],
  [17.78, 'sparkle', 0.1],
  [18.65, 'pop', 0.07],
  [19.29, 'pop', 0.07],
  [20.67, 'pop', 0.08],
  [21.49, 'ding', 0.1],
  [22.6, 'sparkle', 0.1],
  [25.0, 'pop', 0.1],
  [33.88, 'sparkle', 0.1],
  [48.37, 'pop', 0.1],
  [49.0, 'ding', 0.11],
  [51.07, 'pop', 0.09],
  [53.53, 'sparkle', 0.12],
  [54.3, 'ding', 0.09],
  // soft whooshes on the main section changes
  ...[3.15, 7.05, 12.15, 14.05, 17.3, 22.45, 24.85, 46.6, 50.0, 52.6].map((s) => [s - 0.18, 'whoosh', 0.07] as Sfx),
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  const fadeOut = (fr: number) => interpolate(fr, [DURATION_IN_FRAMES - 30, DURATION_IN_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = (fr: number) => interpolate(fr, [0, 12], [0.4, 1], {extrapolateRight: 'clamp'});
  return (
    <>
      <Audio src={staticFile('audio/voice.wav')} volume={1} />
      <Audio src={staticFile('audio/music.wav')} volume={(fr) => vol[Math.min(fr, vol.length - 1)] * fadeOut(fr) * fadeIn(fr)} />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} durationInFrames={45} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

/* ------------ soft dreamy flash on the big section changes (whimsy transition) ------------ */
const FLASH_AT = [3.15, 12.15, 24.85, 46.6, 52.6];
const Flash: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const o = Math.max(0, ...FLASH_AT.map((s) => interpolate(t, [s - 0.12, s, s + 0.3], [0, 0.35, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const fadeEnd = interpolate(t, [(DURATION_IN_FRAMES - 10) / 30, DURATION_IN_FRAMES / 30], [0, 0.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #fff8fb 0%, #ffe3f0 70%)', opacity: Math.max(o, fadeEnd), mixBlendMode: 'screen'}} />;
};

export const LashEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Footage />
    <Flash />
    <Graphics />
    <Captions />
    <AudioMix />
  </AbsoluteFill>
);

export {SHOTS};
