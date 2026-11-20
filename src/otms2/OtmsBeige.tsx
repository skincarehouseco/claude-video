import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Camera, LightLeak, StudioLight, SwapBloom} from './Camera';
import {Captions} from './Captions';
import {APPEAR, CUT_END, CUT_SHELF, DURATION, P, PAIRS, PHRASES, REMOVE, sec} from './data';
import {EndDoodles, PairBadge, ShelfDoodles, SwapSparkles} from './Doodles';
import {HOOK_CAPTION_PLACE, HookId, HookLayer} from './HookVariants';

/* ------------------------------------------------------------------
   Sound design: the cleaned voice stays dominant (~-15 LUFS); every SFX is mixed
   roughly 18–24 dB under it (volumes 0.05–0.09 on peak-normalised one-shots).
   Soft, grown-up palette: pops, chimes, sparkles, airy whooshes. No music bed.
   ------------------------------------------------------------------ */
type Sx = [number, string, number];
const SFX: Sx[] = [
  [0.03, 'sparkle', 0.06],
  [0.82, 'bubble_pop', 0.045],
  [0.94, 'bubble_pop', 0.045],
  [1.06, 'bubble_pop', 0.045],
  [1.18, 'bubble_pop', 0.045],
  [1.22, 'plink', 0.06],
  [1.45, 'twinkle', 0.04],
  [2.26, 'bubble_pop', 0.06],
  [3.25, 'whoosh', 0.07],
  [3.47, 'twinkle', 0.05],
  ...PHRASES.filter((p) => p.place === 'shelf').map((p): Sx => [p.start, 'bubble_pop', 0.05]),
  ...APPEAR.map((a): Sx => [a, 'sparkle', 0.07]),
  ...APPEAR.map((a): Sx => [a + 0.35, 'whoosh', 0.035]), // pen ring drawn
  ...REMOVE.map((r): Sx => [r, 'whoosh', 0.045]),
  ...PAIRS.map((p): Sx => [p.benefitAt, 'plink', 0.055]),
  [CUT_END - 0.25, 'whoosh', 0.07],
  [22.13, 'twinkle', 0.06],
  [22.56, 'ding', 0.055],
  [23.3, 'sparkle', 0.045],
];
const Sound: React.FC = () => (
  <>
    <Audio src={staticFile('otms/voice.wav')} volume={(f) => interpolate(f, [DURATION - 8, DURATION], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    {SFX.map(([at, name, v], i) => (
      <Sequence key={i} from={sec(at)} durationInFrames={45} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

/* soft cream fade in / out */
const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 5, DURATION - 12, DURATION], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: P.cream, opacity: o * 0.85}} />;
};

export const OTMS_BEIGE_DURATION = DURATION;

export const OtmsBeige: React.FC<{hook?: HookId}> = ({hook = 'A'}) => (
  <AbsoluteFill style={{background: P.cream}}>
    <Camera />
    <StudioLight />
    {APPEAR.map((a) => (
      <SwapBloom key={`a${a}`} at={a} />
    ))}
    {REMOVE.map((r) => (
      <SwapBloom key={`r${r}`} at={r} />
    ))}
    <ShelfDoodles />
    <SwapSparkles />
    <HookLayer id={hook} />
    <PairBadge />
    <EndDoodles />
    <LightLeak at={CUT_SHELF} />
    <LightLeak at={CUT_END} />
    <Captions hookPlace={HOOK_CAPTION_PLACE[hook]} hide={hook === 'F' ? ['jom'] : []} />
    <Fades />
    <Sound />
  </AbsoluteFill>
);
