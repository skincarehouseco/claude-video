import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {cameraTransform, CUT_FRAMES, DISSOLVE_FRAMES, dissolveOpacity, ORIGIN} from './camera';
import captions from './captions.json';
import {Captions} from './Captions';
import {Overlays, SECTION_CUTS} from './Overlays';
import {DURATION_IN_FRAMES, FPS, sec, SPEED, srcTime} from './theme';

/* ------------ camera: graded footage, smooth zooms, soft dissolves over jump cuts ------------ */
const Footage: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{transform: cameraTransform(t), transformOrigin: ORIGIN}}>
    {/* original footage colours (no grade); scripts/grade.py can produce a graded version if wanted */}
    <OffthreadVideo src={staticFile('main.mp4')} playbackRate={SPEED} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);

const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const t = srcTime(frame);
  // jump cuts mapped to composition frames
  const cut = CUT_FRAMES.map((c) => Math.round(c / SPEED)).find((c) => frame >= c && frame < c + DISSOLVE_FRAMES);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Footage t={t} />
      {cut !== undefined && (
        // hold the last frame of the outgoing shot and dissolve it away -> no hard jump
        <AbsoluteFill style={{opacity: dissolveOpacity(frame - cut)}}>
          <Freeze frame={cut - 1}>
            <Footage t={srcTime(cut - 1)} />
          </Freeze>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ------------ audio: music bed ducked under speech + SFX ------------ */
type Chunk = {start: number; end: number; words: {start: number; end: number}[]};
const useMusicVolume = () =>
  useMemo(() => {
    const n = DURATION_IN_FRAMES;
    const speaking = new Array(n).fill(0);
    (captions as Chunk[]).forEach((c) =>
      c.words.forEach((w) => {
        for (let f = sec(w.start - 0.15); f <= sec(w.end + 0.25); f++) {
          if (f >= 0 && f < n) speaking[f] = 1;
        }
      }),
    );
    // smooth the ducking envelope (~0.4s attack/release)
    const vol = new Array(n).fill(0);
    const W = 12;
    for (let f = 0; f < n; f++) {
      let s = 0;
      let k = 0;
      for (let j = f - W; j <= f + W; j++) {
        if (j >= 0 && j < n) {
          s += speaking[j];
          k++;
        }
      }
      const sp = s / k;
      vol[f] = 0.075 * sp + 0.16 * (1 - sp); // ~-22 dB under voice, rises gently in pauses
    }
    return vol;
  }, []);

type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0.15, 'sparkle', 0.22],
  [0.35, 'pop', 0.18],
  [6.35, 'whoosh', 0.14],
  ...SECTION_CUTS.map((s) => [s - 0.35, 'whoosh', 0.15] as Sfx),
  [11.55, 'pop', 0.2],
  [11.85, 'pop', 0.16],
  [18.75, 'oops', 0.2],
  [21.45, 'sparkle', 0.18],
  [21.7, 'pop', 0.18],
  [24.1, 'whoosh', 0.14],
  [24.25, 'sparkle', 0.16],
  [24.45, 'pop', 0.16],
  [25.3, 'sparkle', 0.1],
  [27.55, 'pop', 0.2],
  [27.85, 'pop', 0.16],
  [31.2, 'ding', 0.2],
  [32.9, 'sparkle', 0.14],
  [35.8, 'pop', 0.14],
  [39.65, 'pop', 0.2],
  [39.95, 'pop', 0.16],
  [41.25, 'oops', 0.2],
  [44.2, 'pop', 0.13],
  [45.85, 'pop', 0.13],
  [47.6, 'pop', 0.2],
  [47.9, 'pop', 0.16],
  [50.2, 'ding', 0.2],
  [52.35, 'pop', 0.13],
  [53.6, 'pop', 0.13],
  [55.8, 'pop', 0.2],
  [58.0, 'boing', 0.17],
  [60.3, 'pop', 0.13],
  [64.1, 'sparkle', 0.13],
  [66.2, 'pop', 0.14],
  [70.25, 'pop', 0.16],
  [73.85, 'whoosh', 0.14],
  [74.0, 'sparkle', 0.22],
  [74.05, 'ding', 0.17],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Audio src={staticFile('audio/voice.wav')} volume={1} playbackRate={SPEED} />
      <Audio src={staticFile('audio/music.wav')} volume={(f) => vol[Math.min(f, vol.length - 1)] * interpolate(f, [DURATION_IN_FRAMES - 45, DURATION_IN_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={48} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

/* ------------ fade in/out ------------ */
const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, DURATION_IN_FRAMES - 12, DURATION_IN_FRAMES], [1, 0, 0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{background: '#FFF6EC', opacity: o * 0.9}} />;
};

export const WhimsyEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Camera />
    <Overlays />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
