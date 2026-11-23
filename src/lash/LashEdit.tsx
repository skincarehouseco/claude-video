import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';
import {Captions} from './Captions';
import {Graphics, SFX} from './Graphics';
import {A, DURATION_IN_FRAMES, ease, f, FPS} from './theme';

type Clip = {start: number; end: number; in: number; out: number; rate: number; style: string};
const CLIPS = edit.clips as Clip[];
const XF = 8; // dissolve length (frames) between shots

// where each shot's zoom is centred (eye / face), keyed by footage in-point
const FOCUS: Record<string, [number, number]> = {
  '17': [66, 31], // zigzag application, right eye
  '3.02': [54, 33], // close-up eye
  '53.7': [45, 32],
  '56.2': [45, 32],
};
const focusOf = (c: Clip): [number, number] => FOCUS[String(c.in)] ?? [50, 36];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// emphasis punch-ins (edit seconds): [start, end, extra scale]
const PUNCH: [number, number, number][] = [
  [A.important, A.step3 - 0.2, 0.1], // "this is the most important step"
  [A.zigzagWord - 0.1, A.zigzagWord + 2.0, 0.06],
  [A.notMascara, A.notMascara + 3.3, 0.08], // "tinted lash serum is not mascara"
  [A.hundred, A.hundred + 2.6, 0.05], // "tak semestinya 100%"
];

const scaleFor = (c: Clip, localSec: number, t: number) => {
  const len = c.end - c.start;
  const u = ease(clamp01(localSec / len));
  let s = 1;
  switch (c.style) {
    case 'in':
      s = 1.0 + 0.06 * u;
      break;
    case 'out':
      s = 1.08 - 0.07 * u;
      break;
    case 'tight':
      s = 1.42 + 0.06 * u;
      break;
    case 'zig':
      s = 1.02 + 0.05 * u;
      break;
    case 'recap':
      s = 1.12;
      break;
  }
  for (const [a, b, z] of PUNCH) {
    if (t > a - 0.01 && t < b + 0.7) s *= 1 + z * ease(clamp01((t - a) / 0.45)) * (1 - ease(clamp01((t - b) / 0.7)));
  }
  // very first shot opens with a gentle settle from a slight zoom
  if (c.start === 0) s *= 1 + 0.06 * (1 - ease(clamp01(t / 1.2)));
  return s;
};

const Shot: React.FC<{clip: Clip; startFrame: number}> = ({clip, startFrame}) => {
  const frame = useCurrentFrame(); // local to the Sequence
  const t = (startFrame + frame) / FPS;
  const s = scaleFor(clip, frame / FPS, t);
  const [fx, fy] = focusOf(clip);
  // slow drift so even held shots feel alive
  const dx = Math.sin((startFrame + frame) / 70) * 4;
  const recap = clip.style === 'recap';
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${dx}px,0) scale(${s.toFixed(5)})`,
          transformOrigin: `${fx}% ${fy}%`,
          filter: recap ? 'blur(14px) brightness(0.82) saturate(1.05)' : undefined,
        }}
      >
        <OffthreadVideo
          src={staticFile('lash/footage.mp4')}
          startFrom={Math.round(clip.in * FPS)}
          playbackRate={clip.rate}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Footage: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000', isolation: 'isolate'}}>
    {CLIPS.map((c, i) => {
      const from = f(c.start);
      const dur = f(c.end) - from;
      const isLast = i === CLIPS.length - 1;
      return (
        <React.Fragment key={i}>
          <Sequence from={from} durationInFrames={dur} layout="none">
            <FadeIn first={i === 0}>
              <Shot clip={c} startFrame={from} />
            </FadeIn>
          </Sequence>
          {!isLast && (
            // hold the outgoing shot's last frame underneath while the next shot dissolves in
            <Sequence from={from + dur} durationInFrames={XF} layout="none">
              <Freeze frame={dur - 1}>
                <Shot clip={c} startFrame={from} />
              </Freeze>
            </Sequence>
          )}
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);

const FadeIn: React.FC<{first: boolean; children: React.ReactNode}> = ({first, children}) => {
  const frame = useCurrentFrame();
  const o = first ? 1 : interpolate(frame, [0, XF], [0, 1], {extrapolateRight: 'clamp', easing: ease});
  const sc = first ? 1 : interpolate(frame, [0, XF], [1.025, 1], {extrapolateRight: 'clamp', easing: ease});
  return <AbsoluteFill style={{opacity: o, transform: `scale(${sc})`, zIndex: 1}}>{children}</AbsoluteFill>;
};

/* ------------ audio: clean voice on top, music ducked under speech, light SFX ------------ */
type W = {start: number; end: number};
const useMusicVolume = () =>
  useMemo(() => {
    const n = DURATION_IN_FRAMES;
    const speaking = new Array(n).fill(0);
    (edit.words as W[]).forEach((w) => {
      for (let k = f(w.start - 0.15); k <= f(w.end + 0.3); k++) if (k >= 0 && k < n) speaking[k] = 1;
    });
    const vol = new Array(n).fill(0);
    const R = 12; // ~0.4 s smoothing for soft ducking
    for (let k = 0; k < n; k++) {
      let s = 0;
      let m = 0;
      for (let j = k - R; j <= k + R; j++) if (j >= 0 && j < n) (s += speaking[j]), m++;
      const sp = s / m;
      vol[k] = 0.055 * sp + 0.12 * (1 - sp); // ~-25 dB under the voice, lifts a little in breaths
    }
    return vol;
  }, []);

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  const N = DURATION_IN_FRAMES;
  return (
    <>
      <Audio src={staticFile('lash/voice.wav')} volume={1} />
      <Audio
        src={staticFile('lash/audio/music.wav')}
        volume={(k) =>
          vol[Math.min(k, N - 1)] *
          interpolate(k, [0, 20, N - 50, N], [0.4, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
        }
      />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} durationInFrames={50} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

const EndFade: React.FC = () => {
  const k = useCurrentFrame();
  const o = interpolate(k, [DURATION_IN_FRAMES - 14, DURATION_IN_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{background: '#FFF8EE', opacity: o * 0.85}} />;
};

export const LashEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Footage />
    <Graphics />
    <Captions />
    <EndFade />
    <AudioMix />
  </AbsoluteFill>
);
