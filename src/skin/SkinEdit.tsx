import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ORIGIN, SECTION_CUTS, zoomAt} from './camera';
import captions from './captions.json';
import {Captions} from './Captions';
import {Overlays, SECTIONS} from './Overlays';
import {DURATION_IN_FRAMES, FPS, sec} from './theme';

/* ------------ camera: original footage, smooth zooms ------------ */
const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const z = zoomAt(frame / FPS);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z.toFixed(5)})`, transformOrigin: ORIGIN}}>
        <OffthreadVideo src={staticFile('skin/main.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
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
        for (let f = sec(w.start - 0.15); f <= sec(w.end + 0.25); f++) if (f >= 0 && f < n) speaking[f] = 1;
      }),
    );
    const vol = new Array(n).fill(0);
    const W = 12; // ~0.4 s smoothing
    for (let f = 0; f < n; f++) {
      let s = 0;
      let k = 0;
      for (let j = f - W; j <= f + W; j++) if (j >= 0 && j < n) (s += speaking[j]), k++;
      const sp = s / k;
      vol[f] = 0.06 * sp + 0.13 * (1 - sp); // about -24 dB under the voice, a little more in pauses
    }
    return vol;
  }, []);

type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0.3, 'pop', 0.16],
  [1.38, 'pop', 0.16],
  [3.85, 'whoosh', 0.1],
  [4.98, 'boing', 0.12],
  [6.75, 'sparkle', 0.14],
  ...SECTION_CUTS.slice(1).map((c) => [c - 0.3, 'whoosh', 0.12] as Sfx),
  ...SECTIONS.flatMap((s) => [
    [s.tagAt, 'pop', 0.14] as Sfx,
    [s.L.at, 'oops', 0.13] as Sfx,
    [s.R.at, 'ding', 0.12] as Sfx,
  ]),
  [41.4, 'sparkle', 0.15],
  [41.45, 'pop', 0.14],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  const fadeOut = (f: number) => interpolate(f, [DURATION_IN_FRAMES - 40, DURATION_IN_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <Audio src={staticFile('skin/voice.wav')} volume={1} />
      <Audio src={staticFile('audio/music.wav')} volume={(f) => vol[Math.min(f, vol.length - 1)] * fadeOut(f)} />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={45} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

/* ------------ soft cream fade in / out ------------ */
const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, DURATION_IN_FRAMES - 12, DURATION_IN_FRAMES], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#FFF8EE', opacity: o * 0.9}} />;
};

export const SkinEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Camera />
    <Overlays />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
