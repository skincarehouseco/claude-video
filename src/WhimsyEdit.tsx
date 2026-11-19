import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {Captions} from './Captions';
import {Overlays, SECTION_STARTS} from './Overlays';
import {DURATION_IN_FRAMES, FPS, sec} from './theme';

/* ------------ camera: smooth zoom keyframes [seconds, scale] ------------ */
// Gentle push-ins on key lines and settles back out; punches use a soft overshoot.
type Key = [number, number, ('soft' | 'punch')?];
const ZOOM: Key[] = [
  [0, 1.1],
  [1.3, 1.0, 'soft'], // intro settle (zoom out)
  [6.7, 1.0],
  [7.6, 1.06, 'soft'], // "not every skincare ingredient..."
  [10.6, 1.06],
  [11.5, 1.0, 'soft'],
  [18.5, 1.02],
  [19.0, 1.12, 'punch'], // "too harsh"
  [21.2, 1.12],
  [22.2, 1.02, 'soft'],
  [27.0, 1.0, 'soft'],
  [31.0, 1.0],
  [31.6, 1.07, 'punch'], // "good combo"
  [33.4, 1.07],
  [34.4, 1.0, 'soft'],
  [41.0, 1.0],
  [41.5, 1.12, 'punch'], // "be careful"
  [43.2, 1.12],
  [44.2, 1.02, 'soft'],
  [47.6, 1.0, 'soft'],
  [50.0, 1.0],
  [50.6, 1.07, 'punch'], // "great combo"
  [52.2, 1.07],
  [53.2, 1.0, 'soft'],
  [57.9, 1.0],
  [58.4, 1.08, 'punch'], // "super flexible"
  [60.0, 1.08],
  [61.0, 1.0, 'soft'],
  [66.0, 1.0],
  [73.6, 1.06, 'soft'], // slow push through the takeaway
  [74.2, 1.11, 'punch'], // "make sure you layer them correctly"
  [76.0, 1.11],
  [76.8, 1.04, 'soft'],
];
const zoomAt = (t: number) => {
  for (let i = 0; i < ZOOM.length - 1; i++) {
    const [t0, z0] = ZOOM[i];
    const [t1, z1, kind] = ZOOM[i + 1];
    if (t >= t0 && t <= t1) {
      const ease = kind === 'punch' ? Easing.out(Easing.back(1.6)) : Easing.inOut(Easing.cubic);
      return interpolate(t, [t0, t1], [z0, z1], {easing: ease});
    }
  }
  return ZOOM[ZOOM.length - 1][1];
};

const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const z = zoomAt(t);
  // tiny handheld-style drift so held zooms feel alive (sub-pixel, not distracting)
  const dx = Math.sin(t * 0.7) * 3 * (z - 1) * 10;
  const dy = Math.cos(t * 0.5) * 2 * (z - 1) * 10;
  // brief soft-focus "breath" on each section change
  const blur = SECTION_STARTS.reduce((b, s) => {
    const d = Math.abs(t - s);
    return Math.max(b, d < 0.25 ? (0.25 - d) * 10 : 0);
  }, 0);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${dx}px, ${dy}px) scale(${z})`,
          transformOrigin: '50% 34%', // face height
          // colour grade: a touch brighter, cleaner contrast, warmer & slightly richer
          filter: `brightness(1.05) contrast(1.07) saturate(1.1) sepia(0.06) blur(${blur.toFixed(2)}px)`,
        }}
      >
        <OffthreadVideo src={staticFile('main.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {/* warm, rosy soft-light wash + lifted shadows */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(255,214,190,0.16) 0%, rgba(255,236,214,0.08) 50%, rgba(250,200,215,0.14) 100%)',
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill style={{background: 'rgba(255,244,236,0.035)', mixBlendMode: 'screen'}} />
      {/* soft vignette */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 75% 65% at 50% 42%, rgba(0,0,0,0) 55%, rgba(35,20,30,0.32) 100%)'}}
      />
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
        for (let f = Math.floor((w.start - 0.15) * FPS); f <= Math.ceil((w.end + 0.25) * FPS); f++) {
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
  ...SECTION_STARTS.map((s) => [s - 0.3, 'whoosh', 0.16] as Sfx),
  [11.55, 'pop', 0.2],
  [11.85, 'pop', 0.16],
  [18.75, 'oops', 0.2],
  [21.65, 'pop', 0.2],
  [21.9, 'pop', 0.16],
  [27.35, 'pop', 0.2],
  [27.65, 'pop', 0.16],
  [31.2, 'ding', 0.2],
  [32.9, 'sparkle', 0.14],
  [35.8, 'pop', 0.14],
  [39.65, 'pop', 0.2],
  [39.95, 'pop', 0.16],
  [41.25, 'oops', 0.2],
  [44.2, 'pop', 0.13],
  [45.85, 'pop', 0.13],
  [47.95, 'pop', 0.2],
  [48.25, 'pop', 0.16],
  [50.2, 'ding', 0.2],
  [52.35, 'pop', 0.13],
  [53.6, 'pop', 0.13],
  [55.95, 'pop', 0.2],
  [58.0, 'boing', 0.17],
  [60.3, 'pop', 0.13],
  [64.1, 'sparkle', 0.13],
  [66.1, 'pop', 0.14],
  [70.25, 'pop', 0.16],
  [73.85, 'whoosh', 0.14],
  [74.0, 'sparkle', 0.22],
  [74.05, 'ding', 0.17],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Audio src={staticFile('audio/voice.wav')} volume={1} />
      <Audio src={staticFile('audio/music.wav')} volume={(f) => vol[Math.min(f, vol.length - 1)]} />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={sec(1.6)} layout="none">
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
