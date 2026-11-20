import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {camera} from './camera';
import captions from './captions.json';
import {Captions} from './Captions';
import {Graphics} from './Graphics';
import {clamp, DURATION_IN_FRAMES, sec} from './theme';

/* ------------ footage: original colours, smooth face-centred zooms ------------ */
const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill style={camera(frame)}>
        <OffthreadVideo src={staticFile('hydration/main.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------ audio: clean voice on top, music ducked under speech, light SFX ------------ */
type Chunk = {words: {start: number; end: number}[]};
const useMusicVolume = () =>
  useMemo(() => {
    const n = DURATION_IN_FRAMES;
    const speaking = new Array(n).fill(0);
    (captions as Chunk[]).forEach((c) =>
      c.words.forEach((w) => {
        for (let f = sec(w.start - 0.12); f <= sec(w.end + 0.2); f++) if (f >= 0 && f < n) speaking[f] = 1;
      }),
    );
    const vol = new Array(n).fill(0);
    const W = 10; // ~0.33 s smoothing for the duck
    for (let f = 0; f < n; f++) {
      let s = 0;
      let k = 0;
      for (let j = f - W; j <= f + W; j++) if (j >= 0 && j < n) (s += speaking[j]), k++;
      const sp = s / k;
      vol[f] = 0.085 * sp + 0.2 * (1 - sp);
    }
    return vol;
  }, []);

const SFX: [number, string, number][] = [
  [0.2, 'twinkle', 0.16],
  [0.32, 'pop', 0.14],
  // each sign: airy whoosh into a water-drop bloop
  ...[3.72, 8.15, 11.5, 15.13, 18.78].flatMap((b) => [
    [b - 0.16, 'whoosh', 0.1] as [number, string, number],
    [b + 0.02, 'drop', 0.16] as [number, string, number],
  ]),
  [5.68, 'pop', 0.1], // "tight" squeeze
  [10.3, 'twinkle', 0.12], // magnify fine lines
  [14.05, 'sleepy', 0.08], // "penat"
  [17.44, 'crack', 0.16], // "crack"
  [21.3, 'twinkle', 0.12], // oily shine
  [23.35, 'pop', 0.1], // "?"
  [24.0, 'whoosh', 0.1],
  [24.3, 'pop', 0.11],
  [24.45, 'pop', 0.1],
  [24.6, 'pop', 0.11],
  [24.75, 'pop', 0.1],
  [25.15, 'ding', 0.12],
  [25.2, 'twinkle', 0.1],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Audio src={staticFile('hydration/voice.wav')} volume={1} />
      <Audio
        src={staticFile('hydration/music.wav')}
        volume={(f) => vol[Math.min(f, vol.length - 1)] * interpolate(f, [DURATION_IN_FRAMES - 30, DURATION_IN_FRAMES], [1, 0], clamp)}
      />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={40} layout="none">
          <Audio src={staticFile(`hydration/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

/* ------------ soft cream fade in/out ------------ */
const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 7, DURATION_IN_FRAMES - 9, DURATION_IN_FRAMES], [1, 0, 0, 1], clamp);
  return <AbsoluteFill style={{background: '#FFF8EA', opacity: o * 0.85}} />;
};

export const HydrationEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Footage />
    <Graphics />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
