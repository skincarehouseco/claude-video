import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {clamp01, easeInOut, easeOut, pop, ramp} from './anim';
import {C, DISPLAY, FPS} from './theme';
import {IllustrationTag} from './ui';

export type BgId =
  | 'hook' | 'skinQ' | 'studio' | 'shelf' | 'warning' | 'prevent' | 'question' | 'bathroom' | 'raw' | 'water'
  | 'clock' | 'tissue' | 'facemap' | 'check' | 'split' | 'matte' | 'oily' | 'lookclose' | 'dry' | 'recap' | 'cta' | 'bye';

type Wipe = 'cut' | 'circle' | 'left' | 'right' | 'up' | 'diag';
/** [start s, background, entrance wipe] — each runs until the next starts. Chosen from the dialogue. */
export const BG_TIMELINE: [number, BgId, Wipe][] = [
  [0, 'hook', 'cut'], //            "Tak payah pakai toner, moisturizer, serum..."
  [4.72, 'skinQ', 'circle'], //     "Before you beli skincare... kenal tak skin type you apa?"
  [7.9, 'studio', 'cut'], //        "Hello everyone" (under the transition panel that hides the source's colour bars)
  [12.22, 'shelf', 'cut'], //       "Ramai ... dah beli skincare products" (revealed as the title card slides away)
  [16.9, 'warning', 'diag'], //     "Mulalah tak dapat effect... never ending skin problem"
  [22.5, 'prevent', 'up'], //       "Semua ni kita boleh prevent dari awal"
  [26.25, 'question', 'circle'], // "So, macam mana?"
  [27.8, 'bathroom', 'cut'], //     STEP 1 cleanser (under the transition panel that hides the source glitch)
  [30.2, 'raw', 'cut'], //          the source's own mirror/bathroom composite, kept as-is
  [32.8, 'water', 'cut'], //        STEP 2 "Bilas dengan air biasa"
  [36.45, 'clock', 'right'], //     STEP 3 "Tunggu for 10 minutes"
  [42.45, 'tissue', 'left'], //     STEP 4 "ambil je any tisu"
  [45.0, 'facemap', 'up'], //       "dab area dahi, pipi, hidung, dagu"
  [48.5, 'check', 'circle'], //     "check dekat tisu ada tak minyak"
  [51.8, 'split', 'diag'], //       T-zone oily vs pipi & dagu -> combination
  [59.1, 'matte', 'left'], //       "tak ada langsung minyak" -> dry / normal
  [64.3, 'oily', 'right'], //       "each part ada minyak" -> oily
  [68.3, 'lookclose', 'up'], //     "all areas tak ada minyak tapi bila you look closely"
  [73.75, 'dry', 'circle'], //      "garis-garis, dehydrated, flaky" -> dry
  [79.4, 'recap', 'diag'], //       "senang lah you nak purchase..."
  [83.55, 'cta', 'up'], //          "follow kita punya account"
  [86.62, 'bye', 'circle'], //      "Bye!"
];

const WIPE_S = 0.3;

const clipFor = (w: Wipe, p: number) => {
  const q = 100 * (1 - p);
  switch (w) {
    case 'circle':
      return `circle(${p * 120}% at 50% 40%)`;
    case 'left':
      return `inset(0 0 0 ${q}%)`;
    case 'right':
      return `inset(0 ${q}% 0 0)`;
    case 'up':
      return `inset(${q}% 0 0 0)`;
    case 'diag':
      return `polygon(0 0, ${p * 220}% 0, ${p * 220 - 100}% 100%, 0 100%)`;
    default:
      return 'none';
  }
};

const Grid: React.FC<{color?: string; size?: number; opacity?: number}> = ({color = '#000', size = 60, opacity = 0.06}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px)`,
      backgroundSize: `${size}px ${size}px`,
      opacity,
    }}
  />
);

const Blob: React.FC<{x: number; y: number; r: number; color: string; t: number}> = ({x, y, r, color, t}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r + 20 * Math.sin(t * 0.6),
      top: y - r + 20 * Math.cos(t * 0.5),
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: color,
      filter: 'blur(60px)',
      opacity: 0.55,
    }}
  />
);

const Photo: React.FC<{src: string; t: number; t0: number; blur?: number; zoom?: [number, number]; tint?: string; style?: React.CSSProperties}> = ({
  src,
  t,
  t0,
  blur = 0,
  zoom = [1.12, 1.02],
  tint,
  style,
}) => {
  const z = zoom[0] + (zoom[1] - zoom[0]) * clamp01((t - t0) / 6);
  return (
    <AbsoluteFill>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: blur ? `blur(${blur}px)` : undefined, ...style}} />
      {tint && <AbsoluteFill style={{background: tint}} />}
    </AbsoluteFill>
  );
};

/* ---------- drawn backgrounds ---------- */

const Shelf: React.FC<{t: number}> = ({t}) => {
  const colors = ['#F7B7C8', '#9AD9C4', '#F2C14E', '#7CC6F2', '#C9B6F2', '#FF9F80', '#FFFFFF', '#B5E48C'];
  const rows = [380, 760, 1140, 1520];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#EFE7DC, #E2D6C6)'}}>
      <AbsoluteFill style={{filter: 'blur(5px)', transform: `scale(${1.08 - 0.04 * clamp01(t / 4)}) translateX(${-20 * clamp01(t / 4)}px)`}}>
        {rows.map((ry, r) => (
          <React.Fragment key={r}>
            {Array.from({length: 9}).map((_, i) => {
              const h = 140 + ((i * 37 + r * 53) % 120);
              const w = 70 + ((i * 29 + r * 17) % 50);
              const x = 20 + i * 118 + ((r * 31) % 40);
              const c = colors[(i + r * 3) % colors.length];
              return (
                <div key={i} style={{position: 'absolute', left: x, top: ry - h, width: w, height: h}}>
                  <div style={{position: 'absolute', left: w * 0.3, top: -22, width: w * 0.4, height: 26, background: '#34495E', borderRadius: 4}} />
                  <div style={{width: '100%', height: '100%', background: c, borderRadius: i % 3 === 0 ? 30 : 10, boxShadow: 'inset -10px 0 0 rgba(0,0,0,0.08)'}} />
                  <div style={{position: 'absolute', left: 8, right: 8, top: h * 0.35, height: h * 0.3, background: 'rgba(255,255,255,0.85)', borderRadius: 6}} />
                </div>
              );
            })}
            <div style={{position: 'absolute', left: 0, right: 0, top: ry, height: 26, background: '#C9A27E', boxShadow: '0 14px 20px rgba(0,0,0,0.2)'}} />
          </React.Fragment>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0) 30%, rgba(40,30,20,0.25) 100%)'}} />
    </AbsoluteFill>
  );
};

const Clock: React.FC<{t: number}> = ({t}) => {
  // hands spin fast from "Tunggu for 10 minutes" (37.94s) for ~2.4s = 10 minutes passing (sped-up illustration)
  const p = easeInOut(clamp01((t - 37.94) / 2.4));
  const minute = p * 60; // 10 minutes -> 60 degrees of the minute hand
  const hourRot = 300 + p * 5;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #FFF6E0, #FBE3B8)'}}>
      <Grid color="#7A5C2E" opacity={0.07} />
      <svg width={760} height={760} viewBox="0 0 200 200" style={{position: 'absolute', left: 540 - 380, top: 40, opacity: 0.95}}>
        <circle cx="100" cy="100" r="92" fill="#fff" stroke={C.ink} strokeWidth="6" />
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1="100" y1="16" x2="100" y2={i % 3 === 0 ? 30 : 24} stroke={C.ink} strokeWidth={i % 3 === 0 ? 5 : 3} transform={`rotate(${i * 30} 100 100)`} />
        ))}
        {/* elapsed wedge = the 10 minutes */}
        <path d={describeArc(100, 100, 70, 0, Math.max(0.01, minute))} fill={C.yellow} opacity="0.9" />
        <line x1="100" y1="100" x2="100" y2="52" stroke={C.ink} strokeWidth="7" strokeLinecap="round" transform={`rotate(${hourRot} 100 100)`} />
        <line x1="100" y1="100" x2="100" y2="26" stroke={C.red} strokeWidth="5" strokeLinecap="round" transform={`rotate(${minute} 100 100)`} />
        <circle cx="100" cy="100" r="7" fill={C.ink} />
      </svg>
    </AbsoluteFill>
  );
};

function describeArc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const pt = (a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
}

const QuestionWall: React.FC<{t: number; t0: number; color?: string; bg: string}> = ({t, t0, color = C.ink, bg}) => (
  <AbsoluteFill style={{background: bg}}>
    {Array.from({length: 5 * 7}).map((_, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const p = pop(t, t0 + ((col + row * 2) % 9) * 0.05, 300, 10);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 60 + col * 200 + (row % 2) * 60,
            top: 150 + row * 250,
            fontFamily: DISPLAY,
            fontSize: 150,
            color,
            opacity: 0.16,
            transform: `scale(${p}) rotate(${((i * 37) % 30) - 15}deg)`,
          }}
        >
          ?
        </div>
      );
    })}
  </AbsoluteFill>
);

const BgContent: React.FC<{id: BgId; t: number; t0: number}> = ({id, t, t0}) => {
  const lt = t - t0;
  switch (id) {
    case 'hook':
      return (
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #3A2025 0%, #15181C 60%, #0B0D10 100%)'}}>
          <AbsoluteFill
            style={{
              backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,69,69,0.10) 0 40px, transparent 40px 110px)',
              backgroundPosition: `${lt * 60}px 0`,
            }}
          />
        </AbsoluteFill>
      );
    case 'skinQ':
      return (
        <>
          <Photo src="bg/skin.jpg" t={t} t0={t0} blur={4} tint="linear-gradient(rgba(255,214,170,0.15), rgba(80,40,20,0.35))" />
          <IllustrationTag />
        </>
      );
    case 'studio':
    case 'facemap':
    case 'tissue':
    case 'check':
      return (
        <AbsoluteFill style={{background: id === 'tissue' ? 'linear-gradient(160deg,#E3F6F3,#C9ECE6)' : id === 'check' ? 'linear-gradient(160deg,#EAF2FB,#D5E4F5)' : C.cream}}>
          <Grid />
          <Blob x={150} y={300} r={260} color={id === 'check' ? '#9CC3F5' : '#8FE3D6'} t={t} />
          <Blob x={950} y={1300} r={300} color={C.yellow} t={t + 2} />
        </AbsoluteFill>
      );
    case 'shelf':
      return <Shelf t={lt} />;
    case 'warning':
      return (
        <AbsoluteFill style={{background: 'linear-gradient(170deg, #3B0F14 0%, #1A0C10 70%)'}}>
          <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,210,63,0.07) 0 30px, transparent 30px 60px)', backgroundPosition: `${lt * 40}px 0`}} />
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, rgba(255,69,69,${0.25 + 0.1 * Math.sin(lt * 4)}) 0%, transparent 60%)`}} />
        </AbsoluteFill>
      );
    case 'prevent':
      return (
        <AbsoluteFill style={{background: 'linear-gradient(160deg, #E4FBEF, #B9EFD2)'}}>
          <Grid color="#0B6B3A" opacity={0.07} />
          <Blob x={900} y={300} r={260} color="#7DE2A8" t={t} />
        </AbsoluteFill>
      );
    case 'question':
      return <QuestionWall t={t} t0={t0} bg={C.yellow} />;
    case 'bathroom':
      return <Photo src="bg/tiles.jpg" t={t} t0={t0} blur={2} zoom={[1.1, 1.0]} tint="linear-gradient(rgba(255,255,255,0), rgba(120,150,170,0.18))" />;
    case 'raw':
      return <OffthreadVideo src={staticFile('main.mp4')} muted style={{width: '100%', height: '100%', transform: `scale(${1 + 0.03 * clamp01(lt / 2.6)})`}} />;
    case 'water':
      return <Photo src="bg/water.jpg" t={t} t0={t0} blur={1} zoom={[1.15, 1.05]} style={{transform: `scale(1.15) translateY(${-lt * 12}px)`}} />;
    case 'clock':
      return <Clock t={t} />;
    case 'split': {
      const p = easeOut(clamp01((t - 53.44) / 0.4));
      return (
        <AbsoluteFill style={{background: C.cream}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden'}}>
            <Img src={staticFile('bg/oily.jpg')} style={{width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(1px)'}} />
            <AbsoluteFill style={{background: 'rgba(242,169,0,0.18)'}} />
          </div>
          <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: 'linear-gradient(160deg,#F4EDE4,#E9DED0)'}}>
            <Grid opacity={0.05} />
          </div>
          <div style={{position: 'absolute', left: 537, top: 0, width: 6, height: `${100 * p}%`, background: C.ink}} />
          <IllustrationTag x={90} y={176} />
        </AbsoluteFill>
      );
    }
    case 'matte':
      return (
        <AbsoluteFill style={{background: 'linear-gradient(160deg,#F7F1EA,#EADFD2)'}}>
          <Grid opacity={0.05} />
          <Blob x={200} y={400} r={260} color="#FFFFFF" t={t} />
        </AbsoluteFill>
      );
    case 'oily':
      return (
        <>
          <Photo src="bg/oily.jpg" t={t} t0={t0} blur={1.5} tint="radial-gradient(circle at 50% 30%, rgba(255,230,150,0.2), rgba(60,30,0,0.3))" />
          <IllustrationTag />
        </>
      );
    case 'lookclose':
      return (
        <>
          <Photo src="bg/skin.jpg" t={t} t0={t0} blur={t > 72.86 ? 0 : 3} zoom={[1.0, t > 72.86 ? 1.6 : 1.1]} tint="rgba(30,15,5,0.2)" />
          <IllustrationTag />
        </>
      );
    case 'dry':
      return (
        <>
          <Photo src="bg/dry.jpg" t={t} t0={t0} blur={1} zoom={[1.25, 1.05]} tint="rgba(20,20,25,0.18)" />
          <IllustrationTag />
        </>
      );
    case 'recap':
      return (
        <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.ink2}, ${C.ink})`}}>
          <Grid color="#FFFFFF" opacity={0.05} />
          <Blob x={900} y={1500} r={300} color={C.teal} t={t} />
        </AbsoluteFill>
      );
    case 'cta':
      return (
        <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.teal}, #0A7F76)`}}>
          <Grid color="#FFFFFF" opacity={0.07} />
        </AbsoluteFill>
      );
    case 'bye':
      return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #FFE27A, ${C.yellow})`}} />;
  }
  return null;
};

export const Backgrounds: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = BG_TIMELINE.findIndex(([s], i) => t >= s && (i === BG_TIMELINE.length - 1 || t < BG_TIMELINE[i + 1][0]));
  const layers: number[] = [];
  if (idx > 0 && t < BG_TIMELINE[idx][0] + WIPE_S && BG_TIMELINE[idx][2] !== 'cut') layers.push(idx - 1);
  layers.push(idx);
  return (
    <AbsoluteFill>
      {layers.map((i) => {
        const [s, id, wipe] = BG_TIMELINE[i];
        const p = i === idx && wipe !== 'cut' ? ramp(t, s, WIPE_S, easeInOut) : 1;
        return (
          <AbsoluteFill key={i} style={{clipPath: p < 1 ? clipFor(wipe, p) : undefined}}>
            <BgContent id={id} t={t} t0={s} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

export const bgAt = (t: number): BgId => {
  let id: BgId = 'hook';
  for (const [s, b] of BG_TIMELINE) if (t >= s) id = b;
  return id;
};
