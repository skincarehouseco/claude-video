import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Captions} from './Captions';
import {ArrowDown, Bow, Bubbles, Burst, Coin, Heart, LashGrow, Plus, Question, Sparkle, Swoosh, Tag} from './Doodles';
import {P} from './style';
import {Clip, CLIPS, DURATION_IN_FRAMES, f, FPS, TR, W, WORDS} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

/* ------------------------------------ camera ------------------------------------ */
// Emphasis punch-ins on key words: [word index, extra scale]
const PUNCH: [number, number][] = [
  [22, 0.07], // budget
  [60, 0.1], // dramatic
  [76, 0.06], // Lash Tonic
  [95, 0.07], // better result
  [109, 0.09], // Of course boleh!
  [120, 0.05], // combination
];
const punchAt = (frame: number) => {
  let s = 1;
  for (const [i, amt] of PUNCH) {
    const a = f(W(i).start) - 3;
    const hold = f(W(i === 109 ? 111 : i).end) + 12;
    const p = interpolate(frame, [a, a + 7], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))}) * (1 - interpolate(frame, [hold, hold + 16], [0, 1], {...clamp, easing: ease}));
    s *= 1 + amt * p;
  }
  return s;
};

const ClipView: React.FC<{c: Clip; idx: number}> = ({c, idx}) => {
  const frame = useCurrentFrame(); // absolute composition frame
  const start = c.from - (idx === 0 ? 0 : TR / 2);
  const end = c.to + (idx === CLIPS.length - 1 ? 0 : TR / 2);
  if (frame < start || frame >= end) return null;

  // slow camera move across the shot + emphasis punches
  const u = interpolate(frame, [c.from, c.to], [0, 1], {...clamp, easing: ease});
  const base = c.zoom === 'in' ? 1.0 + 0.07 * u : 1.08 - 0.07 * u;
  const scale = base * punchAt(frame);
  const wobble = frame >= f(W(109).start) - 3 && frame < f(W(111).end) + 14 ? Math.sin((frame - f(W(109).start)) / 2.2) * 1.2 * Math.exp(-(frame - f(W(109).start)) / 14) : 0;

  // transition into this clip
  let enter: React.CSSProperties = {};
  if (idx > 0 && c.tr !== 'none') {
    const e = interpolate(frame, [start, start + TR], [0, 1], {...clamp, easing: ease});
    if (e < 1) {
      if (c.tr === 'dissolve' || c.tr === 'sparkle') enter = {opacity: e};
      if (c.tr === 'zoom') enter = {opacity: e, transform: `scale(${1.14 - 0.14 * e})`, filter: `blur(${(1 - e) * 10}px)`};
      if (c.tr === 'whip') enter = {transform: `translateX(${(1 - e) * 1080}px)`, filter: `blur(${Math.sin(e * Math.PI) * 14}px)`};
      if (c.tr === 'slideUp') enter = {transform: `translateY(${(1 - e) * 1920}px)`, filter: `blur(${Math.sin(e * Math.PI) * 12}px)`};
    }
  }
  // whip-out of the outgoing clip so the move reads as one smooth swipe
  const next = CLIPS[idx + 1];
  if (next && (next.tr === 'whip' || next.tr === 'slideUp')) {
    const x = interpolate(frame, [end - TR, end], [0, 1], {...clamp, easing: ease});
    if (x > 0) enter = {...enter, transform: next.tr === 'whip' ? `translateX(${-x * 1080}px)` : `translateY(${-x * 1920}px)`, filter: `blur(${Math.sin(x * Math.PI) * 14}px)`};
  }

  const srcStart = c.src - ((c.from - start) * c.rate) / FPS; // footage shown at the start of the transition handle
  return (
    <AbsoluteFill style={{...enter, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${scale.toFixed(5)}) rotate(${wobble.toFixed(3)}deg)`, transformOrigin: c.origin ?? '50% 45%'}}>
        <Sequence from={start} durationInFrames={end - start} layout="none">
          <OffthreadVideo
            src={staticFile('pestana/footage.mp4')}
            startFrom={Math.max(0, Math.round(srcStart * FPS))}
            playbackRate={c.rate}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** soft butter-light flash + sparkles sweeping across on 'sparkle' cuts */
const SparkleWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CLIPS.find((k) => k.tr === 'sparkle' && frame >= k.from - TR && frame < k.from + TR);
  if (!c) return null;
  const t = interpolate(frame, [c.from - TR, c.from + TR], [0, 1], clamp);
  const glow = Math.sin(t * Math.PI);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${20 + t * 60}% 45%, rgba(255,246,204,${0.55 * glow}), rgba(255,240,166,${0.18 * glow}) 55%, transparent 80%)`}} />
      {[0, 1, 2, 3, 4].map((k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: -120 + t * 1300 - k * 70,
            top: 520 + k * 190 + Math.sin(k * 2 + t * 6) * 40,
            fontSize: 46 + (k % 2) * 28,
            color: k % 2 ? P.butter : '#fff',
            opacity: glow,
            transform: `rotate(${t * 180}deg)`,
            textShadow: '0 0 18px rgba(255,240,166,0.9)',
          }}
        >
          ✦
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Footage: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1b1416', overflow: 'hidden'}}>
    {CLIPS.map((c, i) => (
      <ClipView key={i} c={c} idx={i} />
    ))}
  </AbsoluteFill>
);

/* ------------------------------------ graphics ------------------------------------ */
const ws = (i: number) => f(W(i).start);
const we = (i: number) => f(W(i).end);
const clipEnd = (vo: number) => CLIPS.find((c) => c.from <= vo && c.to > vo)!.to;

const Graphics: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {/* hook: twinkles round "Pestana Tinted Serum" */}
    <Sparkle at={ws(3)} until={clipEnd(ws(3))} x={800} y={1180} size={70} seed={1} />
    <Sparkle at={ws(4) + 4} until={clipEnd(ws(3))} x={130} y={1400} size={46} seed={2} color="#fff" />
    {/* "Pestana Tonic" / "Jelly Oil" name tags */}
    <Tag at={ws(11) + 2} until={clipEnd(ws(11))} x={640} y={1330} label="lash tonic ♡" rot={-6} seed={3} />
    <Tag at={ws(15) + 2} until={clipEnd(ws(15))} x={700} y={1330} label="jelly lash oil ♡" rot={5} seed={4} />
    {/* "lagi?" — little floating question marks */}
    <Question at={ws(16)} until={clipEnd(ws(16))} x={600} y={640} size={110} rot={12} seed={1} />
    <Question at={ws(16) + 3} until={clipEnd(ws(16))} x={760} y={540} size={80} rot={-14} seed={2} color={P.pink} />
    {/* budget */}
    <Coin at={ws(22)} until={clipEnd(ws(22))} x={560} y={1090} size={100} seed={1} />
    <Coin at={ws(22) + 4} until={clipEnd(ws(22))} x={680} y={1040} size={76} seed={3} />
    {/* result */}
    <Sparkle at={ws(26) + 4} until={clipEnd(ws(26))} x={530} y={1110} size={64} seed={4} />
    {/* lash growth */}
    <LashGrow at={ws(37)} until={clipEnd(ws(37))} x={760} y={900} size={190} />
    {/* mascara effect */}
    <Swoosh at={ws(53)} until={clipEnd(ws(53))} x={140} y={1305} w={500} />
    {/* dramatic — bow sticker like the reference */}
    <Bow at={ws(60)} until={clipEnd(ws(60))} x={700} y={1500 - 300} size={150} rot={-10} seed={2} />
    <Sparkle at={ws(64)} until={clipEnd(ws(64))} x={790} y={1060} size={56} seed={5} color="#fff" />
    {/* combine bersama ... Lash Tonic */}
    <Plus at={ws(72)} until={clipEnd(ws(72))} x={820} y={330} size={80} seed={2} />
    <Heart at={ws(75)} until={clipEnd(ws(75))} x={820} y={420} size={80} rot={10} seed={3} />
    {/* formula & active ingredients */}
    <Bubbles at={ws(84)} until={clipEnd(ws(84))} x={560} y={1290} />
    {/* combining these two product -> mini formula */}
    <Tag at={ws(88)} until={clipEnd(ws(88))} x={330} y={1270} label="tinted serum" rot={-4} seed={1} />
    <Plus at={ws(89)} until={clipEnd(ws(89))} x={560} y={1275} size={70} seed={2} />
    <Tag at={ws(89) + 4} until={clipEnd(ws(89))} x={740} y={1280} label="tonic" rot={4} seed={3} />
    {/* better result */}
    <Sparkle at={ws(95)} until={clipEnd(ws(95))} x={700} y={1060} size={80} seed={1} />
    <Sparkle at={ws(96)} until={clipEnd(ws(95))} x={170} y={1320} size={50} seed={2} color="#fff" />
    <Heart at={ws(96) + 2} until={clipEnd(ws(95))} x={820} y={1250} size={70} rot={-12} seed={4} />
    {/* how about Jelly Oil? */}
    <Question at={ws(101)} until={clipEnd(ws(101))} x={780} y={300} size={110} rot={14} seed={3} />
    {/* combine with Tinted Serum? */}
    <Tag at={ws(105)} until={clipEnd(ws(105))} x={330} y={1300} label="tinted serum" rot={-5} seed={1} />
    <Plus at={ws(106)} until={clipEnd(ws(106))} x={540} y={1300} size={66} seed={2} />
    <Tag at={ws(106) + 4} until={clipEnd(ws(106))} x={730} y={1300} label="jelly oil" rot={5} seed={3} />
    {/* Of course boleh! */}
    <Burst at={ws(111)} x={495} y={1100} />
    <Heart at={ws(111)} until={ws(112) + 6} x={230} y={980} size={90} rot={-14} seed={1} />
    <Heart at={ws(111) + 3} until={ws(112) + 6} x={790} y={1220} size={70} rot={12} seed={2} color={P.rose} />
    {/* combination */}
    <Sparkle at={ws(120)} until={clipEnd(ws(120))} x={640} y={1110} size={60} seed={3} />
    {/* use it alone */}
    <Heart at={ws(126)} until={clipEnd(ws(126))} x={700} y={1240} size={74} rot={8} seed={5} />
    {/* description -> arrow down */}
    <ArrowDown at={ws(138) + 6} until={DURATION_IN_FRAMES} x={495} y={1420} size={90} />
    <Sparkle at={ws(136)} until={DURATION_IN_FRAMES} x={830} y={1250} size={56} seed={2} />
  </AbsoluteFill>
);

/* ------------------------------------ audio ------------------------------------ */
const useMusicVolume = () =>
  useMemo(() => {
    const n = DURATION_IN_FRAMES;
    const speaking = new Array(n).fill(0);
    WORDS.forEach((w) => {
      for (let k = f(w.start) - 4; k <= f(w.end) + 6; k++) if (k >= 0 && k < n) speaking[k] = 1;
    });
    const vol = new Array(n).fill(0);
    for (let k = 0; k < n; k++) {
      let s = 0;
      let m = 0;
      for (let j = k - 10; j <= k + 10; j++) if (j >= 0 && j < n) (s += speaking[j]), m++;
      const sp = s / m;
      vol[k] = 0.06 * sp + 0.12 * (1 - sp); // music sits well under the voice (~-24 dB), rises softly in gaps
    }
    return vol;
  }, []);

type Sfx = [frame: number, name: string, vol: number];
const SFX: Sfx[] = [
  [0, 'sparkle', 0.16],
  ...CLIPS.filter((c) => c.tr === 'whip' || c.tr === 'slideUp').map((c) => [c.from - 7, 'whoosh', 0.12] as Sfx),
  ...CLIPS.filter((c) => c.tr === 'sparkle').map((c) => [c.from - 6, 'sparkle', 0.12] as Sfx),
  [ws(11) + 2, 'pop', 0.13],
  [ws(15) + 2, 'pop', 0.13],
  [ws(16), 'boing', 0.1],
  [ws(22), 'pop', 0.15],
  [ws(22) + 4, 'pop', 0.11],
  [ws(37), 'pop', 0.11],
  [ws(60), 'pop', 0.14],
  [ws(72), 'pop', 0.12],
  [ws(84), 'sparkle', 0.08],
  [ws(88), 'pop', 0.11],
  [ws(89) + 4, 'pop', 0.11],
  [ws(95), 'ding', 0.14],
  [ws(101), 'boing', 0.1],
  [ws(105), 'pop', 0.11],
  [ws(106) + 4, 'pop', 0.11],
  [ws(109), 'ding', 0.15],
  [ws(111), 'sparkle', 0.12],
  [ws(126), 'pop', 0.1],
  [ws(138), 'sparkle', 0.12],
];

const AudioMix: React.FC = () => {
  const vol = useMusicVolume();
  return (
    <>
      <Audio src={staticFile('pestana/voice.wav')} volume={1} />
      <Audio
        src={staticFile('pestana/music.wav')}
        volume={(fr) =>
          vol[Math.min(fr, vol.length - 1)] *
          interpolate(fr, [0, 12, DURATION_IN_FRAMES - 36, DURATION_IN_FRAMES], [0, 1, 1, 0], clamp)
        }
      />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={45} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

/* ------------------------------------ fades ------------------------------------ */
const Fades: React.FC = () => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 7, DURATION_IN_FRAMES - 14, DURATION_IN_FRAMES], [1, 0, 0, 1], clamp);
  return <AbsoluteFill style={{background: '#FFF6E0', opacity: o * 0.85}} />;
};

export const PestanaEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Footage />
    <SparkleWipe />
    <Graphics />
    <Captions />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
