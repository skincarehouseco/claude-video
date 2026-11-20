import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {toScreen} from './camera';
import {
  Droplet,
  IconCrack,
  IconLines,
  IconOil,
  IconTired,
  IconWash,
  Star,
  StickerDropper,
  StickerGlass,
  StickerJar,
  StickerTube,
} from './Icons';
import {C, clamp, F, faceAt, FPS, lerp, SAFE, sec} from './theme';

const textShadow = '0 2px 3px rgba(40,28,36,0.55), 0 0 18px rgba(40,28,36,0.35)';

/* ------------ helpers ------------ */
const useT = () => useCurrentFrame() / FPS;

/** 0..1 spring-in from `start`, 1..0 eased out over `out` s before `end` */
const useLife = (start: number, end: number, out = 0.3) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame: frame - sec(start), fps, config: {damping: 13, stiffness: 150, mass: 0.7}});
  const outP = lerp(frame / FPS, [end - out, end], [1, 0]);
  return {inP, outP, on: frame / FPS >= start - 0.01 && frame / FPS < end};
};

/** soft "focus-pull" entrance used for every text line (slide up + de-blur), staggered */
const Line: React.FC<{start: number; end: number; delay?: number; style: React.CSSProperties; children: React.ReactNode}> = ({
  start,
  end,
  delay = 0,
  style,
  children,
}) => {
  const t = useT();
  const p = lerp(t, [start + delay, start + delay + 0.45], [0, 1]);
  const o = lerp(t, [end - 0.3, end], [1, 0]);
  return (
    <div
      style={{
        opacity: p * o,
        transform: `translateY(${(1 - p) * 26 - (1 - o) * 18}px)`,
        filter: `blur(${(1 - p) * 8 + (1 - o) * 6}px)`,
        textShadow,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** tiny stars bursting out of a point */
const Burst: React.FC<{x: number; y: number; at: number; n?: number; r?: number; color?: string}> = ({x, y, at, n = 6, r = 90, color = C.butter}) => {
  const t = useT();
  const k = (t - at) / 0.7;
  if (k < 0 || k > 1) return null;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.4;
        const d = interpolate(k, [0, 1], [r * 0.2, r], {...clamp, easing: (v) => 1 - (1 - v) ** 3});
        const s = Math.sin(Math.PI * k) * (i % 2 ? 22 : 30);
        return (
          <div key={i} style={{position: 'absolute', left: x + Math.cos(a) * d - s / 2, top: y + Math.sin(a) * d - s / 2, opacity: 1 - k * 0.6}}>
            <Star size={s} color={i % 3 === 0 ? '#fff' : color} />
          </div>
        );
      })}
    </>
  );
};

/** gently twinkling star that lives between start..end */
const Twinkle: React.FC<{x: number; y: number; start: number; end: number; size?: number; chrome?: boolean; phase?: number}> = ({
  x,
  y,
  start,
  end,
  size = 44,
  chrome,
  phase = 0,
}) => {
  const t = useT();
  if (t < start || t > end) return null;
  const pop = lerp(t, [start, start + 0.35], [0, 1], (v) => 1 - (1 - v) ** 3) * lerp(t, [end - 0.3, end], [1, 0]);
  const tw = 0.82 + 0.18 * Math.sin((t + phase) * 6);
  const rot = Math.sin((t + phase) * 1.7) * 12;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${pop * tw}) rotate(${rot}deg)`}}>
      <Star size={size} chrome={chrome} />
    </div>
  );
};

/* ------------ intro title (0.2 - 3.5 s) ------------ */
const Intro: React.FC = () => {
  const t = useT();
  const {inP, outP, on} = useLife(0.2, 3.55);
  if (!on) return null;
  const bob = Math.sin(t * 4) * 6;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 205, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center'}}>
        <Line start={0.2} end={3.55} style={{fontFamily: F.serifItalic, fontSize: 66, color: C.butter, letterSpacing: 1}}>
          5 tanda
        </Line>
        <Line start={0.2} end={3.55} delay={0.14} style={{fontFamily: F.display, fontSize: 98, color: C.cream, lineHeight: 0.95, marginTop: -4}}>
          Kulit Dehidrasi
        </Line>
      </div>
      <Twinkle x={250} y={222} start={0.45} end={3.55} size={46} chrome />
      <Twinkle x={292} y={262} start={0.6} end={3.55} size={28} chrome phase={1} />
      <Twinkle x={800} y={410} start={0.75} end={3.55} size={34} chrome phase={2} />
      {/* thirsty droplet mascot peeking in */}
      <div style={{position: 'absolute', left: 720, top: 198 + bob, opacity: outP, transform: `scale(${inP}) rotate(${-8 + Math.sin(t * 3) * 5}deg)`}}>
        <Droplet size={104} mood={-1} blink={Math.floor(t * 30) % 70 < 4} />
      </div>
      <Burst x={495} y={300} at={0.3} n={8} r={360} />
    </AbsoluteFill>
  );
};

/* ------------ one "sign" lockup: icon card + number + headline + note ------------ */
type SignDef = {
  n: string;
  start: number;
  end: number;
  title: string;
  note: string;
  icon: (draw: number, t: number) => React.ReactNode;
  card: string;
};
const SIGNS: SignDef[] = [
  {n: '#1', start: 3.72, end: 8.05, title: 'Rasa Tight', note: 'lepas cuci muka', card: C.aqua,
    icon: (d, t) => <IconWash draw={d} squeeze={t > 5.66 && t < 6.3 ? Math.sin(((t - 5.66) / 0.64) * Math.PI * 3) : 0} />},
  {n: '#2', start: 8.15, end: 11.42, title: 'Fine Lines', note: 'nampak lebih jelas', card: C.lilac, icon: (d) => <IconLines draw={d} />},
  {n: '#3', start: 11.5, end: 15.06, title: 'Kusam', note: '& nampak penat', card: C.peach, icon: (d) => <IconTired draw={d} />},
  {n: '#4', start: 15.13, end: 18.7, title: 'Makeup Cakey', note: 'mudah crack', card: C.pink,
    icon: (d, t) => <IconCrack draw={d} crack={lerp(t, [17.4, 17.75], [0, 1])} />},
  {n: '#5', start: 18.78, end: 22.95, title: 'Berminyak', note: 'semakin oily', card: C.mint, icon: (d) => <IconOil draw={d} />},
];

const CARD = 196;
const Sign: React.FC<{s: SignDef}> = ({s}) => {
  const t = useT();
  const {inP, outP, on} = useLife(s.start, s.end);
  if (!on) return null;
  const draw = lerp(t, [s.start + 0.15, s.start + 1.25], [0, 1]);
  const float = Math.sin(t * 2.4) * 5;
  const cardX = SAFE.left + 18;
  const cardY = 222;
  return (
    <AbsoluteFill>
      {/* icon card (white paper card, gently tilted, floats) */}
      <div
        style={{
          position: 'absolute',
          left: cardX,
          top: cardY + float,
          width: CARD,
          height: CARD,
          borderRadius: 34,
          background: '#FFFDF8',
          boxShadow: `0 10px 26px rgba(40,28,36,0.28), inset 0 0 0 6px ${s.card}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: outP,
          transform: `scale(${(0.55 + 0.45 * inP) * (0.85 + 0.15 * outP)}) rotate(${-14 + 10 * inP + Math.sin(t * 1.8) * 1.5}deg)`,
        }}
      >
        {s.icon(draw, t)}
      </div>
      {/* washi-tape strip on the card */}
      <div
        style={{
          position: 'absolute',
          left: cardX + CARD / 2 - 46,
          top: cardY - 14 + float,
          width: 92,
          height: 28,
          background: 'rgba(255,240,166,0.85)',
          transform: `rotate(${-6 + 4 * inP}deg) scaleX(${inP})`,
          opacity: outP,
          borderRadius: 3,
          boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
        }}
      />
      {/* text column */}
      <div style={{position: 'absolute', left: cardX + CARD + 34, top: cardY - 6, width: SAFE.right - (cardX + CARD + 34)}}>
        <Line start={s.start} end={s.end} delay={0.1} style={{fontFamily: F.serifItalic, fontSize: 56, color: C.butter}}>
          tanda {s.n}
        </Line>
        <Line
          start={s.start}
          end={s.end}
          delay={0.22}
          style={{fontFamily: F.display, fontSize: s.title.length > 10 ? 76 : 86, color: C.cream, lineHeight: 1, marginTop: -2}}
        >
          {s.title}
        </Line>
        <Line start={s.start} end={s.end} delay={0.38} style={{fontFamily: F.hand, fontSize: 46, color: C.aqua, marginTop: 4}}>
          {s.note}
        </Line>
      </div>
      <Twinkle x={cardX + CARD - 4} y={cardY + 10} start={s.start + 0.3} end={s.end} size={40} chrome phase={s.start} />
      <Burst x={cardX + CARD / 2} y={cardY + CARD / 2} at={s.start + 0.05} n={7} r={170} />
    </AbsoluteFill>
  );
};

/* ------------ face-anchored whimsy (follows the speaker through the zooms) ------------ */
const FaceFx: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const f = faceAt(frame);
  const out: React.ReactNode[] = [];

  // sign 2: hand-drawn circle around the eye-corner "fine lines" + sparkle
  if (t > 9.9 && t < 11.45) {
    const p = toScreen(frame, f.x + f.w * 0.27, f.y - f.w * 0.1);
    const r = f.w * 0.2 * p.z;
    const d = lerp(t, [9.95, 10.5], [0, 1]);
    const o = lerp(t, [11.15, 11.45], [1, 0]);
    out.push(
      <svg key="ring" style={{position: 'absolute', left: p.x - r * 1.3, top: p.y - r, opacity: o, overflow: 'visible'}} width={r * 2.6} height={r * 2}>
        <path
          d={`M ${r * 0.3} ${r * 0.9} C ${r * 0.2} ${r * 0.1}, ${r * 2.3} ${-r * 0.1}, ${r * 2.4} ${r * 0.9} C ${r * 2.5} ${r * 1.8}, ${r * 0.3} ${r * 2.0}, ${r * 0.25} ${r * 1.0} L ${r * 0.5} ${r * 0.55}`}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - d}
          fill="none"
          stroke={C.butter}
          strokeWidth={6}
          strokeLinecap="round"
          style={{filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))'}}
        />
      </svg>,
    );
    out.push(<Twinkle key="rs" x={p.x + r * 1.35} y={p.y - r * 0.6} start={10.35} end={11.45} size={34} />);
  }

  // sign 3: sleepy "z z z" drifting up from the head
  if (t > 13.7 && t < 15.1) {
    const p = toScreen(frame, f.x + f.w * 0.62, f.y - f.w * 0.62);
    ['z', 'z', 'Z'].forEach((z, i) => {
      const k = (t - 13.75 - i * 0.22) / 1.1;
      if (k < 0 || k > 1) return;
      out.push(
        <div
          key={'z' + i}
          style={{
            position: 'absolute',
            left: Math.min(p.x + i * 30 + Math.sin(k * 6) * 8, SAFE.right - 40),
            top: p.y - k * 120 - i * 20,
            fontFamily: F.hand,
            fontSize: 44 + i * 12,
            color: C.cream,
            opacity: Math.sin(Math.PI * k),
            textShadow,
          }}
        >
          {z}
        </div>,
      );
    });
  }

  // sign 5: shine glints on the T-zone (oily)
  if (t > 21.2 && t < 22.9) {
    const pts: [number, number, number, number][] = [
      [0, -0.42, 21.25, 40], // forehead
      [0.02, 0.06, 21.45, 30], // nose
      [-0.3, 0.12, 21.65, 26], // cheek
      [0.33, 0.1, 21.8, 26], // cheek
    ];
    pts.forEach(([dx, dy, at, s], i) => {
      const p = toScreen(frame, f.x + f.w * dx, f.y + f.w * dy);
      out.push(<Twinkle key={'g' + i} x={p.x} y={p.y} start={at} end={22.9} size={s * p.z} phase={i} />);
    });
  }

  // outro: hand-drawn "?" on "dah tahu kan?"
  if (t > 23.25 && t < 24.15) {
    const p = toScreen(frame, f.x + f.w * 0.75, f.y - f.w * 0.55);
    const k = lerp(t, [23.3, 23.55], [0, 1], (v) => 1 - (1 - v) ** 3);
    const o = lerp(t, [23.9, 24.15], [1, 0]);
    out.push(
      <div
        key="q"
        style={{
          position: 'absolute',
          left: Math.min(p.x, SAFE.right - 70),
          top: p.y - 40,
          fontFamily: F.serifItalic,
          fontSize: 110,
          color: C.butter,
          opacity: o,
          transform: `scale(${k}) rotate(${12 - 12 * k + Math.sin(t * 9) * 4}deg)`,
          textShadow,
        }}
      >
        ?
      </div>,
    );
  }
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{out}</AbsoluteFill>;
};

/* ------------ outro: "Hydration" lockup + product stickers popping around the head ------------ */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / FPS;
  if (t < 24.0) return null;
  const items: [React.FC<{size?: number}>, number, number, number, number][] = [
    [StickerDropper, 150, 640, 24.3, -12],
    [StickerGlass, 172, 905, 24.45, 8],
    [StickerJar, 850, 660, 24.6, 10],
    [StickerTube, 852, 900, 24.75, -8],
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 205, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center'}}>
        <Line start={24.08} end={27} style={{fontFamily: F.serifItalic, fontSize: 60, color: C.butter}}>
          jangan lupa fokus pada
        </Line>
        <Line start={24.08} end={27} delay={0.5} style={{fontFamily: F.display, fontSize: 118, color: C.cream, lineHeight: 0.95}}>
          Hydration
        </Line>
      </div>
      <Twinkle x={230} y={330} start={24.7} end={27} size={50} chrome />
      <Twinkle x={268} y={378} start={24.85} end={27} size={28} chrome phase={1.3} />
      <Twinkle x={770} y={300} start={24.95} end={27} size={40} chrome phase={2.1} />
      <Burst x={495} y={350} at={24.6} n={10} r={380} color={C.aqua} />
      {items.map(([Comp, x, y, at, rot], i) => {
        const p = spring({frame: frame - sec(at), fps, config: {damping: 9, stiffness: 160, mass: 0.6}});
        const bob = Math.sin((t + i) * 3) * 7;
        return (
          <div key={i} style={{position: 'absolute', left: x - 60, top: y - 60 + bob, transform: `scale(${p}) rotate(${rot + Math.sin(t * 2 + i) * 5}deg)`}}>
            <Comp size={120} />
          </div>
        );
      })}
      {/* happy droplet mascot */}
      {(() => {
        const p = spring({frame: frame - sec(24.9), fps, config: {damping: 8, stiffness: 140, mass: 0.6}});
        const hop = Math.abs(Math.sin(t * 5)) * 16;
        return (
          <div style={{position: 'absolute', left: 800, top: 178 - hop, transform: `scale(${p}) rotate(${Math.sin(t * 5) * 6}deg)`}}>
            <Droplet size={100} mood={1} />
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

/* ------------ soft light "bloom" transition at each new beat ------------ */
export const BEATS = [3.72, 8.15, 11.5, 15.13, 18.78, 24.08];
const Bloom: React.FC = () => {
  const t = useT();
  const b = BEATS.find((x) => t >= x - 0.12 && t < x + 0.35);
  if (b === undefined) return null;
  const o = interpolate(t, [b - 0.12, b, b + 0.35], [0, 0.22, 0], clamp);
  return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #FFF8E4 0%, rgba(255,248,228,0.6) 40%, rgba(255,248,228,0) 75%)', opacity: o}} />;
};

export const Graphics: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Bloom />
    <FaceFx />
    <Intro />
    {SIGNS.map((s) => (
      <Sign key={s.n} s={s} />
    ))}
    <Outro />
  </AbsoluteFill>
);

