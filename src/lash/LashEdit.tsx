import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {camera} from './camera';
import {Graphics, TrackedStickers} from './Graphics';
import {f2t, LASH_FRAMES, t2f} from './timeline';

/* footage with smooth zooms + zoom-through transitions; stickers ride along with the camera */
const Camera: React.FC = () => {
  const t = f2t(useCurrentFrame());
  const cam = camera(t);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill
        style={{
          transform: `scale(${cam.scale.toFixed(5)})`,
          transformOrigin: cam.origin,
          filter: cam.blur > 0.05 ? `blur(${cam.blur.toFixed(2)}px)` : undefined,
        }}
      >
        <OffthreadVideo src={staticFile('lash/main.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <TrackedStickers />
      </AbsoluteFill>
      {/* soft pastel flash on section transitions */}
      {cam.flash > 0.01 && <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFFBEA 0%, #FFD8E4 70%)', opacity: cam.flash}} />}
    </AbsoluteFill>
  );
};

/* original song stays the main audio; SFX are kept quiet underneath it */
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0.08, 'pop', 0.13],
  [0.3, 'sparkle', 0.1],
  [0.55, 'boing', 0.08],
  [1.47, 'whoosh', 0.13],
  [1.75, 'pop', 0.11],
  [2.0, 'pop', 0.06],
  [2.4, 'pop', 0.06],
  [2.8, 'pop', 0.06],
  [3.2, 'pop', 0.06],
  [4.06, 'ding', 0.1],
  [6.1, 'whoosh', 0.13],
  [6.38, 'pop', 0.11],
  [6.6, 'pop', 0.06],
  [6.95, 'pop', 0.06],
  [7.3, 'pop', 0.06],
  [7.65, 'pop', 0.06],
  [8.2, 'ding', 0.1],
  [8.97, 'whoosh', 0.13],
  [9.3, 'sparkle', 0.11],
  [9.9, 'pop', 0.1],
  [12.1, 'sparkle', 0.08],
];

const AudioMix: React.FC = () => (
  <>
    <Audio
      src={staticFile('lash/song.wav')}
      volume={(f) => 0.92 * interpolate(f, [LASH_FRAMES - 10, LASH_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    {SFX.map(([at, name, v], i) => (
      <Sequence key={i} from={t2f(at)} durationInFrames={45} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, LASH_FRAMES - 10, LASH_FRAMES], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#FFF6EC', opacity: o * 0.9}} />;
};

export const LashEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Camera />
    <Graphics />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
