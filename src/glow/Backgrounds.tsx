import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Droplet, Leaf, Pearl} from './Bits';
import {C, H, W} from './theme';

type BgProps = {f: number};

export const Grain: React.FC<{o?: number}> = ({o = 0.07}) => (
  <AbsoluteFill style={{backgroundImage: `url(${staticFile('glow/grain.png')})`, backgroundSize: '480px 480px', mixBlendMode: 'overlay', opacity: o}} />
);
const Glow: React.FC<{x: number; y: number; r: number; color: string; o?: number}> = ({x, y, r, color, o = 1}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, ${color}, transparent)`, opacity: o}} />
);
/** editorial arch window */
const Arch: React.FC<{x: number; y: number; w: number; h: number; fill: string; stroke?: string; inner?: string}> = ({x, y, w, h, fill, stroke, inner}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: `${w / 2}px ${w / 2}px 0 0`, background: fill, boxShadow: inner ?? 'inset 0 30px 80px rgba(255,255,255,0.6), 0 30px 80px rgba(120,70,80,0.12)', border: stroke ? `3px solid ${stroke}` : undefined}} />
);

/* 1 — Hook: blush studio with arch + pearls */
export const BlushStudio: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(175deg, ${C.blush} 0%, #F9E6E3 45%, ${C.cream} 100%)`}}>
    <Glow x={540} y={760} r={700} color="rgba(255,255,255,0.75)" />
    <Arch x={150} y={520 - f * 0.15} w={780} h={1500} fill={`linear-gradient(180deg, #FFF8F6, ${C.blush})`} />
    <Arch x={210} y={600 - f * 0.15} w={660} h={1400} fill="transparent" stroke="rgba(255,255,255,0.9)" inner="none" />
    {/* floor */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1560, bottom: 0, background: `linear-gradient(180deg, #F3CFD3, ${C.blushMid})`, boxShadow: '0 -2px 0 rgba(255,255,255,0.8)'}} />
    <Pearl f={f} x={70} y={1180} d={120} c2={C.blushMid} />
    <Pearl f={f} x={900} y={1080} d={90} c2={C.lavMid} phase={2} />
    <Pearl f={f} x={860} y={400} d={54} c2={C.peachMid} phase={4} blur={1} />
    <Pearl f={f} x={120} y={560} d={40} c2="#fff" phase={1} blur={2} />
    <Grain />
  </AbsoluteFill>
);

/* 2 — Ferment: cream editorial grid + floating ferment bubbles & rice grains */
export const CreamEditorial: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.milk} 0%, ${C.cream} 55%, ${C.beige} 100%)`}}>
    <svg width={W} height={H} style={{position: 'absolute'}}>
      {[120, 960].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={H} stroke={C.sand} strokeWidth="1.5" opacity="0.45" />
      ))}
      {[150, 1700].map((y) => (
        <line key={y} x1={0} y1={y} x2={W} y2={y} stroke={C.sand} strokeWidth="1.5" opacity="0.45" />
      ))}
      <circle cx={540} cy={820} r={520} fill="none" stroke={C.sand} strokeWidth="1.5" opacity="0.35" strokeDasharray="4 10" transform={`rotate(${f * 0.2} 540 820)`} />
    </svg>
    <Glow x={540} y={820} r={600} color="rgba(255,255,255,0.9)" />
    {Array.from({length: 14}).map((_, i) => {
      const d = 30 + ((i * 29) % 70);
      const x = (i * 157) % 1000;
      const y = 1900 - ((f * (0.9 + (i % 4) * 0.35) + i * 260) % 2100);
      return (
        <div key={i} style={{position: 'absolute', left: x + Math.sin(f / 30 + i) * 18, top: y, width: d, height: d, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(244,226,200,0.35) 60%, rgba(217,194,167,0.5))', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.9), 0 8px 18px rgba(150,120,90,0.12)'}} />
      );
    })}
    {Array.from({length: 9}).map((_, i) => (
      <div key={`r${i}`} style={{position: 'absolute', left: 60 + ((i * 211) % 960), top: 260 + ((i * 337) % 1400) + Math.sin(f / 40 + i) * 20, width: 34, height: 15, borderRadius: '50%', background: 'linear-gradient(180deg,#fff,#F1E6D6)', boxShadow: '0 4px 8px rgba(150,120,90,0.18)', transform: `rotate(${i * 40 + f * 0.6}deg)`}} />
    ))}
    <Grain o={0.06} />
  </AbsoluteFill>
);

/* 3 — Smoother: lavender silk waves */
export const LavenderSilk: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(160deg, #F3EEFB 0%, ${C.lavender} 50%, ${C.lavMid} 100%)`}}>
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="silk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {Array.from({length: 7}).map((_, i) => {
        const y = 300 + i * 220;
        const a = 90 + i * 12;
        const ph = f / 22 + i;
        return (
          <path
            key={i}
            d={`M-100 ${y} C 200 ${y - a * Math.sin(ph)}, 600 ${y + a * Math.cos(ph)}, 1180 ${y - 40 * Math.sin(ph)}`}
            stroke="url(#silk)"
            strokeWidth={60 - i * 5}
            fill="none"
            opacity={0.55}
            style={{filter: 'blur(6px)'}}
          />
        );
      })}
    </svg>
    <Glow x={300} y={500} r={500} color="rgba(255,255,255,0.6)" />
    <Grain />
  </AbsoluteFill>
);

/* 4 — Niacinamide / Centella: peach glow with molecule line-art; leaves grow in later */
export const PeachGlow: React.FC<BgProps & {leaves: number}> = ({f, leaves}) => (
  <AbsoluteFill style={{background: `linear-gradient(170deg, #FFF1E7 0%, ${C.peach} 55%, ${C.peachMid} 100%)`}}>
    <Glow x={330} y={520} r={560} color="rgba(255,255,255,0.85)" />
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.5}}>
      <g transform={`translate(880 300) rotate(${f * 0.3})`} stroke="#fff" strokeWidth="3" fill="none">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * Math.PI) / 3;
          const b = ((i + 1) * Math.PI) / 3;
          return <line key={i} x1={Math.cos(a) * 80} y1={Math.sin(a) * 80} x2={Math.cos(b) * 80} y2={Math.sin(b) * 80} />;
        })}
        <line x1="80" y1="0" x2="150" y2="0" />
        <circle cx="168" cy="0" r="16" />
        <circle cx={Math.cos(Math.PI * 0.667) * 80} cy={Math.sin(Math.PI * 0.667) * 80} r="10" fill="#fff" />
      </g>
    </svg>
    {/* centella leaves */}
    {[
      [80, 1150, 200, -30],
      [250, 1250, 150, 15],
      [990, 1050, 200, 40],
      [1000, 1580, 170, 70],
      [980, 620, 120, -60],
      [120, 1620, 210, 10],
    ].map(([x, y, s, r], i) => (
      <Leaf key={i} x={x} y={y + Math.sin(f / 30 + i) * 10} size={s} rot={r + Math.sin(f / 40 + i) * 6} grow={Math.max(0, Math.min(1, leaves * 1.6 - i * 0.12))} />
    ))}
    <Grain />
  </AbsoluteFill>
);

/* 5 — Benefits: sky-blue / lavender glass */
export const SkyGlass: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(165deg, #F2F8FD 0%, ${C.sky} 45%, ${C.lavender} 100%)`}}>
    <Glow x={820} y={560} r={620} color="rgba(255,255,255,0.9)" />
    {Array.from({length: 8}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: (i * 263) % 1000, top: ((i * 389) % 1700) + Math.sin(f / 35 + i) * 20, width: 120 + (i % 3) * 80, height: 120 + (i % 3) * 80, borderRadius: '50%', background: i % 2 ? 'rgba(255,255,255,0.35)' : 'rgba(201,187,235,0.35)', filter: 'blur(18px)'}} />
    ))}
    <Grain />
  </AbsoluteFill>
);

/* 6 — Best part: blush rays */
export const BlushRays: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #FFF6F4 0%, ${C.blush} 45%, ${C.blushMid} 100%)`}}>
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.45}}>
      <g transform={`translate(540 760) rotate(${f * 0.25})`}>
        {Array.from({length: 18}).map((_, i) => (
          <path key={i} d="M0 0 L-60 -1400 L60 -1400Z" fill="#fff" transform={`rotate(${i * 20})`} opacity={0.5} />
        ))}
      </g>
    </svg>
    <Glow x={540} y={760} r={520} color="rgba(255,255,255,0.8)" />
    <Grain />
  </AbsoluteFill>
);

/* 7 — Texture: aqua water with caustics + droplets */
export const AquaWater: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(175deg, #EEF7FD 0%, ${C.sky} 40%, ${C.skyMid} 100%)`}}>
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.55, mixBlendMode: 'screen'}}>
      <filter id="caustic">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed={3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={60 + 20 * Math.sin(f / 20)} />
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <g filter="url(#caustic)" stroke="#fff" strokeWidth="5" fill="none">
        {Array.from({length: 12}).map((_, i) => (
          <path key={i} d={`M-50 ${i * 170 + ((f * 1.2) % 170)} q 140 ${50 * Math.sin(f / 25 + i)} 280 0 t 280 0 t 280 0 t 280 0`} />
        ))}
      </g>
    </svg>
    <Glow x={540} y={300} r={600} color="rgba(255,255,255,0.75)" />
    {[
      [40, 240, 110, 0],
      [910, 330, 80, 1],
      [960, 1180, 120, 2],
      [30, 1290, 90, 3],
      [820, 1500, 60, 4],
      [180, 1560, 70, 5],
      [500, 150, 50, 6],
    ].map(([x, y, s, p]) => (
      <Droplet key={p} f={f} x={x} y={y} size={s} phase={p} />
    ))}
    {Array.from({length: 18}).map((_, i) => {
      const y = 1950 - ((f * (1.5 + (i % 3)) + i * 120) % 2050);
      return <div key={i} style={{position: 'absolute', left: (i * 61) % 1060, top: y, width: 10 + (i % 4) * 6, height: 10 + (i % 4) * 6, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.25)'}} />;
    })}
    <Grain o={0.05} />
  </AbsoluteFill>
);

/* 8 — Layering: sunlit linen with window + leaf shadows (Pinterest morning light) */
export const SunlitLinen: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.milk} 0%, #F6EDE2 50%, ${C.beige} 100%)`}}>
    <div style={{position: 'absolute', inset: -200, transform: `rotate(-24deg) translateX(${Math.sin(f / 60) * 20}px)`, filter: 'blur(26px)', opacity: 0.32}}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 80 + i * 330, top: 0, width: 150, height: 2600, background: '#B79E85'}} />
      ))}
    </div>
    <svg width={W} height={H} style={{position: 'absolute', filter: 'blur(9px)', opacity: 0.22}}>
      <g transform={`translate(820 120) rotate(${20 + Math.sin(f / 30) * 3})`} fill="#8E7660">
        {Array.from({length: 9}).map((_, i) => (
          <ellipse key={i} cx={Math.cos(i) * 40} cy={i * 70} rx="70" ry="26" transform={`rotate(${i % 2 ? 35 : -35} ${Math.cos(i) * 40} ${i * 70})`} />
        ))}
        <path d="M0 -40 C 20 200 -20 400 10 700" stroke="#8E7660" strokeWidth="8" fill="none" />
      </g>
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1580, bottom: 0, background: 'linear-gradient(180deg, #E8D7C2, #DCC5AA)'}} />
    <Grain o={0.09} />
  </AbsoluteFill>
);

/* 9 — Checklist: lavender → blush dream with bokeh */
export const LavenderDream: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.lavender} 0%, #F1E3F0 50%, ${C.blush} 100%)`}}>
    {Array.from({length: 12}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: (i * 181) % 1040, top: ((i * 293) % 1800) - ((f * 0.5) % 40), width: 60 + (i % 4) * 50, height: 60 + (i % 4) * 50, borderRadius: '50%', background: i % 3 ? 'rgba(255,255,255,0.45)' : 'rgba(239,184,196,0.5)', filter: `blur(${8 + (i % 3) * 8}px)`}} />
    ))}
    <Glow x={330} y={760} r={520} color="rgba(255,255,255,0.7)" />
    <Grain />
  </AbsoluteFill>
);

/* 10 — End card: peach podium studio with spotlight */
export const PeachPodium: React.FC<BgProps> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, #FFEFE5 0%, ${C.peach} 55%, ${C.peachMid} 100%)`}}>
    <Arch x={120} y={430} w={840} h={1300} fill={`linear-gradient(180deg, #FFF7F1, ${C.peach})`} />
    <div style={{position: 'absolute', left: 140, top: -200, width: 800, height: 2000, background: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)', filter: 'blur(20px)', opacity: 0.8 + 0.2 * Math.sin(f / 15)}} />
    {/* podium */}
    <div style={{position: 'absolute', left: 90, top: 1600, width: 900, height: 420, borderRadius: '50% / 70px', background: `linear-gradient(180deg, #FFF4EC, ${C.peachMid})`, boxShadow: '0 -4px 0 #fff, 0 40px 80px rgba(150,80,60,0.18)'}} />
    <div style={{position: 'absolute', left: 90, top: 1600, width: 900, height: 140, borderRadius: '50%', background: 'linear-gradient(180deg,#FFFFFF,#FCE6D8)'}} />
    <Pearl f={f} x={60} y={1380} d={130} c2={C.peachMid} />
    <Pearl f={f} x={900} y={1300} d={100} c2={C.blushMid} phase={2} />
    <Pearl f={f} x={930} y={520} d={60} c2={C.lavMid} phase={3} />
    <Grain />
  </AbsoluteFill>
);
