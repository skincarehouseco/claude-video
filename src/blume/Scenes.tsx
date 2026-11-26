import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {toScreen} from './layout';
import {C, FPS, H, HAND, life, pop, popSoft, prog, ramp, rnd, S, SANS, SectionKey, SERIF, SERIF_I, W} from './theme';
import {RoomBathroom, RoomEvening, RoomGifts, RoomMorning, RoomShopping, RoomStore, RoomStudio, RoomTowel, RoomVanity} from './Rooms';
import {Bag, Card, Check, Chip, CurvedArrow, Drop, Face, Gift, HandNote, Lock, Palm, Person, PumpBottle, Sparkle, SprayIcon, StepTag, Underline} from './ui';

/* ========================================================================================
 * Backgrounds — each one is designed for what is being said in that section.
 * ====================================================================================== */

const Blob: React.FC<{x: number; y: number; r: number; color: string; t: number; ph?: number; o?: number}> = ({x, y, r, color, t, ph = 0, o = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r + Math.sin(t * 0.6 + ph) * 20,
      top: y - r + Math.cos(t * 0.5 + ph) * 24,
      width: r * 2,
      height: r * 2,
      borderRadius: '46% 54% 58% 42% / 50% 44% 56% 50%',
      background: color,
      filter: 'blur(30px)',
      opacity: o,
      transform: `rotate(${t * 8 + ph * 40}deg)`,
    }}
  />
);

/** soft glossy translucent bubbles drifting up */
const Bubbles: React.FC<{t: number; n?: number; color?: string; speed?: number; seed?: number; big?: number}> = ({t, n = 14, color = 'rgba(255,255,255,0.55)', speed = 60, seed = 1, big = 1}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const r = (18 + rnd(i * 3 + seed) * 46) * big;
      const x = rnd(i * 7 + seed) * W;
      const y = ((rnd(i * 11 + seed) * (H + 300) - t * speed * (0.6 + rnd(i + seed))) % (H + 300) + H + 300) % (H + 300) - 150;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + Math.sin(t * 1.3 + i) * 14,
            top: y,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.95) 0 12%, ${color} 40%, rgba(255,255,255,0.08) 72%)`,
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.7)',
          }}
        />
      );
    })}
  </>
);

const Dots: React.FC<{color: string; gap?: number; o?: number}> = ({color, gap = 46, o = 0.5}) => (
  <AbsoluteFill style={{backgroundImage: `radial-gradient(${color} 2.6px, transparent 3px)`, backgroundSize: `${gap}px ${gap}px`, opacity: o}} />
);

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.0) 55%, rgba(150,90,110,0.12) 100%)',
    }}
  />
);

const BgHook: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.peach} 0%, #FFD0C2 45%, ${C.blushDeep} 100%)`}}>
    <Blob x={180} y={420} r={260} color="#FFB59E" t={t} o={0.7} />
    <Blob x={900} y={1250} r={300} color={C.rose} t={t} ph={2} o={0.45} />
    {/* editorial arch behind the speaker */}
    <div
      style={{
        position: 'absolute',
        left: 150,
        top: 520 - 40 * prog(t, 0, 0.8),
        width: 780,
        height: 1500,
        borderRadius: '390px 390px 0 0',
        background: 'linear-gradient(180deg, rgba(255,249,243,0.95) 0%, rgba(255,236,228,0.6) 100%)',
        boxShadow: '0 0 0 14px rgba(255,255,255,0.35)',
      }}
    />
    <Bubbles t={t} n={10} color="rgba(255,190,170,0.45)" speed={70} />
    <Grain />
  </AbsoluteFill>
);

const BgHello: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.blush} 0%, #FDEFF2 60%, ${C.lilac} 100%)`}}>
    <Blob x={120} y={300} r={240} color={C.lilacMid} t={t} o={0.6} />
    <Blob x={960} y={500} r={220} color={C.blushDeep} t={t} ph={1} o={0.7} />
    {/* soft concentric "hello" waves radiating from behind */}
    {[0, 1, 2, 3].map((i) => {
      const k = ((t * 0.5 + i * 0.25) % 1);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 540 - 300 - k * 500,
            top: 560 - 300 - k * 500,
            width: 600 + k * 1000,
            height: 600 + k * 1000,
            borderRadius: '50%',
            border: `4px solid rgba(232,135,159,${0.35 * (1 - k)})`,
          }}
        />
      );
    })}
    <Grain />
  </AbsoluteFill>
);

const BgGuide: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.lilac} 0%, #F4EEFC 50%, ${C.blush} 100%)`}}>
    <Dots color="rgba(149,131,204,0.35)" />
    <Blob x={900} y={300} r={260} color={C.lilacMid} t={t} o={0.7} />
    <Blob x={150} y={1500} r={260} color={C.blushDeep} t={t} ph={3} o={0.6} />
    {/* notebook margin line */}
    <div style={{position: 'absolute', left: 52, top: 0, width: 3, height: H, background: 'rgba(217,79,114,0.25)'}} />
    <Grain />
  </AbsoluteFill>
);

const BgCleanse: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.sky} 0%, #EEF5FD 55%, ${C.lilac} 100%)`}}>
    {/* rounded bathroom tiles */}
    <AbsoluteFill
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.85) 4px, transparent 4px), linear-gradient(90deg, rgba(255,255,255,0.85) 4px, transparent 4px)',
        backgroundSize: '120px 120px',
        opacity: 0.8,
      }}
    />
    <Blob x={200} y={1200} r={300} color={C.skyMid} t={t} o={0.6} />
    <Blob x={900} y={200} r={220} color="#CFE3FA" t={t} ph={2} o={0.8} />
    <Bubbles t={t} n={22} color="rgba(190,215,242,0.55)" speed={110} seed={4} />
    <Grain />
  </AbsoluteFill>
);

const BgDry: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 25% 22%, #FFFBEA 0%, ${C.butter} 45%, #FCE3A8 100%)`, overflow: 'hidden'}}>
    {/* slow sun rays (warm air = drying) */}
    <div style={{position: 'absolute', left: 270 - 1200, top: 420 - 1200, width: 2400, height: 2400, transform: `rotate(${t * 6}deg)`}}>
      {Array.from({length: 16}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 1200 - 60,
            top: 0,
            width: 120,
            height: 1200,
            transformOrigin: '60px 1200px',
            transform: `rotate(${i * 22.5}deg)`,
            background: 'linear-gradient(0deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.35) 100%)',
            clipPath: 'polygon(40% 100%, 60% 100%, 100% 0, 0 0)',
          }}
        />
      ))}
    </div>
    <Blob x={900} y={1500} r={280} color="#FFD58A" t={t} o={0.5} />
    <Grain />
  </AbsoluteFill>
);

const BgProduct: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(165deg, #FFE9DD 0%, ${C.peachMid} 55%, #F7A792 100%)`}}>
    <Blob x={260} y={760} r={320} color="#FFF4EC" t={t} o={0.85} />
    <Blob x={900} y={300} r={240} color="#FFB9A3" t={t} ph={2} o={0.6} />
    {/* glossy podium for the product */}
    <div style={{position: 'absolute', left: 50, top: 1120, width: 260, height: 70, borderRadius: '50%', background: 'linear-gradient(180deg, #FFF8F3, #FFD9C8)', boxShadow: '0 20px 40px rgba(200,90,70,0.25)'}} />
    <Bubbles t={t} n={8} color="rgba(255,170,150,0.4)" speed={50} seed={9} />
    <Grain />
  </AbsoluteFill>
);

const BgTwoNumeral: React.FC<{t: number}> = ({t}) => {
  const a = S.two[0];
  const p = pop(t, a + 1.25, {damping: 14, stiffness: 120, mass: 0.9}); // "dua" at 15.06
  return (
    <AbsoluteFill>
      {/* giant numeral BEHIND the speaker */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 120,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 900,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.75)',
          WebkitTextStroke: `4px ${C.lilacDeep}`,
          opacity: p,
          transform: `translateY(${(1 - p) * 120}px) scale(${0.85 + 0.15 * p})`,
        }}
      >
        2
      </div>
    </AbsoluteFill>
  );
};

const BgWay1: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(200deg, ${C.sky} 0%, #F3EEFB 50%, ${C.blush} 100%)`}}>
    <Blob x={950} y={1300} r={320} color={C.skyMid} t={t} o={0.6} />
    <Blob x={200} y={500} r={260} color="#FFFFFF" t={t} ph={1} o={0.8} />
    <Grain />
  </AbsoluteFill>
);

const BgWay2: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, #FFF3EC 0%, ${C.peach} 50%, ${C.blushDeep} 100%)`}}>
    <Dots color="rgba(240,122,98,0.25)" gap={54} />
    <Blob x={540} y={900} r={360} color="#FFFFFF" t={t} o={0.6} />
    <Grain />
  </AbsoluteFill>
);

const BgLock: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.cream} 0%, ${C.beige} 60%, ${C.blush} 100%)`}}>
    <Blob x={150} y={300} r={240} color={C.butter} t={t} o={0.8} />
    <Blob x={900} y={1500} r={260} color={C.blushDeep} t={t} ph={2} o={0.6} />
    <Grain />
  </AbsoluteFill>
);

const BgPromo: React.FC<{t: number}> = ({t}) => {
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #FCE0E7 0%, #F6B8C8 55%, ${C.cherry} 140%)`}}>
      <Blob x={150} y={250} r={240} color="#FFFFFF" t={t} o={0.55} />
      <Grain />
    </AbsoluteFill>
  );
};

const BgFree: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(120deg, ${C.butter} 0%, #FFF6DA 45%, ${C.blush} 55%, ${C.blushDeep} 100%)`}}>
    <Blob x={200} y={1100} r={280} color="#FFE58F" t={t} o={0.6} />
    <Blob x={880} y={700} r={260} color={C.rose} t={t} ph={2} o={0.35} />
    {/* sparkle confetti after "free" */}
    {Array.from({length: 26}).map((_, i) => {
      const at = 29.62 + rnd(i) * 0.25;
      const p = prog(t, at, at + 1.2, (x) => x);
      if (p <= 0) return null;
      const ang = rnd(i + 5) * Math.PI * 2;
      const dist = 200 + rnd(i + 9) * 500;
      return (
        <Sparkle
          key={i}
          t={t}
          phase={i}
          size={26 + rnd(i + 2) * 30}
          color={i % 3 === 0 ? C.butterDeep : i % 3 === 1 ? '#fff' : C.rose}
          style={{position: 'absolute', left: 540 + Math.cos(ang) * dist * p, top: 700 + Math.sin(ang) * dist * p + p * p * 200, opacity: 1 - p}}
        />
      );
    })}
    <Grain />
  </AbsoluteFill>
);

const BgCta: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 35%, #FFF6F1 0%, ${C.peach} 40%, ${C.rose} 120%)`}}>
    {Array.from({length: 3}).map((_, i) => {
      const k = (t * 0.7 + i / 3) % 1;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 540 - (300 + k * 900) / 2,
            top: 600 - (300 + k * 900) / 2,
            width: 300 + k * 900,
            height: 300 + k * 900,
            borderRadius: '50%',
            border: `5px solid rgba(255,255,255,${0.6 * (1 - k)})`,
          }}
        />
      );
    })}
    <Bubbles t={t} n={12} color="rgba(255,200,190,0.5)" speed={90} seed={21} />
    <Grain />
  </AbsoluteFill>
);

/* ========================================================================================
 * Foreground infographics
 * ====================================================================================== */

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});

const FgHook: React.FC<{t: number}> = ({t}) => {
  const words = ['Macam', 'mana', 'nak', 'pakai?'];
  const at = [0.0, 0.32, 0.46, 0.56];
  const pName = pop(t, 0.76);
  return (
    <>
      <div style={abs(70, 175, {width: 835, display: 'flex', flexDirection: 'column', alignItems: 'center'})}>
        <div style={{display: 'flex', gap: 16}}>
          {words.map((w, i) => {
            const p = pop(t, at[i] + 0.05, {damping: 12, stiffness: 180, mass: 0.55});
            return (
              <span
                key={i}
                style={{
                  fontFamily: i === 3 ? SERIF_I : SERIF,
                  fontStyle: i === 3 ? 'italic' : 'normal',
                  fontWeight: 600,
                  fontSize: 76,
                  color: i === 3 ? C.cherry : C.ink,
                  display: 'inline-block',
                  opacity: Math.min(1, p * 1.5),
                  transform: `translateY(${(1 - p) * 40}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 8,
            padding: '12px 34px',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #F06A4E, #F49A7E)',
            color: '#fff',
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: 1,
            boxShadow: '0 12px 30px rgba(226,85,62,0.35)',
            opacity: pName,
            transform: `scale(${0.6 + 0.4 * pName})`,
          }}
        >
          Blumé Bright Toner Mist
        </div>
      </div>
      <Sparkle t={t} size={46} color="#fff" style={abs(860, 260, {opacity: pop(t, 0.9)})} />
      <Sparkle t={t} size={30} phase={2} color={C.cherry} style={abs(110, 250, {opacity: pop(t, 1.1)})} />
    </>
  );
};

/** small, consistent step marker (top-left) */
const StepChip: React.FC<{t: number; at: number; n: number; label: string; color: string}> = ({t, at, n, label, color}) => {
  const p = pop(t, at, {damping: 14, stiffness: 170, mass: 0.6});
  return (
    <div style={abs(70, 175, {display: 'flex', alignItems: 'center', gap: 14, padding: '10px 26px 10px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.9)', boxShadow: '0 10px 26px rgba(120,60,80,0.18)', opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * -40}px) scale(${0.8 + 0.2 * p})`, transformOrigin: 'left center'})}>
      <div style={{width: 58, height: 58, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 34}}>{n}</div>
      <div style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 44, color: C.ink, whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  );
};

const FgHello: React.FC<{t: number}> = ({t}) => (
  <div style={abs(70, 175, {width: 835, display: 'flex', justifyContent: 'center'})}>
    <HandNote t={t} at={2.0} text="hello everyone!" size={88} color={C.cherry} rot={-3} cps={30} />
  </div>
);

// she points up-left (4.0 – 5.2 s): the note appears where she points
const FgGuide: React.FC<{t: number}> = ({t}) => (
  <div style={abs(80, 250, {opacity: life(t, 3.9, 5.95)})}>
    <HandNote t={t} at={3.95} text="cara pakai ✿" size={66} color={C.dusty} rot={-8} cps={20} />
  </div>
);

const FgCleanse: React.FC<{t: number}> = ({t}) => (
  <>
    <StepChip t={t} at={6.0} n={1} label="Cuci muka" color={C.skyDeep} />
    <Bubbles t={t} n={9} color="rgba(191,215,242,0.5)" speed={120} seed={7} big={0.7} />
    <div style={abs(110, 290, {opacity: life(t, 7.86, 8.75)})}>
      <HandNote t={t} at={7.86} text="gentle cleanser" size={54} color={C.skyDeep} rot={-5} cps={30} />
    </div>
  </>
);

const FgDry: React.FC<{t: number}> = ({t}) => {
  const fill = ramp(t, [9.15, 10.35], [0, 100]);
  const done = pop(t, 10.4, {damping: 11, stiffness: 200, mass: 0.6});
  return (
    <>
      <StepChip t={t} at={8.74} n={2} label="Tunggu kering" color={C.butterDeep} />
      {/* playful loading bar */}
      <Card t={t} at={9.05} style={{position: 'absolute', left: 70, top: 1130, width: 380, padding: '18px 24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink}}>
          <span>skin drying…</span>
          <span style={{color: C.cherry}}>{Math.round(fill)}%</span>
        </div>
        <div style={{marginTop: 14, height: 26, borderRadius: 20, background: '#F7EED6', overflow: 'hidden'}}>
          <div style={{width: `${fill}%`, height: '100%', borderRadius: 20, background: `repeating-linear-gradient(-45deg, ${C.butterDeep} 0 18px, #F7DD86 18px 36px)`, backgroundPosition: `${t * 60}px 0`}} />
        </div>
      </Card>
      <div style={abs(220, 1020, {transform: `scale(${done}) rotate(${-10 * done}deg)`, opacity: Math.min(1, done * 1.5)})}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 26px', borderRadius: 999, background: '#fff', border: `4px solid ${C.cherry}`, fontFamily: HAND, fontWeight: 700, fontSize: 56, color: C.cherry}}>
          kering <Check size={44} />
        </div>
      </div>
    </>
  );
};

const FgProduct: React.FC<{t: number}> = ({t}) => (
  <>
    <StepChip t={t} at={10.9} n={3} label="Toner Mist" color={C.coralDeep} />
    {/* glow + sparkles on the real packshot standing on the vanity shelf */}
    <div style={abs(20, 300, {width: 260, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,250,240,0.8) 0%, rgba(255,250,240,0) 70%)', opacity: life(t, 12.3, 13.8)})} />
    <Sparkle t={t} size={40} style={abs(200, 420, {opacity: life(t, 12.44, 13.8)})} />
    <Sparkle t={t} size={28} phase={2} color={C.butter} style={abs(60, 520, {opacity: life(t, 12.6, 13.8)})} />
  </>
);

const FgTwo: React.FC<{t: number}> = ({t}) => (
  <div style={abs(90, 880, {opacity: pop(t, 15.06)})}>
    <HandNote t={t} at={15.1} text="cara" size={110} color={C.lilacDeep} rot={-8} cps={14} />
  </div>
);

const Mist: React.FC<{t: number; from: [number, number]; to: [number, number]; a: number; b: number; n?: number; color?: string; spread?: number}> = ({
  t,
  from,
  to,
  a,
  b,
  n = 40,
  color = 'rgba(255,255,255,0.9)',
  spread = 0.35,
}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const st = a + rnd(i) * (b - a - 0.35);
      const p = prog(t, st, st + 0.45 + rnd(i + 3) * 0.25, (x) => 1 - (1 - x) * (1 - x));
      if (p <= 0 || p >= 1) return null;
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const off = (rnd(i + 7) - 0.5) * spread;
      const x = from[0] + dx * p - dy * off * p;
      const y = from[1] + dy * p + dx * off * p;
      const r = 5 + rnd(i + 11) * 12;
      return (
        <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: color, filter: 'blur(1.5px)', opacity: Math.sin(p * Math.PI) * 0.95}} />
      );
    })}
  </>
);

const FgWay1: React.FC<{t: number}> = ({t}) => {
  const face = toScreen(t, 330, 560);
  return (
    <>
      <div style={abs(560, 230, {opacity: life(t, 15.9, 17.85)})}>
        <HandNote t={t} at={15.95} text="spray direct!" size={64} color={C.skyDeep} rot={4} cps={24} />
      </div>
      {/* fine mist drifting from her extended hand (right) onto her face */}
      <Mist t={t} from={[1000, 1250]} to={[face.x + 40, face.y]} a={16.2} b={17.85} n={70} color="rgba(255,255,255,0.95)" />
      <Mist t={t} from={[1000, 1250]} to={[face.x + 40, face.y]} a={16.3} b={17.85} n={30} color="rgba(191,215,242,0.9)" />
    </>
  );
};

const FgWay2: React.FC<{t: number}> = ({t}) => {
  const nozzle = toScreen(t, 300, 900);
  const palm = toScreen(t, 820, 1110);
  const lc = toScreen(t, 400, 600);
  return (
    <>
      <div style={abs(70, 175, {opacity: life(t, 17.9, 20.8)})}>
        <Chip t={t} at={17.9} text="Cara 2 · spray → tangan → pat" bg="rgba(255,255,255,0.92)" color={C.cherry} size={34} />
      </div>
      {/* spray into the palm (18.3 – 19.0 s) */}
      <Mist t={t} from={[nozzle.x + 40, nozzle.y]} to={[palm.x - 40, palm.y]} a={18.3} b={19.05} n={55} color="rgba(255,255,255,0.95)" spread={0.25} />
      {/* "pat!" bursts in sync with the pats */}
      {[19.9, 20.18, 20.45].map((at, i) => {
        const p = pop(t, at, {damping: 9, stiffness: 260, mass: 0.5});
        const o = life(t, at, at + 0.5, 0.05, 0.2);
        return (
          <div key={i} style={abs(Math.max(70, lc.x - 330 + (i % 2) * 30), lc.y - 80 + i * 70, {opacity: o, transform: `scale(${p}) rotate(${i % 2 ? 8 : -8}deg)`})}>
            <span style={{fontFamily: HAND, fontWeight: 700, fontSize: 76, color: C.cherry, textShadow: '0 3px 0 #fff, 0 6px 16px rgba(255,255,255,0.9)'}}>pat!</span>
          </div>
        );
      })}
    </>
  );
};

const FgLock: React.FC<{t: number}> = ({t}) => {
  const locked = prog(t, 22.35, 22.55);
  const lp = pop(t, 22.2, {damping: 12, stiffness: 180, mass: 0.6});
  return (
    <>
      <StepChip t={t} at={20.86} n={4} label="Moisturizer" color={C.dusty} />
      {/* padlock snaps shut on "lock" */}
      <div style={abs(770, 330, {transform: `scale(${lp}) rotate(${(1 - lp) * 20}deg)`, opacity: life(t, 22.2, 23.75, 0.05)})}>
        <Lock size={110} open={1 - locked} color={C.cherry} />
      </div>
      <div style={abs(700, 480, {opacity: life(t, 22.5, 23.75)})}>
        <HandNote t={t} at={22.5} text="lock it in!" size={56} color={C.cherry} rot={-6} cps={26} />
      </div>
    </>
  );
};

const FgPromo: React.FC<{t: number}> = ({t}) => {
  const n = Math.round(ramp(t, [24.72, 25.4], [0, 50]));
  const p = pop(t, 24.72);
  return (
    <>
      <div style={abs(70, 170, {width: 835, display: 'flex', flexDirection: 'column', alignItems: 'center'})}>
        <HandNote t={t} at={24.4} text="psst… promo!" size={64} color={C.ink} rot={-3} cps={30} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: -6, opacity: p, transform: `scale(${0.7 + 0.3 * p})`}}>
          <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 190, lineHeight: 1, color: C.cherry, textShadow: '0 8px 30px rgba(255,255,255,0.7)'}}>{n}</span>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 62, color: C.ink, lineHeight: 1}}>orang</span>
            <span style={{fontFamily: HAND, fontWeight: 700, fontSize: 64, color: C.cherry, opacity: prog(t, 25.9, 26.1), lineHeight: 1}}>terawal!</span>
          </div>
        </div>
      </div>
    </>
  );
};

const FgFree: React.FC<{t: number}> = ({t}) => {
  const lid = prog(t, 29.62, 29.95, (x) => 1 - (1 - x) * (1 - x));
  const g = pop(t, 28.06);
  const freeP = pop(t, 29.78, {damping: 10, stiffness: 220, mass: 0.55});
  const serumP = pop(t, 28.72, {damping: 14, stiffness: 120, mass: 0.8});
  return (
    <>
      <div style={abs(70, 168, {display: 'flex', alignItems: 'center', gap: 18})}>
        <div style={{transform: `scale(${g}) rotate(${Math.sin(t * 8) * 3 * (1 - lid)}deg)`}}>
          <Gift size={112} lid={lid} />
        </div>
        <div style={{opacity: g, transform: `translateX(${(1 - g) * -30}px)`}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.inkSoft}}>AKAN DAPAT</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 52, color: C.ink, lineHeight: 1.05, opacity: prog(t, 28.72, 28.95)}}>Snowmeric Serum</span>
            <span style={{display: 'inline-block', padding: '2px 20px', borderRadius: 999, background: C.cherry, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 3, transform: `scale(${freeP}) rotate(-4deg)`}}>
              FREE!
            </span>
          </div>
        </div>
      </div>
      {/* official Snowmeric packshot rises beside her head as she names it, sparkles on "free" */}
      <div style={abs(770, 290, {width: 120, height: 310, opacity: life(t, 28.72, 30.15), transform: `translateY(${(1 - serumP) * 120 + Math.sin(t * 2.4) * 8}px) rotate(${(1 - serumP) * 14 + 4}deg) scale(${0.7 + 0.3 * serumP})`})}>
        <div style={{position: 'absolute', left: -70, top: 10, width: 260, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,250,220,0.95) 0%, rgba(255,250,220,0) 68%)'}} />
        <Img src={staticFile('blume/pack_serum.png')} style={{position: 'absolute', left: 24, top: 0, height: 290, filter: 'drop-shadow(0 20px 24px rgba(200,150,40,0.35))'}} />
        <Sparkle t={t} size={36} color="#fff" style={abs(100, -10, {opacity: prog(t, 29.62, 29.8)})} />
        <Sparkle t={t} size={28} phase={2} color={C.butterDeep} style={abs(-10, 150, {opacity: prog(t, 29.62, 29.8)})} />
      </div>
    </>
  );
};

const FgCta: React.FC<{t: number}> = ({t}) => {
  const words = [
    {w: 'Grab', at: 30.14},
    {w: 'yours', at: 30.6},
    {w: 'now!', at: 30.76},
  ];
  return (
    <>
      <div style={abs(70, 215, {width: 835, display: 'flex', justifyContent: 'center', gap: 22})}>
        {words.map((x, i) => {
          const p = pop(t, x.at - 0.04, {damping: 11, stiffness: 200, mass: 0.55});
          return (
            <span
              key={i}
              style={{
                fontFamily: i === 2 ? SERIF_I : SERIF,
                fontStyle: i === 2 ? 'italic' : 'normal',
                fontWeight: 700,
                fontSize: 118,
                color: i === 2 ? C.cherry : C.ink,
                display: 'inline-block',
                textShadow: '0 4px 0 #fff, 0 10px 30px rgba(255,255,255,0.85)',
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${(1 - p) * 60}px) scale(${0.6 + 0.4 * p})`,
              }}
            >
              {x.w}
            </span>
          );
        })}
      </div>
      <div style={abs(300, 357)}>
        <Underline t={t} at={30.9} width={480} color={C.cherry} />
      </div>
      <Sparkle t={t} size={50} style={abs(110, 190, {opacity: pop(t, 30.7)})} />
      <Sparkle t={t} size={40} phase={2} color={C.butter} style={abs(850, 360, {opacity: pop(t, 30.85)})} />
    </>
  );
};

/* ========================================================================================
 * Layer assembly with reveal transitions
 * ====================================================================================== */

const BgTwoRoom: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <RoomVanity t={t} packshot={0} />
    <BgTwoNumeral t={t} />
  </AbsoluteFill>
);

type Sec = {key: SectionKey; Bg: React.FC<{t: number}>; Fg: React.FC<{t: number}>; origin: [number, number]};
export const SECTIONS: Sec[] = [
  {key: 'hook', Bg: BgHook, Fg: FgHook, origin: [540, 600]},
  {key: 'hello', Bg: RoomStudio, Fg: FgHello, origin: [540, 700]},
  {key: 'guide', Bg: RoomStudio, Fg: FgGuide, origin: [200, 300]},
  {key: 'cleanse', Bg: RoomBathroom, Fg: FgCleanse, origin: [150, 900]},
  {key: 'dry', Bg: RoomTowel, Fg: FgDry, origin: [860, 250]},
  {key: 'product', Bg: RoomVanity, Fg: FgProduct, origin: [140, 600]},
  {key: 'two', Bg: BgTwoRoom, Fg: FgTwo, origin: [880, 600]},
  {key: 'way1', Bg: RoomMorning, Fg: FgWay1, origin: [1000, 1250]},
  {key: 'way2', Bg: RoomMorning, Fg: FgWay2, origin: [540, 1300]},
  {key: 'lock', Bg: RoomEvening, Fg: FgLock, origin: [190, 340]},
  {key: 'recap', Bg: RoomEvening, Fg: () => null, origin: [280, 900]},
  {key: 'promo', Bg: RoomStore, Fg: FgPromo, origin: [540, 900]},
  {key: 'free', Bg: RoomGifts, Fg: FgFree, origin: [300, 1100]},
  {key: 'cta', Bg: RoomShopping, Fg: FgCta, origin: [540, 600]},
];
const REVEAL = 0.4; // seconds

const sectionIndex = (t: number) => {
  let i = 0;
  while (i < SECTIONS.length - 1 && t >= S[SECTIONS[i + 1].key][0]) i++;
  return i;
};

export const Backgrounds: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const i = sectionIndex(t);
  const cur = SECTIONS[i];
  const start = S[cur.key][0];
  const p = prog(t, start, start + REVEAL);
  const prev = i > 0 && p < 1 && SECTIONS[i - 1].Bg !== cur.Bg ? SECTIONS[i - 1] : null;
  const r = 2300 * p;
  return (
    <AbsoluteFill>
      {prev && <prev.Bg t={t} />}
      <AbsoluteFill style={{clipPath: prev ? `circle(${r}px at ${cur.origin[0]}px ${cur.origin[1]}px)` : undefined}}>
        <cur.Bg t={t} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const BackgroundTypography: React.FC = () => null;

export const Foregrounds: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {SECTIONS.map((s, i) => {
        const [a, b] = S[s.key];
        if (t < a - 0.05 || t > b + 0.3) return null;
        const out = 1 - prog(t, b - 0.05, b + 0.25);
        return (
          <AbsoluteFill key={i} style={{opacity: out, transform: `translateY(${(1 - out) * -20}px)`}}>
            <s.Fg t={t} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
