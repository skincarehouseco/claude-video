import React from 'react';
import {AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cross, Droplet, Heart, Moon, Plus, Shield, Sparkle, Sun, Warn} from './Icons';
import {C, pixelFont, SAFE, SAFE_CENTER_X, sec, serifFont, captionFont} from './theme';

/* ---------- animation helpers ---------- */
const usePop = (delay = 0, cfg = {damping: 11, stiffness: 170, mass: 0.7}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: cfg});
};
// fades/shrinks everything out over the last `len` frames of the parent Sequence
const useExit = (len = 9) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return interpolate(f, [durationInFrames - len, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
const useFloat = (amp = 6, period = 50, phase = 0) => {
  const f = useCurrentFrame();
  return Math.sin((f + phase) / (period / (2 * Math.PI))) * amp;
};

const TOP_ZONE_Y = SAFE.top + 20; // titles live in the empty wall area above the head

/* ---------- building blocks ---------- */
const Pill: React.FC<{text: string; bg: string; delay: number; icon?: React.ReactNode; tilt?: number}> = ({
  text,
  bg,
  delay,
  icon,
  tilt = 0,
}) => {
  const p = usePop(delay);
  const fl = useFloat(5, 60, delay * 7);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 28px 16px',
        borderRadius: 999,
        background: bg,
        border: '5px solid #fff',
        boxShadow: '0 8px 0 rgba(74,58,78,0.18), 0 10px 26px rgba(40,20,40,0.25)',
        fontFamily: pixelFont,
        fontSize: 50,
        color: C.ink,
        whiteSpace: 'nowrap',
        transform: `translateY(${(1 - p) * 40 + fl}px) scale(${p}) rotate(${tilt * p}deg)`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      {icon}
      {text}
    </div>
  );
};

const Operator: React.FC<{kind: 'bad' | 'good'; delay: number}> = ({kind, delay}) => {
  const p = usePop(delay, {damping: 8, stiffness: 200, mass: 0.6});
  const f = useCurrentFrame();
  const wob = kind === 'bad' ? Math.sin(f / 4) * 6 * Math.max(0, 1 - (f - delay) / 40) : 0;
  return (
    <div style={{transform: `scale(${p}) rotate(${(1 - p) * -90 + wob}deg)`, margin: '0 -6px', zIndex: 2}}>
      {kind === 'bad' ? <Cross size={74} /> : <Plus size={74} />}
    </div>
  );
};

const Label: React.FC<{text: string; delay?: number}> = ({text, delay = 0}) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        fontFamily: serifFont,
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 52,
        color: C.butter,
        textShadow: '0 2px 0 rgba(91,70,54,0.7), 0 4px 16px rgba(40,25,30,0.45)',
        transform: `translateY(${(1 - p) * -24}px) rotate(-4deg)`,
        opacity: p,
        marginBottom: 6,
      }}
    >
      {text}
    </div>
  );
};

type Note = {at: number; text: string; color: string; icon?: React.ReactNode};
// one "sticker" slot under the pills that swaps between short notes (keeps screen uncluttered)
const NoteSlot: React.FC<{notes: Note[]; sectionStart: number}> = ({notes, sectionStart}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps + sectionStart;
  let idx = -1;
  notes.forEach((n, i) => {
    if (t >= n.at) idx = i;
  });
  if (idx < 0) return <div style={{height: 86}} />;
  const n = notes[idx];
  const local = f - Math.round((n.at - sectionStart) * fps);
  const p = spring({frame: local, fps, config: {damping: 9, stiffness: 220, mass: 0.6}});
  const fl = Math.sin(f / 9) * 2;
  return (
    <div style={{height: 86, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 18}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 26px 10px',
          borderRadius: 20,
          background: n.color,
          border: '4px dashed rgba(255,255,255,0.95)',
          boxShadow: '0 8px 22px rgba(40,20,40,0.25)',
          fontFamily: captionFont,
          fontSize: 46,
          color: C.ink,
          transform: `scale(${p}) rotate(${(idx % 2 ? 3 : -3) + fl}deg)`,
          opacity: Math.min(1, p * 1.6),
          whiteSpace: 'nowrap',
        }}
      >
        {n.icon}
        {n.text}
      </div>
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
          width: SAFE.right - SAFE.left,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: ex,
          transform: `scale(${0.85 + 0.15 * ex}) translateY(${(1 - ex) * -30}px)`,
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
}> = ({label, a, b, kind, notes, sectionStart, soloIcon}) => (
  <TopZone>
    <Label text={label} />
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', gap: 0}}>
      <Pill text={a[0]} bg={a[1]} delay={4} tilt={-3} icon={soloIcon} />
      {kind !== 'solo' && b && (
        <>
          <Operator kind={kind === 'bad' ? 'bad' : 'good'} delay={10} />
          <Pill text={b[0]} bg={b[1]} delay={14} tilt={3} />
        </>
      )}
    </div>
    <NoteSlot notes={notes} sectionStart={sectionStart} />
    <Sparkle size={44} style={{position: 'absolute', left: 30, top: 6}} delay={3} />
    <Sparkle size={30} style={{position: 'absolute', right: 40, top: 30}} delay={17} speed={1.4} />
  </TopZone>
);

const HookTitle: React.FC = () => {
  const f = useCurrentFrame();
  const word = "don't mix these!";
  const sub = usePop(16);
  return (
    <TopZone>
      <div style={{display: 'flex', position: 'relative'}}>
        {word.split('').map((ch, i) => {
          const p = spring({frame: f - 2 - i * 1.4, fps: 30, config: {damping: 9, stiffness: 200, mass: 0.5}});
          const bob = Math.sin((f + i * 5) / 8) * 4;
          return (
            <span
              key={i}
              style={{
                fontFamily: pixelFont,
                fontSize: 92,
                color: '#fff',
                display: 'inline-block',
                whiteSpace: 'pre',
                textShadow: `0 6px 0 ${C.rose}, 0 10px 24px rgba(60,20,50,0.4)`,
                transform: `translateY(${(1 - p) * -60 + bob}px) scale(${p})`,
                opacity: Math.min(1, p * 1.6),
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: serifFont,
          fontStyle: 'italic',
          fontSize: 56,
          color: C.butter,
          marginTop: 6,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 20}px) rotate(-3deg)`,
          textShadow: '0 2px 0 rgba(91,70,54,0.7), 0 4px 16px rgba(40,25,30,0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <Heart size={36} /> skincare edition <Heart size={36} color={C.lavender} />
      </div>
      <Sparkle size={50} style={{position: 'absolute', left: 10, top: -16}} delay={0} />
      <Sparkle size={34} style={{position: 'absolute', right: 20, top: 4}} delay={11} speed={1.3} />
      <Sparkle size={26} style={{position: 'absolute', right: 70, top: 120}} delay={23} speed={0.8} />
    </TopZone>
  );
};

const AmPm: React.FC = () => {
  const a = usePop(2);
  const b = usePop(9);
  const card = (p: number, icon: React.ReactNode, when: string, what: string, bg: string, tilt: number) => (
    <div
      style={{
        width: 330,
        padding: '16px 10px 20px',
        borderRadius: 34,
        background: bg,
        border: '5px solid #fff',
        boxShadow: '0 8px 0 rgba(74,58,78,0.18), 0 10px 26px rgba(40,20,40,0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${p}) rotate(${tilt}deg)`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      {icon}
      <div style={{fontFamily: pixelFont, fontSize: 46, color: C.ink, marginTop: 4}}>{when}</div>
      <div style={{fontFamily: captionFont, fontSize: 44, color: C.ink}}>{what}</div>
    </div>
  );
  return (
    <TopZone>
      <Label text="the fix" />
      <div style={{display: 'flex', gap: 40}}>
        {card(a, <Sun size={64} />, 'AM', 'vitamin C', C.peach, -3)}
        {card(b, <Moon size={64} />, 'PM', 'retinol', C.lavender, 3)}
      </div>
    </TopZone>
  );
};

const Outro: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps + start;
  const line1 = usePop(2);
  const line2 = usePop(Math.round((70.2 - start) * fps));
  const line3 = usePop(Math.round((74.0 - start) * fps), {damping: 8, stiffness: 160, mass: 0.7});
  const fade12 = interpolate(t, [73.6, 74.0], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const txt: React.CSSProperties = {
    fontFamily: serifFont,
    fontStyle: 'italic',
    fontSize: 54,
    color: C.butter,
    textShadow: '0 2px 0 rgba(91,70,54,0.7), 0 4px 16px rgba(40,25,30,0.45)',
    textAlign: 'center',
  };
  return (
    <TopZone>
      <div style={{position: 'relative', width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...txt, opacity: line1 * fade12, transform: `translateY(${(1 - line1) * 20}px)`}}>
          it's not your skincare...
        </div>
        <div
          style={{
            ...txt,
            fontFamily: pixelFont,
            fontStyle: 'normal',
            fontSize: 60,
            color: '#fff',
            textShadow: `0 5px 0 ${C.rose}, 0 8px 20px rgba(60,20,50,0.4)`,
            marginTop: 10,
            opacity: line2 * fade12,
            transform: `scale(${line2})`,
          }}
        >
          it's how you mix it
        </div>
        {t >= 73.8 && (
          <div
            style={{
              position: 'absolute',
              top: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 34px 20px',
              borderRadius: 999,
              background: C.mint,
              border: '5px solid #fff',
              boxShadow: '0 8px 0 rgba(74,58,78,0.18), 0 10px 26px rgba(40,20,40,0.25)',
              fontFamily: pixelFont,
              fontSize: 54,
              color: C.ink,
              transform: `scale(${line3}) rotate(${-2 + Math.sin(f / 10) * 1.5}deg)`,
              opacity: Math.min(1, line3 * 1.5),
              whiteSpace: 'nowrap',
            }}
          >
            <Check size={60} /> layer them right
          </div>
        )}
        <Sparkle size={44} style={{position: 'absolute', left: 20, top: 0}} delay={5} />
        <Sparkle size={30} style={{position: 'absolute', right: 30, top: 90}} delay={20} speed={1.3} />
        {t >= 74 && <Sparkle size={56} style={{position: 'absolute', right: 60, top: -10}} delay={0} speed={1.6} />}
      </div>
    </TopZone>
  );
};

/* ---------- floating hearts for happy moments ---------- */
const FloatingHearts: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const items = [
    {x: 120, d: 0, s: 34, c: C.rose},
    {x: 840, d: 8, s: 28, c: C.lavender},
    {x: 200, d: 16, s: 24, c: C.pink},
    {x: 780, d: 22, s: 36, c: C.rose},
  ];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((it, i) => {
        const lf = f - it.d;
        if (lf < 0) return null;
        const y = interpolate(lf, [0, durationInFrames], [1150, 650]);
        const o = interpolate(lf, [0, 8, durationInFrames - 30, durationInFrames - 10], [0, 0.9, 0.9, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div key={i} style={{position: 'absolute', left: it.x + Math.sin(lf / 10 + i) * 18, top: y, opacity: o}}>
            <Heart size={it.s} color={it.c} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- section transition: sparkle sweep + soft glow ---------- */
export const SparkleSweep: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = f / durationInFrames;
  const glow = interpolate(f, [0, 4, durationInFrames], [0, 0.22, 0], {extrapolateRight: 'clamp'});
  const stars = Array.from({length: 9}).map((_, i) => ({
    y: 260 + ((i * 197) % 1100),
    s: 22 + ((i * 13) % 26),
    lag: (i % 4) * 0.08,
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
        const pp = Math.min(1, Math.max(0, (p - st.lag) / (1 - 0.3)));
        const x = interpolate(pp, [0, 1], [-80, 1160]);
        const o = Math.sin(pp * Math.PI);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: st.y - pp * 120, opacity: o}}>
            <Sparkle size={st.s} delay={i * 7} color={i % 3 === 0 ? C.butter : C.cream} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- timeline ---------- */
export const SECTION_STARTS = [11.35, 27.15, 39.45, 47.75, 55.7, 65.95];

const S: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <Sequence from={sec(from)} durationInFrames={sec(to) - sec(from)} layout="none">
    {children}
  </Sequence>
);

export const Overlays: React.FC = () => (
  <>
    <S from={0.15} to={6.5}>
      <HookTitle />
    </S>

    <S from={11.4} to={21.55}>
      <ComboCard
        label="combo no.1"
        a={['vitamin C', C.peach]}
        b={['retinol', C.lavender]}
        kind="bad"
        sectionStart={11.4}
        notes={[{at: 18.75, text: 'too harsh!', color: C.pink, icon: <Warn />}]}
      />
    </S>
    <S from={21.6} to={26.95}>
      <AmPm />
    </S>

    <S from={27.2} to={39.3}>
      <ComboCard
        label="combo no.2"
        a={['vitamin C', C.peach]}
        b={['niacinamide', C.mint]}
        kind="good"
        sectionStart={27.2}
        notes={[
          {at: 31.2, text: 'good combo', color: C.mint, icon: <Heart size={34} />},
          {at: 32.9, text: 'brightens skin', color: C.butter, icon: <Sparkle size={34} color="#fff" />},
          {at: 35.8, text: 'fades dark spots', color: C.pink, icon: <Sparkle size={34} color="#fff" />},
        ]}
      />
    </S>
    <S from={31.2} to={33.2}>
      <FloatingHearts />
    </S>

    <S from={39.5} to={47.55}>
      <ComboCard
        label="combo no.3"
        a={['retinol', C.lavender]}
        b={['BHA', C.sky]}
        kind="bad"
        sectionStart={39.5}
        notes={[
          {at: 41.25, text: 'be careful!', color: C.pink, icon: <Warn />},
          {at: 44.2, text: 'dryness + irritation', color: C.peach},
          {at: 45.85, text: 'alternate nights', color: C.lavender, icon: <Moon size={36} />},
        ]}
      />
    </S>

    <S from={47.8} to={55.5}>
      <ComboCard
        label="combo no.4"
        a={['retinol', C.lavender]}
        b={['niacinamide', C.mint]}
        kind="good"
        sectionStart={47.8}
        notes={[
          {at: 50.2, text: 'great combo', color: C.mint, icon: <Heart size={34} />},
          {at: 52.35, text: 'calms skin', color: C.sky, icon: <Sparkle size={34} color="#fff" />},
          {at: 53.6, text: 'supports skin barrier', color: C.butter, icon: <Shield size={36} />},
        ]}
      />
    </S>
    <S from={50.2} to={52.2}>
      <FloatingHearts />
    </S>

    <S from={55.8} to={65.6}>
      <ComboCard
        label="the bestie"
        a={['hyaluronic acid', C.sky]}
        kind="solo"
        soloIcon={<Droplet size={40} />}
        sectionStart={55.8}
        notes={[
          {at: 58.0, text: 'super flexible', color: C.butter, icon: <Sparkle size={34} color="#fff" />},
          {at: 60.3, text: 'pairs with almost anything', color: C.mint},
          {at: 64.1, text: 'hydrated skin', color: C.sky, icon: <Droplet size={28} />},
        ]}
      />
    </S>

    <S from={66.05} to={76.8}>
      <Outro start={66.05} />
    </S>

    {SECTION_STARTS.map((s) => (
      <S key={s} from={s - 0.3} to={s + 0.6}>
        <SparkleSweep />
      </S>
    ))}
  </>
);

export {SAFE_CENTER_X};
