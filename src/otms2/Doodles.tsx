import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {APPEAR, CUT_END, CUT_SHELF, FPS, P, PAIRS, REMOVE, SAFE, SANS_MED, sec, SERIF} from './data';
import {zoomAt} from './Camera';

/* Hand-drawn style doodles: slightly irregular strokes, drawn on with stroke-dashoffset, gentle springs. */
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const drawK = (f: number, at: number, dur = 0.6) => Easing.inOut(Easing.cubic)(c01((f - sec(at)) / (dur * FPS)));
const popK = (f: number, at: number, damping = 12) => (f < sec(at) ? 0 : spring({frame: f - sec(at), fps: FPS, config: {damping, stiffness: 190, mass: 0.6}}));
const outK = (f: number, end: number, d = 0.25) => 1 - c01((f - sec(end - d)) / (d * FPS));
const stroke = {stroke: P.cocoa, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
const strokeLine = {...stroke, fill: 'none'};

export const Sparkle: React.FC<{x: number; y: number; s?: number; color?: string; at: number; end: number; phase?: number}> = ({x, y, s = 1, color = P.butter, at, end, phase = 0}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const k = popK(f, at, 9) * outK(f, end);
  const tw = 0.8 + 0.2 * Math.sin((f + phase) / 6);
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s * k * tw}) rotate(${Math.sin((f + phase) / 20) * 12})`}
      d="M0 -22 C3 -6 6 -3 22 0 C6 3 3 6 0 22 C-3 6 -6 3 -22 0 C-6 -3 -3 -6 0 -22Z"
      fill={color}
      stroke={P.cocoa}
      strokeWidth={2.5 / Math.max(0.3, s)}
    />
  );
};

/** curved hand-drawn arrow that draws itself on */
export const CurvedArrow: React.FC<{d: string; head: string; at: number; end: number; color?: string}> = ({d, head, at, end, color = P.cocoa}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const k = drawK(f, at, 0.55);
  const hk = drawK(f, at + 0.45, 0.2);
  return (
    <g opacity={outK(f, end)}>
      <path d={d} {...strokeLine} stroke={color} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
      <path d={head} {...strokeLine} stroke={color} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - hk} />
    </g>
  );
};

/** wobbly hand-drawn ellipse around a product, drawn on (two loose passes like a pen circle) */
const ring = (cx: number, cy: number, rx: number, ry: number, seed: string) => {
  const pts: string[] = [];
  const N = 40;
  for (let i = 0; i <= N * 1.12; i++) {
    const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
    const j = 1 + (random(`${seed}${i % N}`) - 0.5) * 0.04 + (i / N) * 0.03;
    pts.push(`${(cx + Math.cos(a) * rx * j).toFixed(1)} ${(cy + Math.sin(a) * ry * j).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
};
export const DrawnRing: React.FC<{cx: number; cy: number; rx: number; ry: number; at: number; end: number; color: string}> = ({cx, cy, rx, ry, at, end, color}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const k = drawK(f, at, 0.7);
  return <path d={ring(cx, cy, rx, ry, `${at}`)} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} opacity={outK(f, end)} />;
};

const Flower: React.FC<{x: number; y: number; s: number; color: string; rot: number}> = ({x, y, s, color, rot}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={i} cx={0} cy={-11} rx={7} ry={11} fill={color} stroke={P.cocoa} strokeWidth={1.6} transform={`rotate(${i * 72})`} />
    ))}
    <circle r={5} fill={P.butter} stroke={P.cocoa} strokeWidth={1.6} />
  </g>
);

/** a few tiny flowers drifting slowly through the clear wall area (subtle) */
export const FloatingFlowers: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  if (f < sec(from) || f > sec(to)) return null;
  const o = Math.min(c01((f - sec(from)) / 15), 1 - c01((f - sec(to) + 15) / 15));
  return (
    <g opacity={o * 0.9}>
      {[0, 1, 2].map((i) => {
        const x = 140 + i * 170 + Math.sin(f / (60 + i * 9) + i) * 30;
        const y = 1010 - ((f * (0.35 + i * 0.1) + i * 160) % 400);
        return <Flower key={i} x={x} y={y} s={0.9 + (i % 2) * 0.3} color={[P.blush, P.butter, '#F3D2CE'][i]} rot={f * 0.6 + i * 40} />;
      })}
    </g>
  );
};

/* ---------- line-art benefit icons (cocoa outline, soft fills) ---------- */
const BenefitIcon: React.FC<{kind: 'bounce' | 'acne' | 'glow' | 'calm'; f: number}> = ({kind, f}) => {
  if (kind === 'bounce') {
    const b = Math.abs(Math.sin(f / 6));
    return (
      <g>
        <g transform={`translate(0 ${-b * 26}) scale(${1 + (1 - b) * 0.1}, ${1 - (1 - b) * 0.1})`}>
          <path d="M-46 30 C-52 -16 -26 -46 0 -46 C26 -46 52 -16 46 30 Z" fill="#F6D9D4" {...stroke} />
          <path d="M-22 -26 q8 -8 16 -6" {...strokeLine} stroke="#fff" strokeWidth={6} />
          <circle cx={-15} cy={-4} r={4.5} fill={P.cocoa} />
          <circle cx={15} cy={-4} r={4.5} fill={P.cocoa} />
          <path d="M-7 10 q7 7 14 0" {...strokeLine} strokeWidth={4} />
        </g>
        <path d="M-40 62 h80" {...strokeLine} strokeWidth={4} opacity={0.4} />
        <path d="M-62 -10 q-10 -14 0 -28 M62 -10 q10 -14 0 -28" {...strokeLine} strokeWidth={4} opacity={0.5 + b * 0.5} />
      </g>
    );
  }
  if (kind === 'acne') {
    return (
      <g>
        <circle r={52} fill="#F8E3D2" {...stroke} />
        <circle cx={-18} cy={-8} r={4.5} fill={P.cocoa} />
        <circle cx={18} cy={-8} r={4.5} fill={P.cocoa} />
        <path d="M-9 16 q9 -6 18 0" {...strokeLine} strokeWidth={4} />
        {[
          [-30, -28],
          [32, -24],
          [-34, 20],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5 + Math.sin(f / 7 + i) * 0.8} fill={P.blushDeep} />
        ))}
        <g transform="translate(28 30) rotate(-32)">
          <rect x={-24} y={-9} width={48} height={18} rx={9} fill="#F1D7BC" {...stroke} strokeWidth={3.5} />
          <rect x={-8} y={-9} width={16} height={18} fill="#E6C3A0" />
        </g>
      </g>
    );
  }
  if (kind === 'glow') {
    return (
      <g>
        <g transform={`rotate(${f * 0.8})`}>
          {Array.from({length: 10}).map((_, i) => (
            <path key={i} d="M0 -44 v-16" {...strokeLine} strokeWidth={4.5} stroke={'#D9A441'} transform={`rotate(${i * 36})`} />
          ))}
        </g>
        <circle r={32} fill={P.butter} {...stroke} />
        <circle cx={-10} cy={-6} r={3.6} fill={P.cocoa} />
        <circle cx={10} cy={-6} r={3.6} fill={P.cocoa} />
        <path d="M-9 7 q9 8 18 0" {...strokeLine} strokeWidth={3.5} />
      </g>
    );
  }
  // calm: leaf + droplet
  return (
    <g>
      <g transform={`rotate(${Math.sin(f / 10) * 8})`}>
        <path d="M0 58 C-44 30 -40 -30 0 -58 C40 -30 44 30 0 58Z" fill="#CFE0C3" {...stroke} />
        <path d="M0 52 V-46 M0 -6 l-20 -16 M0 18 l20 -16" {...strokeLine} strokeWidth={3.5} />
      </g>
      <path transform={`translate(52 ${-30 + Math.sin(f / 8) * 5})`} d="M0 -16 q14 18 0 26 q-14 -8 0 -26z" fill="#CFE3EE" {...stroke} strokeWidth={3.5} />
    </g>
  );
};

/* product outline sizes per pairing (unzoomed shelf coordinates) */
const RINGS = [
  {cx: 772, cy: 1150, rx: 150, ry: 470, color: P.blushDeep},
  {cx: 778, cy: 1150, rx: 150, ry: 470, color: P.sageDeep},
  {cx: 782, cy: 1165, rx: 150, ry: 455, color: '#D9A441'},
  {cx: 786, cy: 1335, rx: 160, ry: 300, color: P.sageDeep},
];

/** shelf-attached graphics: follow the camera zoom so rings stay on the products */
export const ShelfDoodles: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < CUT_SHELF || t >= CUT_END) return null;
  return (
    <AbsoluteFill style={{transform: `scale(${zoomAt(t)})`, transformOrigin: '56% 64%'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>
        <FloatingFlowers from={CUT_SHELF + 0.4} to={CUT_END - 0.2} />
        {PAIRS.map((p, i) => {
          const a = APPEAR[i];
          const r = REMOVE[i] ?? CUT_END;
          const ring = RINGS[i];
          const iconK = popK(f, p.benefitAt, 10) * outK(f, Math.min(p.to, r));
          return (
            <g key={p.n}>
              <DrawnRing {...ring} at={a + 0.35} end={r} />
              <Sparkle x={ring.cx + 120} y={ring.cy - ring.ry + 20} s={1.4} at={a + 0.1} end={r} />
              <Sparkle x={ring.cx - 130} y={ring.cy - ring.ry + 120} s={0.9} color={P.blush} at={a + 0.25} end={r} phase={30} />
              {/* benefit icon on the clear wall above the jar, with an arrow to the partner product */}
              {f >= sec(p.benefitAt) && (
                <g transform={`translate(330 ${960 + Math.sin(f / 14) * 6}) scale(${1.25 * iconK}) rotate(${(1 - iconK) * -20})`}>
                  <BenefitIcon kind={p.icon} f={f} />
                </g>
              )}
              <CurvedArrow d="M440 900 C500 830 560 820 610 860" head="M588 836 L612 862 L582 872" at={p.benefitAt + 0.25} end={Math.min(p.to, r)} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** "01 / 04" serif badge for each pairing */
export const PairBadge: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const p = PAIRS.find((x) => t >= x.from && t < x.to);
  if (!p) return null;
  const k = popK(f, p.from, 14) * outK(f, p.to);
  return (
    <div style={{position: 'absolute', top: SAFE.top + 20, left: SAFE.left + 14, display: 'flex', alignItems: 'baseline', gap: 10, opacity: k, transform: `translateY(${(1 - k) * -14}px)`}}>
      <span style={{fontFamily: SANS_MED, fontWeight: 500, fontSize: 24, letterSpacing: 4, color: P.cocoa, opacity: 0.7}}>MIX</span>
      <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: P.cocoa, lineHeight: 1}}>0{p.n}</span>
      <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: P.cocoa, opacity: 0.55}}>/ 04</span>
      <svg width={70} height={24} style={{marginLeft: 6}}>
        <path d="M4 14 C20 4 34 22 50 10 C56 6 62 8 66 12" fill="none" stroke={P.blushDeep} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - drawK(f, p.from + 0.2, 0.5)} />
      </svg>
    </div>
  );
};

/** hook: what OTMS stands for (read off the jar label), with an arrow to the jar */
export const HookNote: React.FC = () => {
  const f = useCurrentFrame();
  if (f > sec(CUT_SHELF)) return null;
  const k = popK(f, 0.9, 14) * outK(f, CUT_SHELF - 0.05);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: SAFE.top + 30, left: SAFE.left, width: 810, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * -12}px) rotate(-2deg)`}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: P.cocoa, textShadow: '0 0 14px rgba(255,250,240,0.95), 0 0 4px rgba(255,250,240,1)'}}>Oatmeal Turmeric</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: P.cocoa, textShadow: '0 0 14px rgba(255,250,240,0.95), 0 0 4px rgba(255,250,240,1)'}}>Mask &amp; Scrub</div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <CurvedArrow d="M690 420 C760 470 760 540 700 590" head="M722 572 L700 592 L690 562" at={1.1} end={CUT_SHELF - 0.05} />
        <Sparkle x={210} y={330} s={1.3} at={1.0} end={CUT_SHELF} />
        <Sparkle x={860} y={300} s={0.9} color={P.blush} at={1.15} end={CUT_SHELF} phase={20} />
        <Sparkle x={170} y={760} s={0.8} at={1.3} end={CUT_SHELF} phase={40} />
      </svg>
    </AbsoluteFill>
  );
};

/** ending: little drawn hearts + sparkles around the sign-off */
const HEART = 'M0 22 C-20 8 -32 -4 -28 -16 C-24 -30 -8 -30 0 -17 C8 -30 24 -30 28 -16 C32 -4 20 8 0 22Z';
export const EndDoodles: React.FC = () => {
  const f = useCurrentFrame();
  if (f < sec(CUT_END + 0.1)) return null;
  const hearts = [
    {x: 190, y: 1230, s: 1.6, at: 22.2, c: P.blush},
    {x: 820, y: 1210, s: 1.2, at: 22.45, c: '#F3D2CE'},
    {x: 860, y: 1450, s: 1.0, at: 22.7, c: P.blush},
  ];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {hearts.map((h, i) => {
        const k = popK(f, h.at, 9);
        return (
          <path key={i} d={HEART} transform={`translate(${h.x} ${h.y + Math.sin((f + i * 20) / 12) * 6}) scale(${h.s * k}) rotate(${(i % 2 ? 10 : -12) + Math.sin(f / 10 + i) * 6})`} fill={h.c} stroke={P.cocoa} strokeWidth={2.5} />
        );
      })}
      <Sparkle x={250} y={1470} s={1.1} at={22.6} end={24} />
      <Sparkle x={760} y={1150} s={1.3} at={22.3} end={24} phase={25} />
      <Sparkle x={130} y={1380} s={0.8} color={P.blush} at={22.9} end={24} phase={50} />
    </svg>
  );
};

/** soft sparkle burst exactly where a product pops in on the shelf */
export const SwapSparkles: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {APPEAR.map((a, j) => {
        const k = f - sec(a);
        if (k < 0 || k > 18) return null;
        const u = k / 18;
        return (
          <g key={a} opacity={1 - u}>
            {Array.from({length: 7}).map((_, i) => {
              const ang = (i / 7) * Math.PI * 2 + j;
              const d = 70 + u * 150;
              const x = RINGS[j].cx + Math.cos(ang) * d * 0.8;
              const y = RINGS[j].cy - RINGS[j].ry * 0.3 + Math.sin(ang) * d;
              return <path key={i} transform={`translate(${x} ${y}) scale(${0.9 * (1 - u * 0.6)})`} d="M0 -14 C2 -4 4 -2 14 0 C4 2 2 4 0 14 C-2 4 -4 2 -14 0 C-4 -2 -2 -4 0 -14Z" fill={i % 2 ? P.butter : P.warmWhite} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

export const fadeInOut = (f: number, a: number, b: number) => interpolate(f, [sec(a), sec(a) + 6, sec(b) - 6, sec(b)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
