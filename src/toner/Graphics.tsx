import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Droplet, Heart, Sparkle} from '../Icons';
import {C, F, SAFE, SAFE_CX} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SOFT = {damping: 15, stiffness: 150, mass: 0.7};

/** spring-in at `from`, ease-out over the last 7 frames before `to` (absolute frames) */
const useLife = (from: number, to: number, cfg = SOFT) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame: f - from, fps, config: cfg});
  const outP = interpolate(f, [to - 7, to], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  return {f, inP, outP, on: f >= from && f < to};
};
const bob = (f: number, amp = 5, period = 60, phase = 0) => Math.sin(((f + phase) / period) * Math.PI * 2) * amp;

const outlined = (fill: string, stroke: string, w = 10): React.CSSProperties => ({
  color: fill,
  WebkitTextStroke: `${w}px ${stroke}`,
  paintOrder: 'stroke fill',
});

/* 1. intro title – script + serif italic, in the empty wall above the head */
const Title: React.FC = () => {
  const {f, inP, outP, on} = useLife(5, 60);
  if (!on) return null;
  const sub = spring({frame: f - 13, fps: 30, config: SOFT});
  return (
    <div style={{position: 'absolute', top: SAFE.top + 4, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center', opacity: outP}}>
      <div
        style={{
          fontFamily: F.script,
          fontSize: 118,
          lineHeight: 1,
          color: C.milk,
          textShadow: '0 2px 2px rgba(60,35,45,0.5), 0 4px 18px rgba(60,35,45,0.75)',
          transform: `translateY(${(1 - inP) * 30 + bob(f, 3, 70)}px) scale(${0.85 + 0.15 * inP})`,
          opacity: inP,
        }}
      >
        Hyalumelon
      </div>
      <div
        style={{
          marginTop: -6,
          fontFamily: F.serif,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 46,
          letterSpacing: 2,
          color: C.butter,
          textShadow: '0 3px 12px rgba(60,35,45,0.6)',
          opacity: sub,
          transform: `translateY(${(1 - sub) * 16}px)`,
        }}
      >
        mist toner
      </div>
      <Sparkle size={44} delay={0} style={{position: 'absolute', left: 150, top: 10, opacity: inP}} />
      <Sparkle size={30} delay={14} style={{position: 'absolute', right: 150, top: 80, opacity: sub}} />
    </div>
  );
};

/* 2. mist particles bursting from the nozzle */
const MistBurst: React.FC<{from: number; to: number; x: number; y: number; dir: number; seed: string}> = ({from, to, x, y, dir, seed}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const n = 26;
  return (
    <AbsoluteFill>
      {Array.from({length: n}).map((_, i) => {
        const delay = random(`${seed}d${i}`) * 10;
        const t = (f - from - delay) / 22;
        if (t < 0 || t > 1) return null;
        const ang = dir + (random(`${seed}a${i}`) - 0.5) * 1.1;
        const dist = 60 + random(`${seed}r${i}`) * 260;
        const e = Easing.out(Easing.cubic)(t);
        const r = 4 + random(`${seed}s${i}`) * 10;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(ang) * dist * e - r,
              top: y + Math.sin(ang) * dist * e - r + t * t * 30,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ffffff, rgba(235,245,255,0.55))',
              opacity: (1 - t) * 0.85,
              filter: 'blur(0.6px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* bubbly outlined sticker word (Chewy, like the "makan nonton pulang" reference) */
const BubbleWord: React.FC<{from: number; to: number; text: string; x: number; y: number; size: number; fill: string; tilt?: number; icon?: React.ReactNode}> = ({
  from,
  to,
  text,
  x,
  y,
  size,
  fill,
  tilt = -4,
  icon,
}) => {
  const {f, inP, outP, on} = useLife(from, to, {damping: 11, stiffness: 170, mass: 0.6});
  if (!on) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${bob(f, 5, 50)}px) scale(${inP * outP}) rotate(${tilt + bob(f, 2, 80)}deg)`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span style={{fontFamily: F.bubble, fontSize: size, letterSpacing: 1, ...outlined(fill, '#fff', size * 0.16), filter: 'drop-shadow(0 4px 0 rgba(91,70,54,0.55)) drop-shadow(0 8px 14px rgba(60,35,45,0.35))'}}>{text}</span>
    </div>
  );
};

/* 3. droplets soaking into the arm ("cepat meresap") */
const Absorb: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 150 || f >= 192) return null;
  const drops = [
    {x: 560, d: 0},
    {x: 680, d: 7},
    {x: 800, d: 14},
  ];
  return (
    <AbsoluteFill>
      {drops.map((d, i) => {
        const t = interpolate(f, [150 + d.d, 150 + d.d + 22], [0, 1], clamp);
        const fall = Easing.in(Easing.quad)(Math.min(1, t * 1.3));
        const soak = interpolate(t, [0.7, 1], [1, 0], clamp);
        return (
          <div key={i} style={{position: 'absolute', left: d.x - 22, top: 560 + fall * 190, transform: `scale(${soak}, ${0.6 + 0.4 * soak})`, opacity: soak}}>
            <Droplet size={44} color={C.milk} />
          </div>
        );
      })}
      {/* little shine ring where it soaks in */}
      {drops.map((d, i) => {
        const t = interpolate(f, [166 + d.d, 180 + d.d], [0, 1], clamp);
        if (t <= 0 || t >= 1) return null;
        return (
          <div
            key={`r${i}`}
            style={{
              position: 'absolute',
              left: d.x - 40 * t,
              top: 790 - 14 * t,
              width: 80 * t,
              height: 28 * t,
              borderRadius: '50%',
              border: `3px solid rgba(255,255,255,${0.8 * (1 - t)})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* 4. twinkles on the cheek for "plump" */
const CheekTwinkles: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 196 || f >= 242) return null;
  const pts = [
    [250, 760, 58, 0],
    [700, 610, 40, 5],
    [300, 980, 34, 10],
  ];
  return (
    <AbsoluteFill>
      {pts.map(([x, y, s, d], i) => {
        const p = spring({frame: f - 196 - d, fps: 30, config: {damping: 10, stiffness: 200, mass: 0.5}});
        const o = interpolate(f, [236, 242], [1, 0], clamp);
        return <Sparkle key={i} size={s} delay={d * 3} color={C.butter} style={{position: 'absolute', left: x, top: y, opacity: p * o, scale: String(p)}} />;
      })}
    </AbsoluteFill>
  );
};

/* 5. hydration meter that fills up for "dehydrated skin" */
const HydrationMeter: React.FC = () => {
  const {f, inP, outP, on} = useLife(246, 284);
  if (!on) return null;
  const fill = interpolate(f, [252, 274], [0.12, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const pct = Math.round(fill * 100);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_CX,
        top: SAFE.top + 20,
        transform: `translateX(-50%) translateY(${(1 - inP) * -30}px) scale(${0.8 + 0.2 * inP})`,
        opacity: inP * outP,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 26px',
        borderRadius: 999,
        background: 'rgba(255,253,246,0.88)',
        boxShadow: '0 8px 24px rgba(60,35,45,0.25)',
      }}
    >
      <Droplet size={40} color={C.sky} />
      <div style={{fontFamily: F.pixel, fontSize: 30, color: C.plum, letterSpacing: 1}}>hydration</div>
      <div style={{width: 230, height: 24, borderRadius: 12, background: '#E9EEF5', overflow: 'hidden', border: '3px solid #fff'}}>
        <div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 12, background: 'linear-gradient(90deg, #BFE0FA, #8FC6F2)'}} />
      </div>
      <div style={{fontFamily: F.pixel, fontSize: 30, color: C.plum, width: 72, textAlign: 'right'}}>{pct}%</div>
    </div>
  );
};

/* 6. benefits checklist card – each line ticks in */
const BENEFITS = ['kurangkan tiny bumps', 'kurangkan kemerahan', 'repair skin barrier', 'melembapkan kulit'];
const ROW0 = 292;
const ROW_GAP = 13;
const BenefitCard: React.FC = () => {
  const {f, inP, on} = useLife(284, 400);
  if (!on) return null;
  const W = 720;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_CX - W / 2,
        width: W,
        top: 1060,
        padding: '18px 36px 24px',
        borderRadius: 34,
        background: 'rgba(70,52,48,0.52)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(40,25,30,0.25), inset 0 0 0 1.5px rgba(255,240,166,0.25)',
        transform: `translateY(${(1 - inP) * 60}px) scale(${0.9 + 0.1 * inP})`,
        opacity: Math.min(1, inP * 1.4),
      }}
    >
      <div style={{fontFamily: F.script, fontSize: 64, lineHeight: 1.05, color: C.pink, textAlign: 'center', marginBottom: 6}}>
        kelebihan dia
        <Heart size={30} color={C.rose} style={{marginLeft: 10, transform: `translateY(-6px) scale(${1 + 0.08 * Math.sin(f / 5)})`}} />
      </div>
      {BENEFITS.map((b, i) => {
        const p = spring({frame: f - (ROW0 + i * ROW_GAP), fps: 30, config: {damping: 13, stiffness: 190, mass: 0.6}});
        return (
          <div key={b} style={{display: 'flex', alignItems: 'center', gap: 18, height: 70, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * -40}px)`}}>
            <div style={{transform: `scale(${p}) rotate(${(1 - p) * -90}deg)`}}>
              <Check size={46} color={C.sage} />
            </div>
            <span style={{fontFamily: F.sans, fontWeight: 500, fontSize: 52, color: C.butter, textShadow: '0 2px 6px rgba(40,25,30,0.4)'}}>{b}</span>
          </div>
        );
      })}
    </div>
  );
};
export const BENEFIT_FRAMES = BENEFITS.map((_, i) => ROW0 + i * ROW_GAP);

/* 7. sign-off at the top during the last beat */
const SignOff: React.FC = () => {
  const {f, inP, on} = useLife(338, 400);
  if (!on) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: SAFE.top + 6,
        left: SAFE_CX,
        transform: `translateX(-50%) translateY(${(1 - inP) * -20 + bob(f, 3, 60)}px)`,
        opacity: inP,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        whiteSpace: 'nowrap',
        fontFamily: F.serif,
        fontStyle: 'italic',
        fontSize: 44,
        color: C.milk,
        textShadow: '0 3px 12px rgba(60,35,45,0.65)',
      }}
    >
      <Sparkle size={30} color={C.butter} />
      hyalumelon mist toner
      <Sparkle size={30} color={C.butter} delay={10} />
    </div>
  );
};

export const Graphics: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Title />
    <MistBurst from={40} to={70} x={900} y={520} dir={Math.PI * 0.95} seed="b" />
    <MistBurst from={74} to={100} x={470} y={610} dir={-Math.PI * 0.2} seed="d" />
    <BubbleWord from={78} to={101} text="psst psst~" x={700} y={430} size={70} fill="#9FCFF5" tilt={6} />
    <BubbleWord from={104} to={147} text="milky texture" x={SAFE_CX} y={330} size={86} fill="#F6E3B4" icon={<Droplet size={46} color={C.milk} />} />
    <BubbleWord from={150} to={193} text="cepat meresap!" x={SAFE_CX} y={330} size={86} fill="#A8DDB5" tilt={3} />
    <Absorb />
    <CheekTwinkles />
    <BubbleWord from={198} to={242} text="plump!" x={250} y={330} size={96} fill="#F4A5C0" tilt={-8} />
    <HydrationMeter />
    <BenefitCard />
    <SignOff />
  </AbsoluteFill>
);
