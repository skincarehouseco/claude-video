import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {toScreen} from './layout';
import {C, FPS, H, HAND, life, pop, popSoft, prog, ramp, rnd, S, SANS, SectionKey, SERIF, SERIF_I, W} from './theme';
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

const BgTwo: React.FC<{t: number}> = ({t}) => {
  const a = S.two[0];
  const p = pop(t, a + 1.25, {damping: 14, stiffness: 120, mass: 0.9}); // "dua" at 15.06
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.lilac} 0%, ${C.lilacMid} 100%)`}}>
      <Blob x={850} y={350} r={260} color={C.blushDeep} t={t} o={0.6} />
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
      <Grain />
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
      <div style={abs(80, 405, {opacity: pop(t, 1.0)})}>
        <HandNote t={t} at={1.0} text="step-by-step ✿" size={58} color={C.dusty} rot={-6} />
      </div>
      <Sparkle t={t} size={46} color="#fff" style={abs(860, 260, {opacity: pop(t, 0.9)})} />
      <Sparkle t={t} size={30} phase={2} color={C.cherry} style={abs(110, 250, {opacity: pop(t, 1.1)})} />
    </>
  );
};

const FgHello: React.FC<{t: number}> = ({t}) => {
  const l = toScreen(t, 230, 520);
  const r = toScreen(t, 820, 520);
  return (
    <>
      <div style={abs(70, 180, {width: 835, display: 'flex', justifyContent: 'center'})}>
        <HandNote t={t} at={2.0} text="hello everyone!" size={92} color={C.cherry} rot={-3} cps={30} />
      </div>
      {/* little wave strokes beside both raised hands (2.0 – 2.9 s) */}
      {[l, r].map((p, i) => (
        <svg key={i} width={200} height={200} viewBox="0 0 200 200" style={abs(p.x - 100 + (i ? 110 : -110), p.y - 120, {opacity: life(t, 2.05, 2.95)})}>
          {[0, 1, 2].map((k) => (
            <path
              key={k}
              d={i ? `M${60 + k * 26} ${60 - k * 10} C ${90 + k * 26} 90, ${90 + k * 26} 110, ${60 + k * 26} ${140 + k * 10}` : `M${140 - k * 26} ${60 - k * 10} C ${110 - k * 26} 90, ${110 - k * 26} 110, ${140 - k * 26} ${140 + k * 10}`}
              stroke={C.rose}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
              opacity={0.5 + 0.5 * Math.sin(t * 14 - k)}
            />
          ))}
        </svg>
      ))}
    </>
  );
};

const GUIDE = [
  {n: '01', label: 'Cuci muka', c: C.skyDeep, icon: 'clean'},
  {n: '02', label: 'Tunggu kering', c: C.butterDeep, icon: 'dry'},
  {n: '03', label: 'Toner Mist', c: C.coral, icon: 'mist'},
  {n: '04', label: 'Moisturizer', c: C.dusty, icon: 'lock'},
];
const MiniIcon: React.FC<{kind: string; size?: number}> = ({kind, size = 54}) =>
  kind === 'clean' ? <PumpBottle size={size * 0.62} color={C.skyMid} /> : kind === 'dry' ? <Drop size={size * 0.72} color={C.skyDeep} /> : kind === 'mist' ? <SprayIcon size={size * 0.66} /> : <Lock size={size * 0.75} open={0} color={C.rose} />;

const FgGuide: React.FC<{t: number}> = ({t}) => (
  <div style={abs(70, 200, {width: 450})}>
    <div style={{opacity: pop(t, 3.35), transform: `translateY(${(1 - pop(t, 3.35)) * 20}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: C.lilacDeep}}>HARI NI</div>
      <div style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 70, lineHeight: 1.0, color: C.ink, marginTop: 4}}>
        cara pakai
      </div>
      <Underline t={t} at={3.6} width={300} color={C.rose} />
    </div>
    <Card t={t} at={3.55} style={{marginTop: 26, padding: '22px 26px', width: 410}}>
      {GUIDE.map((g, i) => {
        const at = 3.75 + i * 0.32;
        const p = pop(t, at);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderTop: i ? '2px dashed rgba(149,131,204,0.3)' : 'none', opacity: p, transform: `translateX(${(1 - p) * -40}px)`}}>
            <div style={{width: 64, height: 64, borderRadius: 22, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 0 3px ${g.c}`}}>
              <MiniIcon kind={g.icon} />
            </div>
            <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 34, color: g.c, width: 46}}>{g.n}</div>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink}}>{g.label}</div>
          </div>
        );
      })}
    </Card>
  </div>
);

const FgCleanse: React.FC<{t: number}> = ({t}) => {
  const pb = popSoft(t, 6.55);
  const foam = prog(t, 6.9, 8.2);
  return (
    <>
      <div style={abs(70, 190)}>
        <StepTag t={t} at={5.98} n="01" color={C.skyDeep} label="Cuci muka" sub="dulu, okay!" />
      </div>
      {/* cleanser bottle + foam -> clean face */}
      <div style={abs(70, 760, {width: 420, height: 520})}>
        <div style={{position: 'absolute', left: 10, top: 40, opacity: pb, transform: `translateY(${(1 - pb) * 60}px) rotate(${-8 + Math.sin(t * 2) * 2}deg)`}}>
          <PumpBottle size={170} color={C.skyMid} />
        </div>
        {Array.from({length: 9}).map((_, i) => {
          const s = prog(t, 6.9 + i * 0.12, 7.3 + i * 0.12);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 150 + Math.cos(i * 1.7) * 60 + i * 14,
                top: 60 - i * 8 + Math.sin(i * 2.3) * 30,
                width: 40 + (i % 3) * 18,
                height: 40 + (i % 3) * 18,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #fff 0 25%, rgba(220,235,250,0.9) 60%, rgba(191,215,242,0.7))',
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.9)',
                transform: `scale(${s})`,
              }}
            />
          );
        })}
        <div style={{position: 'absolute', left: 230, top: 170, opacity: popSoft(t, 7.1), transform: `scale(${0.7 + 0.3 * popSoft(t, 7.1)})`}}>
          <Face size={150} closed />
          {/* foam on the face */}
          {Array.from({length: 7}).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 20 + (i % 4) * 30,
                top: 40 + Math.floor(i / 4) * 55 + (i % 2) * 10,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #fff, rgba(210,228,248,0.9))',
                transform: `scale(${foam * (0.8 + 0.3 * Math.sin(t * 6 + i))})`,
              }}
            />
          ))}
        </div>
        <svg width={420} height={420} style={abs(0, 0, {overflow: 'visible'})}>
          <CurvedArrow t={t} at={7.2} d="M150 300 C 170 360, 230 380, 280 350" len={200} color={C.skyDeep} head={[280, 350, -30]} />
        </svg>
      </div>
      <div style={abs(80, 1260, {opacity: pop(t, 7.8)})}>
        <Chip t={t} at={7.86} text="gentle cleanser" bg="#fff" color={C.skyDeep} size={36} icon={<Sparkle t={t} size={30} color={C.skyMid} />} />
        <div style={{marginLeft: 70, marginTop: -4}}>
          <Underline t={t} at={7.9} width={180} color={C.skyDeep} />
        </div>
      </div>
    </>
  );
};

const FgDry: React.FC<{t: number}> = ({t}) => {
  const fill = ramp(t, [9.15, 10.35], [0, 100]);
  const done = pop(t, 10.4, {damping: 11, stiffness: 200, mass: 0.6});
  const evap = prog(t, 9.2, 10.4);
  return (
    <>
      <div style={abs(70, 190)}>
        <StepTag t={t} at={8.72} n="02" color={C.butterDeep} label="Tunggu" sub="sampai kering" />
      </div>
      {/* water droplet evaporating into wisps */}
      <div style={abs(110, 760, {width: 340, height: 260})}>
        <div style={{position: 'absolute', left: 110, top: 70, transform: `scale(${1 - 0.75 * evap})`, opacity: 1 - evap * 0.7, transformOrigin: '50% 100%'}}>
          <Drop size={110} color={C.skyDeep} />
        </div>
        {[0, 1, 2].map((i) => {
          const k = ((t * 0.9 + i / 3) % 1) * Math.min(1, evap * 3);
          return (
            <svg key={i} width={60} height={120} viewBox="0 0 60 120" style={abs(80 + i * 60, 60 - k * 90, {opacity: (1 - k) * Math.min(1, evap * 3)})}>
              <path d="M30 110 C 10 90, 50 70, 30 50 C 10 30, 50 20, 30 4" stroke={C.skyMid} strokeWidth="7" fill="none" strokeLinecap="round" />
            </svg>
          );
        })}
      </div>
      {/* playful loading bar */}
      <Card t={t} at={9.05} style={{position: 'absolute', left: 70, top: 1080, width: 410, padding: '22px 26px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink}}>
          <span>skin drying…</span>
          <span style={{color: C.cherry}}>{Math.round(fill)}%</span>
        </div>
        <div style={{marginTop: 14, height: 26, borderRadius: 20, background: '#F7EED6', overflow: 'hidden'}}>
          <div style={{width: `${fill}%`, height: '100%', borderRadius: 20, background: `repeating-linear-gradient(-45deg, ${C.butterDeep} 0 18px, #F7DD86 18px 36px)`, backgroundPosition: `${t * 60}px 0`}} />
        </div>
      </Card>
      <div style={abs(250, 960, {transform: `scale(${done}) rotate(${-10 * done}deg)`, opacity: Math.min(1, done * 1.5)})}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 26px', borderRadius: 999, background: '#fff', border: `4px solid ${C.cherry}`, fontFamily: HAND, fontWeight: 700, fontSize: 56, color: C.cherry}}>
          kering <Check size={44} />
        </div>
      </div>
    </>
  );
};

const FgProduct: React.FC<{t: number}> = ({t}) => {
  const p = popSoft(t, 11.0);
  const float = Math.sin(t * 2.2) * 10;
  return (
    <>
      <div style={abs(70, 190)}>
        <StepTag t={t} at={10.9} n="03" color={C.coralDeep} label="Toner Mist" sub="proceed, babe ✦" />
      </div>
      {/* real packaging cut out from the footage, on a glossy spotlight */}
      <div
        style={abs(30, 640, {
          width: 260,
          height: 600,
          opacity: p,
          transform: `translateY(${(1 - p) * 120 + float}px) rotate(${(1 - p) * -12 + Math.sin(t * 1.4) * 2}deg)`,
        })}
      >
        <div style={{position: 'absolute', left: -20, top: 20, width: 300, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 68%)'}} />
        <Img src={staticFile('blume/product_toner.png')} style={{position: 'absolute', left: 62, top: 0, height: 520, filter: 'drop-shadow(0 26px 30px rgba(180,70,50,0.35))'}} />
        <Sparkle t={t} size={44} style={abs(190, 20)} />
        <Sparkle t={t} size={30} phase={3} color={C.butter} style={abs(20, 200)} />
      </div>
    </>
  );
};

const FgTwo: React.FC<{t: number}> = ({t}) => {
  const bottle = toScreen(t, 905, 560);
  return (
    <>
      <div style={abs(80, 1050, {display: 'flex', flexDirection: 'column', gap: 18})}>
        <Chip t={t} at={15.06} text="Cara 1 · spray direct" bg="#fff" color={C.lilacDeep} size={34} tilt={-2} />
        <Chip t={t} at={15.3} text="Cara 2 · tangan + pat" bg="#fff" color={C.cherry} size={34} tilt={2} />
      </div>
      <div style={abs(90, 860, {opacity: pop(t, 15.06)})}>
        <HandNote t={t} at={15.1} text="cara" size={110} color={C.lilacDeep} rot={-8} cps={14} />
      </div>
      {/* glow tag on the product she is holding */}
      <div style={abs(Math.min(bottle.x - 200, 640), bottle.y - 250, {opacity: pop(t, 14.36)})}>
        <Chip t={t} at={14.36} text="toner mist" bg={C.coral} color="#fff" size={30} />
      </div>
    </>
  );
};

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
      <Card t={t} at={15.85} style={{position: 'absolute', left: 70, top: 1010, width: 380, padding: '22px 26px'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.lilacDeep}}>CARA 1</div>
        <div style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 50, lineHeight: 1.05, color: C.ink, marginTop: 4}}>Spray direct</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 10}}>
          <SprayIcon size={46} />
          <svg width={70} height={20}>
            <path d="M4 10 H60" stroke={C.ink} strokeWidth="4" strokeDasharray="6 8" strokeLinecap="round" />
            <path d="M52 3 L62 10 L52 17" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
          <Face size={56} closed />
          <span style={{fontFamily: HAND, fontWeight: 700, fontSize: 40, color: C.cherry, marginLeft: 6}}>skin</span>
        </div>
      </Card>
      {/* fine mist drifting from her extended hand (right) onto her face */}
      <Mist t={t} from={[1000, 1250]} to={[face.x + 40, face.y]} a={16.2} b={17.85} n={70} color="rgba(255,255,255,0.95)" />
      <Mist t={t} from={[1000, 1250]} to={[face.x + 40, face.y]} a={16.3} b={17.85} n={30} color="rgba(191,215,242,0.9)" />
    </>
  );
};

const FgWay2: React.FC<{t: number}> = ({t}) => {
  const steps = [
    {at: 18.5, label: 'spray', icon: <SprayIcon size={56} />},
    {at: 19.22, label: 'tangan', icon: <Palm size={70} />},
    {at: 19.84, label: 'pat-pat', icon: <Face size={66} closed />},
  ];
  const nozzle = toScreen(t, 300, 900);
  const palm = toScreen(t, 820, 1110);
  const lc = toScreen(t, 400, 600);
  return (
    <>
      <div style={abs(70, 180, {width: 835})}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: pop(t, 17.9)}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.cherry}}>CARA 2</div>
          <div style={{height: 2, flex: 1, background: C.cherry, opacity: 0.3}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 14}}>
          {steps.map((s, i) => {
            const p = pop(t, s.at - 0.1);
            const active = t >= s.at - 0.1 && (i === 2 || t < steps[i + 1].at - 0.1);
            return (
              <React.Fragment key={i}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.35 + 0.65 * p, transform: `scale(${0.85 + 0.15 * p + (active ? 0.05 : 0)})`}}>
                  <div
                    style={{
                      width: 130,
                      height: 130,
                      borderRadius: 44,
                      background: active ? '#fff' : 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: active ? `0 0 0 5px ${C.cherry}, 0 14px 30px rgba(217,79,114,0.3)` : '0 8px 20px rgba(120,60,80,0.12)',
                    }}
                  >
                    {s.icon}
                  </div>
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: active ? C.cherry : C.ink}}>{s.label}</div>
                </div>
                {i < 2 && (
                  <svg width={120} height={60} viewBox="0 0 120 60" style={{marginTop: 34, opacity: prog(t, steps[i + 1].at - 0.3, steps[i + 1].at)}}>
                    <path d="M8 40 C 40 4, 80 4, 108 34" stroke={C.ink} strokeWidth="4" fill="none" strokeDasharray="7 9" strokeLinecap="round" />
                    <path d="M96 34 L110 36 L106 22" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </div>
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
  const L0 = 70;
  const Wd = 420;
  const top = 640;
  const tonerIn = prog(t, 21.0, 21.9);
  const cream = prog(t, 22.1, 22.55);
  const locked = prog(t, 22.35, 22.55);
  const lp = pop(t, 22.2, {damping: 12, stiffness: 180, mass: 0.6});
  return (
    <>
      <div style={abs(70, 190)}>
        <StepTag t={t} at={20.86} n="04" color={C.dusty} label="Lock it in" sub="with a moisturizer" />
      </div>
      {/* skin cross-section */}
      <div style={abs(L0, top, {width: Wd, height: 560})}>
        <svg width={Wd} height={560} viewBox={`0 0 ${Wd} 560`} style={{overflow: 'visible'}}>
          {/* skin */}
          <path d={`M0 360 C 70 340, 140 380, 210 360 C 280 340, 350 380, ${Wd} 360 V 560 H 0 Z`} fill="#F6CDB8" />
          <path d={`M0 420 C 70 400, 140 440, 210 420 C 280 400, 350 440, ${Wd} 420 V 560 H 0 Z`} fill="#EDB59C" />
          {/* toner hydration layer (fills with droplets) */}
          <path d={`M0 ${360 - 60 * tonerIn} C 70 ${340 - 60 * tonerIn}, 140 ${380 - 60 * tonerIn}, 210 ${360 - 60 * tonerIn} C 280 ${340 - 60 * tonerIn}, 350 ${380 - 60 * tonerIn}, ${Wd} ${360 - 60 * tonerIn} V 362 C 350 380, 280 340, 210 362 C 140 380, 70 340, 0 362 Z`} fill="rgba(240,122,98,0.35)" />
          {/* moisturizer seal */}
          <path
            d={`M${-Wd * (1 - cream)} 290 C ${70 - Wd * (1 - cream)} 270, ${140 - Wd * (1 - cream)} 310, ${210 - Wd * (1 - cream)} 290 C ${280 - Wd * (1 - cream)} 270, ${350 - Wd * (1 - cream)} 310, ${Wd - Wd * (1 - cream)} 290 V 250 C ${350 - Wd * (1 - cream)} 230, ${280 - Wd * (1 - cream)} 270, ${210 - Wd * (1 - cream)} 250 C ${140 - Wd * (1 - cream)} 230, ${70 - Wd * (1 - cream)} 270, ${-Wd * (1 - cream)} 250 Z`}
            fill="#FFF8F1"
            stroke={C.rose}
            strokeWidth="4"
          />
        </svg>
        {/* falling toner droplets */}
        {Array.from({length: 7}).map((_, i) => {
          const at = 21.0 + i * 0.11;
          const p = prog(t, at, at + 0.45, (x) => x * x);
          return p > 0 && p < 1 ? (
            <div key={i} style={abs(30 + i * 55, 40 + p * 260)}>
              <Drop size={26} color={C.coral} />
            </div>
          ) : null;
        })}
        <div style={abs(Wd - 150, 380, {opacity: prog(t, 21.3, 21.6)})}>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.coralDeep, background: '#fff', padding: '6px 14px', borderRadius: 999}}>toner</span>
        </div>
        <div style={abs(0, 470)}>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#fff', letterSpacing: 4}}>SKIN</span>
        </div>
        <div style={abs(10, 190, {opacity: prog(t, 22.45, 22.7)})}>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.dusty, background: '#fff', padding: '6px 14px', borderRadius: 999}}>moisturizer</span>
        </div>
        {/* padlock snaps shut on "lock" */}
        <div style={abs(Wd - 150, 40, {transform: `scale(${lp}) rotate(${(1 - lp) * 20}deg)`})}>
          <Lock size={120} open={1 - locked} color={C.cherry} />
        </div>
      </div>
    </>
  );
};

const FgRecap: React.FC<{t: number}> = ({t}) => (
  <Card t={t} at={23.66} style={{position: 'absolute', left: 70, top: 640, width: 420, padding: '22px 26px'}}>
    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.cherry, marginBottom: 6}}>RECAP</div>
    {GUIDE.map((g, i) => {
      const at = 23.74 + i * 0.1;
      const p = pop(t, at, {damping: 11, stiffness: 240, mass: 0.5});
      return (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0'}}>
          <div style={{transform: `scale(${p})`}}>
            <Check size={40} color={g.c} />
          </div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.ink}}>{g.label}</div>
        </div>
      );
    })}
  </Card>
);

const FgPromo: React.FC<{t: number}> = ({t}) => {
  const n = Math.round(ramp(t, [24.72, 25.4], [0, 50]));
  const p = pop(t, 24.72);
  const bag = pop(t, 26.52, {damping: 11, stiffness: 200, mass: 0.6});
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
      {/* the first 50 buyers fill up, one per person, as she says "50 orang" */}
      <Card t={t} at={24.75} style={{position: 'absolute', left: 70, top: 465, width: 262, padding: '16px 16px 12px'}}>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px 2px', width: 230}}>
          {Array.from({length: 50}).map((_, i) => {
            const on = i < Math.floor(ramp(t, [24.75, 25.7], [0, 50])) ? 1 : 0;
            return <Person key={i} size={21} on={on} />;
          })}
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: C.cherry, marginTop: 6}}>FIRST 50</div>
      </Card>
      <div style={abs(540, 1190, {transform: `scale(${bag}) rotate(${-4 * bag}deg)`, opacity: Math.min(1, bag * 1.5)})}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 30, background: 'rgba(255,255,255,0.92)', boxShadow: '0 14px 30px rgba(120,60,80,0.2)'}}>
          <Bag size={54} color={C.rose} />
          <div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: 4, color: C.inkSoft}}>PURCHASE</div>
            <div style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 36, color: C.ink, lineHeight: 1}}>Toner Mist</div>
          </div>
        </div>
      </div>
    </>
  );
};

const FgFree: React.FC<{t: number}> = ({t}) => {
  const lid = prog(t, 29.62, 29.95, (x) => 1 - (1 - x) * (1 - x));
  const g = pop(t, 28.06);
  const serum = toScreen(t, 120, 760); // top of the yellow serum she holds up (28.6 – 30 s)
  const freeP = pop(t, 29.78, {damping: 10, stiffness: 220, mass: 0.55});
  return (
    <>
      <div style={abs(70, 168, {display: 'flex', alignItems: 'center', gap: 18})}>
        <div style={{transform: `scale(${g}) rotate(${Math.sin(t * 8) * 3 * (1 - lid)}deg)`}}>
          <Gift size={112} lid={lid} />
        </div>
        <div style={{opacity: g, transform: `translateX(${(1 - g) * -30}px)`}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.inkSoft}}>AKAN DAPAT</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <span style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 62, color: C.ink, lineHeight: 1.05}}>a serum</span>
            <span style={{display: 'inline-block', padding: '2px 22px', borderRadius: 999, background: C.cherry, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: 3, transform: `scale(${freeP}) rotate(-4deg)`}}>
              FREE!
            </span>
          </div>
        </div>
      </div>
      {/* hand-drawn arrow down the left edge to the serum */}
      <div style={{opacity: life(t, 28.6, 30.15)}}>
        <svg width={W} height={H} style={abs(0, 0)}>
          <CurvedArrow t={t} at={28.7} d={`M 120 300 C 80 420, 70 ${serum.y - 200}, ${Math.max(90, serum.x)} ${serum.y - 40}`} len={600} color={C.cherry} width={6} head={[Math.max(90, serum.x), serum.y - 40, 75]} />
        </svg>
        <Sparkle t={t} size={42} color={C.butterDeep} style={abs(Math.max(60, serum.x - 40), serum.y - 20, {opacity: prog(t, 29.0, 29.2)})} />
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
  const bag = pop(t, 30.3, {damping: 12, stiffness: 160, mass: 0.7});
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
      <div style={abs(600, 1300, {transform: `scale(${bag}) rotate(${-8 + Math.sin(t * 5) * 4}deg)`})}>
        <Bag size={84} color={C.cherry} />
      </div>
      {/* bouncing arrow toward the product link area */}
      <svg width={80} height={110} viewBox="0 0 120 170" style={abs(712, 1300 + Math.abs(Math.sin(t * 6)) * 10, {opacity: pop(t, 30.8)})}>
        <path d="M60 10 V140 M20 100 L60 150 L100 100" stroke={C.cherry} strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Sparkle t={t} size={50} style={abs(110, 190, {opacity: pop(t, 30.7)})} />
      <Sparkle t={t} size={40} phase={2} color={C.butter} style={abs(850, 360, {opacity: pop(t, 30.85)})} />
    </>
  );
};

/* ========================================================================================
 * Layer assembly with reveal transitions
 * ====================================================================================== */

type Sec = {key: SectionKey; Bg: React.FC<{t: number}>; Fg: React.FC<{t: number}>; origin: [number, number]};
export const SECTIONS: Sec[] = [
  {key: 'hook', Bg: BgHook, Fg: FgHook, origin: [540, 600]},
  {key: 'hello', Bg: BgHello, Fg: FgHello, origin: [540, 700]},
  {key: 'guide', Bg: BgGuide, Fg: FgGuide, origin: [200, 300]},
  {key: 'cleanse', Bg: BgCleanse, Fg: FgCleanse, origin: [150, 900]},
  {key: 'dry', Bg: BgDry, Fg: FgDry, origin: [270, 420]},
  {key: 'product', Bg: BgProduct, Fg: FgProduct, origin: [260, 900]},
  {key: 'two', Bg: BgTwo, Fg: FgTwo, origin: [880, 600]},
  {key: 'way1', Bg: BgWay1, Fg: FgWay1, origin: [1000, 1250]},
  {key: 'way2', Bg: BgWay2, Fg: FgWay2, origin: [540, 1300]},
  {key: 'lock', Bg: BgLock, Fg: FgLock, origin: [280, 900]},
  {key: 'recap', Bg: BgLock, Fg: FgRecap, origin: [280, 900]},
  {key: 'promo', Bg: BgPromo, Fg: FgPromo, origin: [540, 900]},
  {key: 'free', Bg: BgFree, Fg: FgFree, origin: [300, 1100]},
  {key: 'cta', Bg: BgCta, Fg: FgCta, origin: [540, 600]},
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
