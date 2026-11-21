import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {A_CUTS, DISSOLVE, ORIGIN, zoomAt} from './camera';
import captions from './captions.json';
import {Captions} from './Captions';
import {Overlays, SPRAY_SFX_B} from './Overlays';
import {A_FRAMES, A_SEC, B_FRAMES, C, DURATION_IN_FRAMES, FPS, sec} from './theme';

const video = (file: string) => (
  <OffthreadVideo src={staticFile(`hyalumelon/${file}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
);

/** Original footage, untouched colours, with a smooth camera zoom applied on top. */
const Shot: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{transform: `scale(${zoomAt(t).toFixed(5)})`, transformOrigin: ORIGIN}}>
    <Sequence durationInFrames={A_FRAMES} layout="none">{video('src1.mp4')}</Sequence>
    <Sequence from={A_FRAMES} durationInFrames={B_FRAMES} layout="none">{video('src2.mp4')}</Sequence>
  </AbsoluteFill>
);

const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const cut = A_CUTS.map((c) => sec(c)).find((c) => frame >= c && frame < c + DISSOLVE);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Shot t={frame / FPS} />
      {cut !== undefined && (
        // soft dissolve over part-A shot changes: hold the outgoing frame and fade it away
        <AbsoluteFill style={{opacity: 1 - (frame - cut + 1) / (DISSOLVE + 1)}}>
          <Freeze frame={cut - 1}>
            <Shot t={(cut - 1) / FPS} />
          </Freeze>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------- audio: voice on top, music ducked under speech, light SFX ---------- */
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
    const W = 12;
    for (let f = 0; f < n; f++) {
      let s = 0;
      let k = 0;
      for (let j = f - W; j <= f + W; j++) if (j >= 0 && j < n) (s += speaking[j]), k++;
      const sp = s / k;
      const partB = interpolate(f, [A_FRAMES - 10, A_FRAMES + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      // ~-22 dB under the voice, a little up in pauses, full-ish bed in the no-speech demo part
      vol[f] = (0.07 * sp + 0.13 * (1 - sp)) * (1 - partB) + 0.6 * partB;
    }
    return vol;
  }, []);

type Sfx = [number, string, number];
const B = (t: number) => A_SEC + t;
const SFX: Sfx[] = [
  [0.12, 'sparkle', 0.16],
  [2.8, 'bloop', 0.12],
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => [5.0 + (i * 4) / 30, 'pop', 0.07] as Sfx),
  [7.4, 'boing', 0.12],
  [12.1, 'bloop', 0.12],
  [13.6, 'bloop', 0.12],
  [16.0, 'oops', 0.12],
  [19.65, 'whoosh', 0.1],
  [20.6, 'sparkle', 0.13],
  [22.45, 'sparkle', 0.15],
  [24.15, 'pop', 0.1],
  [24.55, 'spray', 0.16],
  [26.35, 'whoosh', 0.08],
  [27.2, 'spray', 0.12],
  [28.12, 'pop', 0.08],
  [28.6, 'pop', 0.08],
  [30.42, 'bloop', 0.09],
  [30.98, 'bloop', 0.09],
  [31.56, 'bloop', 0.09],
  [33.4, 'pop', 0.1],
  [34.6, 'pop', 0.08],
  [34.98, 'pop', 0.1],
  [40.6, 'whoosh', 0.08],
  [40.9, 'ding', 0.1],
  [42.2, 'boing', 0.09],
  [43.0, 'pop', 0.07],
  [44.4, 'sparkle', 0.12],
  [45.15, 'whoosh', 0.13],
  [45.45, 'sparkle', 0.15],
  [B(0.25), 'pop', 0.14],
  ...SPRAY_SFX_B.map((t) => [B(t), 'spray', 0.22] as Sfx),
  [B(3.45), 'sparkle', 0.14],
  [B(4.3), 'pop', 0.14],
  [B(6.5), 'bloop', 0.15],
  [B(7.9), 'whoosh', 0.12],
  ...[8.3, 8.95, 9.6, 10.25, 10.9].map((t) => [B(t + 0.1), 'tick', 0.2] as Sfx),
  [B(11.6), 'ding', 0.16],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Sequence durationInFrames={A_FRAMES} layout="none">
        <Audio src={staticFile('hyalumelon/audio/voice.wav')} volume={1} />
      </Sequence>
      <Audio
        src={staticFile('hyalumelon/audio/music.wav')}
        volume={(f) => vol[Math.min(f, vol.length - 1)] * interpolate(f, [DURATION_IN_FRAMES - 40, DURATION_IN_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      {SFX.map(([t, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(t))} durationInFrames={45} layout="none">
          <Audio src={staticFile(`hyalumelon/audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, DURATION_IN_FRAMES - 14, DURATION_IN_FRAMES], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: C.cream, opacity: o * 0.92}} />;
};

export const HyalumelonEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Camera />
    <Overlays />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
