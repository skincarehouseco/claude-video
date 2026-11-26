import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {Captions} from './Captions';
import {Backgrounds, Foregrounds, ImpactFlash, KineticWords} from './Scenes';
import {CARD_TIMES, PolaroidBackgrounds} from './Polaroid';
import {Subject} from './Subject';
import {C, DURATION, FPS, HAND, prog, rnd, Variant, VariantCtx} from './theme';
import {Sparkle} from './ui';

/* ---------- section-change sparkle sweep + the cover for the source's built-in white flash (24.37–24.53 s) ---------- */
const PromoWipe: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const a = 24.18;
  const b = 24.68;
  if (t < a || t > b) return null;
  // blush petal wipe in, hold over the flash frames, wipe out
  const pin = prog(t, a, 24.33);
  const pout = prog(t, 24.55, b);
  const r = 2300 * pin;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, #F6F6F4 0%, ${C.blushDeep} 60%, ${C.rose} 100%)`,
          clipPath: pout > 0 ? `circle(${2300 * (1 - pout)}px at 540px 900px)` : `circle(${r}px at 540px 900px)`,
        }}
      >
        <div style={{position: 'absolute', top: 820, width: '100%', textAlign: 'center', fontFamily: HAND, fontStyle: 'italic', fontWeight: 700, fontSize: 68, color: C.cherry, transform: `rotate(-4deg) scale(${0.8 + 0.2 * pin})`}}>
          wait, ada lagi…
        </div>
        {Array.from({length: 10}).map((_, i) => (
          <Sparkle key={i} t={t} phase={i} size={30 + rnd(i) * 40} color="#fff" style={{position: 'absolute', left: rnd(i + 1) * 900 + 60, top: rnd(i + 4) * 1400 + 200}} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- audio ---------- */
type Chunk = {words: {start: number; end: number}[]};
const useMusicVolume = () =>
  useMemo(() => {
    const speaking = new Array(DURATION).fill(0);
    (captions as Chunk[]).forEach((c) =>
      c.words.forEach((w) => {
        for (let f = Math.round((w.start - 0.15) * FPS); f <= Math.round((w.end + 0.25) * FPS); f++) if (f >= 0 && f < DURATION) speaking[f] = 1;
      }),
    );
    const vol = new Array(DURATION).fill(0);
    const R = 10;
    for (let f = 0; f < DURATION; f++) {
      let s = 0;
      let k = 0;
      for (let j = f - R; j <= f + R; j++)
        if (j >= 0 && j < DURATION) {
          s += speaking[j];
          k++;
        }
      const sp = s / k;
      vol[f] = 0.06 * sp + 0.13 * (1 - sp); // well under the voice; lifts a little in pauses
    }
    return vol;
  }, []);

type Sfx = [number, string, number];
// CapCut-style SFX, each placed on the graphic / camera event it belongs to (times in seconds)
export const SFX: Sfx[] = [
  [0.0, 'whoosh', 0.18],
  [0.05, 'pop', 0.16],
  [0.37, 'pop', 0.12],
  [0.6, 'pop', 0.12],
  [0.76, 'bubble', 0.18],
  [1.0, 'sparkle', 0.12],
  [1.88, 'swipe', 0.16],
  [2.02, 'notify', 0.16],
  [3.27, 'whoosh', 0.15],
  [3.55, 'paper', 0.2],
  [3.75, 'click', 0.22],
  [4.07, 'click', 0.22],
  [4.39, 'click', 0.22],
  [4.71, 'click', 0.22],
  [5.92, 'swipe', 0.16],
  [6.0, 'pop', 0.16],
  [6.55, 'bubble', 0.16],
  [6.95, 'bubble', 0.13],
  [7.15, 'bubble', 0.13],
  [7.35, 'bubble', 0.13],
  [7.86, 'impact', 0.16],
  [7.88, 'pop', 0.15],
  [8.66, 'whoosh', 0.15],
  [8.74, 'pop', 0.15],
  [9.15, 'tick', 0.12],
  [9.45, 'tick', 0.12],
  [9.75, 'tick', 0.12],
  [10.05, 'tick', 0.12],
  [9.53, 'scratch', 0.2],
  [9.56, 'impact', 0.14],
  [10.3, 'swipe', 0.12],
  [10.4, 'ding', 0.18],
  [10.8, 'swipe', 0.15],
  [11.0, 'sparkle', 0.16],
  [12.44, 'pop', 0.13],
  [13.74, 'whoosh', 0.14],
  [14.36, 'pop', 0.13],
  [15.06, 'impact', 0.2],
  [15.06, 'pop', 0.14],
  [15.3, 'pop', 0.14],
  [15.74, 'swipe', 0.15],
  [15.86, 'pop', 0.13],
  [16.25, 'spray', 0.17],
  [16.64, 'impact', 0.15],
  [16.66, 'swipe', 0.12],
  [16.95, 'spray', 0.12],
  [17.82, 'whoosh', 0.14],
  [18.32, 'spray', 0.2],
  [18.45, 'pop', 0.12],
  [19.15, 'pop', 0.12],
  [19.9, 'bubble', 0.16],
  [20.18, 'bubble', 0.16],
  [20.45, 'bubble', 0.16],
  [20.78, 'whoosh', 0.15],
  [20.86, 'pop', 0.14],
  [21.0, 'bubble', 0.1],
  [22.3, 'lock', 0.3],
  [22.45, 'impact', 0.12],
  [23.68, 'paper', 0.16],
  [23.74, 'click', 0.2],
  [23.84, 'click', 0.2],
  [23.94, 'click', 0.2],
  [24.04, 'click', 0.2],
  [24.16, 'scratch', 0.2],
  [24.2, 'whoosh', 0.16],
  [24.55, 'swipe', 0.16],
  [24.72, 'impact', 0.15],
  [24.75, 'tick', 0.08],
  [25.0, 'tick', 0.08],
  [25.25, 'tick', 0.08],
  [25.42, 'ding', 0.15],
  [25.92, 'pop', 0.14],
  [26.52, 'cart', 0.17],
  [27.6, 'swipe', 0.15],
  [28.06, 'pop', 0.15],
  [28.72, 'pop', 0.13],
  [29.62, 'sparkle', 0.2],
  [29.78, 'ding', 0.18],
  [29.78, 'impact', 0.18],
  [30.06, 'whoosh', 0.16],
  [30.14, 'pop', 0.16],
  [30.6, 'pop', 0.14],
  [30.76, 'cart', 0.17],
  [30.9, 'sparkle', 0.14],
];

const AudioMix: React.FC<{variant: Variant}> = ({variant}) => {
  const vol = useMusicVolume();
  // version B: different music bed + a camera-shutter click each time a new polaroid lands
  const sfx: Sfx[] = variant === 'B' ? [...SFX, ...CARD_TIMES.filter((c) => Math.abs(c - 24.3) > 0.1).map((c) => [c + 0.05, 'shutter', 0.16] as Sfx)] : SFX;
  return (
    <>
      <Audio src={staticFile('blume/audio/voice.wav')} volume={1} />
      <Audio
        src={staticFile(variant === 'B' ? 'blume/audio/music_b.wav' : 'blume/audio/music.wav')}
        volume={(f) =>
          vol[Math.min(f, vol.length - 1)] * interpolate(f, [0, 6, DURATION - 20, DURATION], [0, 1, 1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
        }
      />
      {sfx.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={45} layout="none">
          <Audio src={staticFile(`blume/audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

export const BlumeEdit: React.FC<{variant?: Variant}> = ({variant = 'A'}) => (
  <VariantCtx.Provider value={variant}>
    <AbsoluteFill style={{backgroundColor: C.cream}}>
      {variant === 'B' ? <PolaroidBackgrounds /> : <Backgrounds />}
      <Subject />
      <Foregrounds />
      <KineticWords />
      <Captions />
      <ImpactFlash />
      <PromoWipe />
      <AudioMix variant={variant} />
    </AbsoluteFill>
  </VariantCtx.Provider>
);
