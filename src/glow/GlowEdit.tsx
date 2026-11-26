import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {Captions} from './Captions';
import {BackgroundLayer, BehindLayer, BrollLayer, FrontLayer} from './Scenes';
import {Subject} from './Subject';
import {DURATION, sec} from './theme';

type Chunk = {words: {start: number; end: number}[]};
/** music ducked under speech, rising gently in pauses */
const useMusicVolume = () =>
  useMemo(() => {
    const n = DURATION;
    const sp = new Array(n).fill(0);
    (captions as Chunk[]).forEach((c) =>
      c.words.forEach((w) => {
        for (let f = sec(w.start - 0.15); f <= sec(w.end + 0.25); f++) if (f >= 0 && f < n) sp[f] = 1;
      }),
    );
    return sp.map((_, f) => {
      let s = 0;
      let k = 0;
      for (let j = f - 12; j <= f + 12; j++) if (j >= 0 && j < n) (s += sp[j]), k++;
      const v = s / k;
      return 0.08 * v + 0.17 * (1 - v);
    });
  }, []);

type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0.1, 'sparkle', 0.2],
  [1.9, 'pop', 0.2],
  [1.95, 'sparkle', 0.14],
  [2.78, 'pop', 0.16],
  [3.35, 'whoosh', 0.16],
  [3.92, 'sparkle', 0.12],
  [5.1, 'pop', 0.14],
  [5.3, 'pop', 0.12],
  [7.04, 'ding', 0.12],
  [7.75, 'swoosh', 0.22],
  [9.3, 'sparkle', 0.14],
  [9.95, 'whoosh', 0.14],
  [11.3, 'pop', 0.2],
  [12.96, 'pop', 0.14],
  [13.2, 'sparkle', 0.12],
  [14.6, 'whoosh', 0.14],
  [15.3, 'pop', 0.14],
  [16.5, 'pop', 0.14],
  [18.2, 'pop', 0.14],
  [19.9, 'sparkle', 0.12],
  [20.65, 'whoosh', 0.13],
  [21.94, 'pop', 0.2],
  [21.95, 'sparkle', 0.15],
  [22.25, 'whoosh', 0.15],
  [23.2, 'click', 0.35],
  [24.92, 'pop', 0.14],
  [25.9, 'pop', 0.14],
  [26.55, 'pop', 0.12],
  [26.7, 'pop', 0.14],
  [27.9, 'swoosh', 0.22],
  [28.4, 'sparkle', 0.1],
  [29.4, 'whoosh', 0.1],
  [30.0, 'pop', 0.1],
  [30.28, 'pop', 0.1],
  [30.56, 'pop', 0.12],
  [30.84, 'pop', 0.1],
  [31.75, 'swoosh', 0.18],
  [33.42, 'pop', 0.14],
  [34.86, 'pop', 0.14],
  [36.36, 'pop', 0.14],
  [36.7, 'whoosh', 0.14],
  [37.46, 'pop', 0.2],
  [37.5, 'sparkle', 0.16],
  [38.6, 'ding', 0.16],
  [39.2, 'sparkle', 0.14],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Audio src={staticFile('glow/voice.wav')} volume={1} />
      <Audio
        src={staticFile('glow/music.wav')}
        volume={(f) => vol[Math.min(f, vol.length - 1)] * interpolate(f, [DURATION - 40, DURATION], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={45} layout="none">
          <Audio src={staticFile(`glow/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 7, DURATION - 16, DURATION], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#FFF6EF', opacity: o}} />;
};

export const GlowEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#FBF3E8'}}>
    <BackgroundLayer />
    <BehindLayer />
    <Subject />
    <FrontLayer />
    <BrollLayer />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
