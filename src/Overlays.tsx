import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cross, Droplet, Heart, Moon, Plus, Shield, Sparkle, Warn} from './Icons';
import {C, pixelFont, roundFont, SAFE, SAFE_CENTER_X, sec, serifFont, srcTime} from './theme';
import {DayNight} from './DayNight';

/* ---------- animation helpers ---------- */
// softer springs than before: no jitter, just a smooth, slightly bouncy settle
const SOFT = {damping: 16, stiffness: 140, mass: 0.8};
const usePop = (delay = 0, cfg = SOFT) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: cfg});
};
// fades/lifts everything out over the last `len` frames of the parent Sequence
const useExit = (len = 10) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return interpolate(f, [durationInFrames - len, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
};
const useFloat = (amp = 5, period = 70, phase = 0) => {
  const f = useCurrentFrame();
  return Math.sin((f + phase) / (period / (2 * Math.PI))) * amp;
};

const TOP_ZONE_Y = SAFE.top + 6; // titles live in the empty wall area above the head
const ZONE_W = SAFE.right - SAFE.left; // 830

const headingShadow = '0 3px 0 rgba(91,70,54,0.75), 0 6px 22px rgba(40,25,30,0.5)';

/* ---------- building blocks ---------- */
const Pill: React.FC<{
  text: string;
  bg: string;
  delay: number;
  size: number;
  icon?: React.ReactNode;
  tilt?: number;
}> = ({text, bg, delay, size, icon, tilt = 0}) => {
  const p = usePop(delay);
  const fl = useFloat(4, 80, delay * 9);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: `${size * 0.2}px ${size * 0.5}px ${size * 0.24}px`,
        borderRadius: 999,
        background: `linear-gradient(180deg, #ffffff 0%, ${bg} 55%)`,
        border: '6px solid #fff',
        boxShadow: `0 9px 0 ${bg}, 0 9px 0 6px rgba(255,255,255,0.0), 0 14px 30px rgba(40,20,40,0.28)`,
        fontFamily: roundFont,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: 0.5,
        color: C.plum,
        whiteSpace: 'nowrap',
        transform: `translateY(${(1 - p) * 36 + fl}px) scale(${0.6 + 0.4 * p}) rotate(${tilt * p}deg)`,
        opacity: Math.min(1, p * 1.4),
      }}
    >
      {icon}
      {text}
    </div>
  );
};

const Operator: React.FC<{kind: 'bad' | 'good'; delay: number; size?: number}> = ({kind, delay, size = 84}) => {
  const p = usePop(delay, {damping: 12, stiffness: 160, mass: 0.7});
  return (
    <div style={{transform: `scale(${p}) rotate(${(1 - p) * -120}deg)`, zIndex: 2, flexShrink: 0}}>
      {kind === 'bad' ? <Cross size={size} /> : <Plus size={size} />}
    </div>
  );
};

const Label: React.FC<{text: string; delay?: number}> = ({text, delay = 0}) => {
  const p = usePop(delay);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateY(${(1 - p) * -20}px)`}}>
      <Sparkle size={36} delay={delay} />
      <div
        style={{
          fontFamily: serifFont,
          fontStyle: 'italic',
          fontSize: 70,
          lineHeight: 1.1,
          color: C.butter,
          textShadow: headingShadow,
          transform: 'rotate(-3deg)',
        }}
      >
        {text}
      </div>
      <Sparkle size={28} delay={delay + 13} speed={1.3} />
    </div>
  );
};

type Note = {at: number; text: string; color: string; icon?: React.ReactNode};
// one "sticker" slot under the pills that swaps between short notes (keeps screen uncluttered)
const NoteSlot: React.FC<{notes: Note[]; sectionStart: number}> = ({notes, sectionStart}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = srcTime(f) + sectionStart;
  let idx = -1;
  notes.forEach((n, i) => {
    if (t >= n.at) idx = i;
  });
  if (idx < 0) return <div style={{height: 104}} />;
  const n = notes[idx];
  const local = f - sec(n.at - sectionStart);
  const p = spring({frame: local, fps, config: {damping: 14, stiffness: 170, mass: 0.7}});
  // the previous note slides out as the new one comes in
  const prev = idx > 0 ? notes[idx - 1] : null;
  const prevOut = interpolate(local, [0, 7], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sticker = (nn: Note, scale: number, opacity: number, rot: number, key: string) => (
    <div
      key={key}
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 30px 13px',
        borderRadius: 26,
        background: nn.color,
        border: '5px solid #fff',
        boxShadow: '0 10px 26px rgba(40,20,40,0.28)',
        fontFamily: roundFont,
        fontWeight: 500,
        fontSize: 54,
        lineHeight: 1.1,
        color: C.plum,
        transform: `scale(${scale}) rotate(${rot}deg)`,
        opacity,
        whiteSpace: 'nowrap',
      }}
    >
      {nn.icon}
      {nn.text}
    </div>
  );
  const rot = idx % 2 ? 2.5 : -2.5;
  return (
    <div style={{height: 104, width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16}}>
      {prev && prevOut > 0 && sticker(prev, 0.85 + 0.15 * prevOut, prevOut, -rot, 'prev')}
      {sticker(n, 0.5 + 0.5 * p, Math.min(1, p * 1.5), rot * p, 'cur')}
    </div>
  );
};

const TopZone: React.FC<{children: React.ReactNode}> = ({children}) => {
  const ex = useExit();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: TOP_ZONE_Y,
          left: SAFE.left,
          width: ZONE_W,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: ex,
          transform: `scale(${0.9 + 0.1 * ex}) translateY(${(1 - ex) * -24}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- section cards ---------- */
const ComboCard: React.FC<{
  label: string;
  a: [string, string];
  b?: [string, string];
  kind: 'bad' | 'good' | 'solo';
  notes: Note[];
  sectionStart: number;
  soloIcon?: React.ReactNode;
}> = ({label, a, b, kind, notes, sectionStart, soloIcon}) => {
  const chars = a[0].length + (b ? b[0].length : 0);
  const singleRow = kind === 'solo' || chars <= 12;
  return (
    <TopZone>
      <Label text={label} />
      {singleRow ? (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8}}>
          <Pill text={a[0]} bg={a[1]} delay={4} size={74} tilt={-2} icon={soloIcon} />
          {kind !== 'solo' && b && (
            <>
              <Operator kind={kind === 'bad' ? 'bad' : 'good'} delay={10} />
              <Pill text={b[0]} bg={b[1]} delay={14} size={74} tilt={2} />
            </>
          )}
        </div>
      ) : (
        // staggered two-row layout keeps long ingredient names big & readable
        <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginTop: 8}}>
          <div style={{display: 'flex', justifyContent: 'flex-start', paddingLeft: 40}}>
            <Pill text={a[0]} bg={a[1]} delay={4} size={70} tilt={-2} />
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, paddingRight: 20, marginTop: 6}}>
            <Operator kind={kind === 'bad' ? 'bad' : 'good'} delay={10} size={80} />
            {b && <Pill text={b[0]} bg={b[1]} delay={14} size={70} tilt={2} />}
          </div>
        </div>
      )}
      <NoteSlot notes={notes} sectionStart={sectionStart} />
    </TopZone>
  );
};

const HookTitle: React.FC = () => {
  const f = useCurrentFrame();
  const sub = usePop(18);
  const line = (word: string, offset: number, size: number) => (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      {word.split('').map((ch, i) => {
        const p = spring({frame: f - 2 - (offset + i) * 1.5, fps: 30, config: {damping: 13, stiffness: 160, mass: 0.6}});
        const bob = Math.sin((f + (offset + i) * 6) / 14) * 3;
        return (
          <span
            key={i}
            style={{
              fontFamily: pixelFont,
              fontSize: size,
              lineHeight: 1,
              color: '#fff',
              display: 'inline-block',
              whiteSpace: 'pre',
              textShadow: `0 7px 0 ${C.rose}, 0 12px 28px rgba(60,20,50,0.45)`,
              transform: `translateY(${(1 - p) * -50 + bob}px) scale(${0.5 + 0.5 * p})`,
              opacity: Math.min(1, p * 1.5),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
  return (
    <TopZone>
      <div style={{position: 'relative'}}>
        {line("don't mix", 0, 132)}
        {line('these!', 9, 132)}
        <Sparkle size={58} style={{position: 'absolute', left: -50, top: -10}} delay={0} />
        <Sparkle size={40} style={{position: 'absolute', right: -40, top: 150}} delay={14} speed={1.3} />
      </div>
      <div
        style={{
          fontFamily: serifFont,
          fontStyle: 'italic',
          fontSize: 68,
          color: C.butter,
          marginTop: 14,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 20}px) rotate(-3deg)`,
          textShadow: headingShadow,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Heart size={42} /> skincare edition <Heart size={42} color={C.lavender} />
      </div>
    </TopZone>
  );
};

const Outro: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = srcTime(f) + start;
  const line1 = usePop(2);
  const line2 = usePop(sec(70.2 - start));
  const line3 = usePop(sec(73.95 - start));
  const fade12 = interpolate(t, [73.5, 73.95], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <TopZone>
      <div style={{position: 'relative', width: '100%', height: 330, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div
          style={{
            fontFamily: serifFont,
            fontStyle: 'italic',
            fontSize: 70,
            color: C.butter,
            textShadow: headingShadow,
            opacity: line1 * fade12,
            transform: `translateY(${(1 - line1) * 20}px) rotate(-2deg)`,
          }}
        >
          it's not your skincare...
        </div>
        <div
          style={{
            fontFamily: roundFont,
            fontWeight: 600,
            fontSize: 74,
            color: '#fff',
            textShadow: `0 6px 0 ${C.rose}, 0 10px 24px rgba(60,20,50,0.45)`,
            marginTop: 12,
            opacity: line2 * fade12,
            transform: `scale(${0.6 + 0.4 * line2})`,
            whiteSpace: 'nowrap',
          }}
        >
          it's how you mix it
        </div>
        {t >= 73.9 && (
          <div
            style={{
              position: 'absolute',
              top: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '18px 40px 22px',
              borderRadius: 999,
              background: `linear-gradient(180deg, #ffffff 0%, ${C.mint} 55%)`,
              border: '6px solid #fff',
              boxShadow: `0 9px 0 ${C.mint}, 0 14px 30px rgba(40,20,40,0.28)`,
              fontFamily: roundFont,
              fontWeight: 600,
              fontSize: 72,
              color: C.plum,
              transform: `scale(${0.5 + 0.5 * line3}) rotate(${-2 + Math.sin(f / 16) * 1.2}deg)`,
              opacity: Math.min(1, line3 * 1.5),
              whiteSpace: 'nowrap',
            }}
          >
            <Check size={72} /> layer them right
          </div>
        )}
        <Sparkle size={50} style={{position: 'absolute', left: 0, top: -6}} delay={5} />
        <Sparkle size={34} style={{position: 'absolute', right: 10, top: 100}} delay={20} speed={1.3} />
        {t >= 74 && <Sparkle size={60} style={{position: 'absolute', right: 30, top: -14}} delay={0} speed={1.4} />}
      </div>
    </TopZone>
  );
};

/* ---------- floating hearts for happy moments ---------- */
const FloatingHearts: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const items = [
    {x: 110, d: 0, s: 38, c: C.rose},
    {x: 820, d: 8, s: 30, c: C.lavender},
    {x: 190, d: 16, s: 26, c: C.pink},
    {x: 760, d: 22, s: 38, c: C.rose},
  ];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((it, i) => {
        const lf = f - it.d;
        if (lf < 0) return null;
        const y = interpolate(lf, [0, durationInFrames], [1150, 700]);
        const o = interpolate(lf, [0, 10, durationInFrames - 30, durationInFrames - 10], [0, 0.9, 0.9, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div key={i} style={{position: 'absolute', left: it.x + Math.sin(lf / 14 + i) * 16, top: y, opacity: o}}>
            <Heart size={it.s} color={it.c} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- section transition: soft sparkle sweep + glow, centred on the jump cut ---------- */
export const SparkleSweep: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = f / durationInFrames;
  const glow = interpolate(f, [0, durationInFrames / 2, durationInFrames], [0, 0.2, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const stars = Array.from({length: 8}).map((_, i) => ({
    y: 300 + ((i * 197) % 1000),
    s: 24 + ((i * 13) % 24),
    lag: (i % 4) * 0.07,
  }));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(255,248,225,1) 0%, rgba(255,230,240,0.6) 45%, rgba(255,255,255,0) 75%)',
          opacity: glow,
        }}
      />
      {stars.map((st, i) => {
        const pp = Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, (p - st.lag) / 0.72)));
        const x = interpolate(pp, [0, 1], [-80, 1160]);
        const o = Math.sin(pp * Math.PI);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: st.y - pp * 100, opacity: o}}>
            <Sparkle size={st.s} delay={i * 7} color={i % 3 === 0 ? C.butter : C.cream} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- timeline ---------- */
// Jump cuts in the source footage (seconds). Section sweeps sit on the cuts so they hide the jump.
export const CUTS = [6.2667, 10.9, 27.3333, 30.1, 39.3, 41.5, 47.3, 55.5, 66.0333];
export const SECTION_CUTS = [10.9, 27.3333, 39.3, 47.3, 55.5, 66.0333];

const S: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <Sequence from={sec(from)} durationInFrames={sec(to) - sec(from)} layout="none">
    {children}
  </Sequence>
);

export const Overlays: React.FC = () => (
  <>
    <S from={0.15} to={6.3}>
      <HookTitle />
    </S>

    <S from={11.4} to={21.45}>
      <ComboCard
        label="combo no.1"
        a={['vitamin C', C.peach]}
        b={['retinol', C.lavender]}
        kind="bad"
        sectionStart={11.4}
        notes={[{at: 18.75, text: 'too harsh!', color: C.pink, icon: <Warn size={46} />}]}
      />
    </S>
    <S from={21.45} to={27.3}>
      <DayNight start={21.45} />
    </S>

    <S from={27.4} to={39.25}>
      <ComboCard
        label="combo no.2"
        a={['vitamin C', C.peach]}
        b={['niacinamide', C.mint]}
        kind="good"
        sectionStart={27.4}
        notes={[
          {at: 31.2, text: 'good combo', color: C.mint, icon: <Heart size={42} />},
          {at: 32.9, text: 'brightens skin', color: C.butter, icon: <Sparkle size={42} color="#fff" />},
          {at: 35.8, text: 'fades dark spots', color: C.pink, icon: <Sparkle size={42} color="#fff" />},
        ]}
      />
    </S>
    <S from={31.2} to={33.4}>
      <FloatingHearts />
    </S>

    <S from={39.45} to={47.25}>
      <ComboCard
        label="combo no.3"
        a={['retinol', C.lavender]}
        b={['BHA', C.sky]}
        kind="bad"
        sectionStart={39.45}
        notes={[
          {at: 41.3, text: 'be careful!', color: C.pink, icon: <Warn size={46} />},
          {at: 44.2, text: 'dryness + irritation', color: C.peach},
          {at: 45.85, text: 'alternate nights', color: C.lavender, icon: <Moon size={44} />},
        ]}
      />
    </S>

    <S from={47.45} to={55.45}>
      <ComboCard
        label="combo no.4"
        a={['retinol', C.lavender]}
        b={['niacinamide', C.mint]}
        kind="good"
        sectionStart={47.45}
        notes={[
          {at: 50.2, text: 'great combo', color: C.mint, icon: <Heart size={42} />},
          {at: 52.35, text: 'calms skin', color: C.sky, icon: <Sparkle size={42} color="#fff" />},
          {at: 53.6, text: 'skin barrier', color: C.butter, icon: <Shield size={44} />},
        ]}
      />
    </S>
    <S from={50.2} to={52.4}>
      <FloatingHearts />
    </S>

    <S from={55.65} to={65.95}>
      <ComboCard
        label="the bestie"
        a={['hyaluronic acid', C.sky]}
        kind="solo"
        soloIcon={<Droplet size={50} />}
        sectionStart={55.65}
        notes={[
          {at: 58.0, text: 'super flexible', color: C.butter, icon: <Sparkle size={42} color="#fff" />},
          {at: 60.3, text: 'pairs with almost anything', color: C.mint},
          {at: 64.1, text: 'hydrated skin', color: C.sky, icon: <Droplet size={34} />},
        ]}
      />
    </S>

    <S from={66.15} to={76.8}>
      <Outro start={66.15} />
    </S>

    {SECTION_CUTS.map((s) => (
      <S key={s} from={s - 0.4} to={s + 0.45}>
        <SparkleSweep />
      </S>
    ))}
  </>
);

export {SAFE_CENTER_X};
