import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Camera} from './Camera';
import {Captions} from './Captions';
import {BENEFIT_FRAMES, Graphics} from './Graphics';
import {DURATION} from './theme';

// [frame, sound, volume] – SFX sit well under the original music so nothing feels noisy
const SFX: [number, string, number][] = [
  [4, 'sparkle', 0.16],
  [6, 'pop', 0.14],
  [40, 'whoosh', 0.07],
  [78, 'pop', 0.13],
  [96, 'whoosh', 0.12],
  [104, 'pop', 0.13],
  [150, 'pop', 0.13],
  [188, 'whoosh', 0.11],
  [198, 'boing', 0.12],
  [200, 'sparkle', 0.1],
  [237, 'whoosh', 0.11],
  [272, 'ding', 0.12],
  [284, 'sparkle', 0.1],
  ...BENEFIT_FRAMES.map((fr) => [fr, 'pop', 0.11] as [number, string, number]),
  [338, 'sparkle', 0.12],
];

const AudioMix: React.FC = () => (
  <>
    {/* the clip's own soundtrack, kept as the main bed, with a soft fade at the very end */}
    <Audio
      src={staticFile('toner/music.wav')}
      volume={(f) => 0.92 * interpolate(f, [DURATION - 12, DURATION], [1, 0.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    {SFX.map(([at, name, v], i) => (
      <Sequence key={i} from={at} durationInFrames={45} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, DURATION - 8, DURATION], [0.9, 0, 0, 0.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#FFF8EC', opacity: o}} />;
};

export const MistToner: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Camera />
    <Graphics />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
