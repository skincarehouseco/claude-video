import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {Star} from '../skin/Art';
import {Bubbles, Bubbly, FloatHearts, HEART_D, HeartWipe, Sfx} from '../foam/FoamEdit';
import {bob, C, captionFont, clamp01, exitAt, FPS, pop, roundFont, SAFE, SAFE_CENTER_X, sec} from '../skin/theme';

/* ============================================================================================
   OtmsEdit – 24 s whimsy edit: "OTMS ni boleh mix dengan apa?" (Yello Oatmeal Turmeric Mask & Scrub pairings)
   Wording/spelling follows the creator's own draft; timing follows Whisper large-v3 word timings of the voice.
   On-screen text is speech-synced (each word appears as it is spoken), so the graphics double as captions.
   ============================================================================================ */

export const OTMS_DURATION = 720; // 24 s
const CUT_SHELF = 3.47; // hand -> shelf
const CUT_END = 21.97; // shelf -> hand close-up

// stop-motion moments on the shelf: partner product appears / is removed (s)
const APPEAR = [4.5, 8.43, 12.9, 18.4];
const REMOVE = [7.43, 11.9, 17.4];
const PRODUCT_POS = {x: 765, y: 1150}; // partner product centre (1080x1920)

const ease = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

/* ------------------------------ camera ------------------------------ */
const presence = (t: number) => {
  // 0..1: how "zoomed onto the pair" the shelf camera is
  let v = 0;
  APPEAR.forEach((a, i) => {
    const r = REMOVE[i] ?? CUT_END + 1;
    if (t >= a && t < r) v = ease(clamp01((t - a) / 0.9));
    if (t >= r && t < r + 0.7) v = 1 - ease(clamp01((t - r) / 0.7));
  });
  return v;
};
const zoomAt = (t: number) => {
  if (t < CUT_SHELF) {
    const punch = t > 1.2 && t < 2.3 ? 0.05 * Math.sin(Math.PI * clamp01((t - 1.2) / 1.1)) : 0; // "apa?"
    return 1.02 + 0.03 * ease(clamp01(t / CUT_SHELF)) + punch;
  }
  if (t < CUT_END) return 1 + 0.025 * Math.sin((t - CUT_SHELF) / 3) + 0.1 * presence(t);
  return 1 + 0.09 * easeOut(clamp01((t - CUT_END) / 2));
};
const originAt = (t: number) => (t < CUT_SHELF ? '50% 40%' : t < CUT_END ? '55% 65%' : '50% 45%');

const Camera: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // springy "jelly" landing on the two real cuts
  let jelly = 1;
  for (const c of [CUT_SHELF, CUT_END]) {
    if (t >= c && t < c + 1) jelly = 1 + 0.07 * (1 - spring({frame: f - sec(c), fps: FPS, config: {damping: 9, stiffness: 170, mass: 0.6}}));
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#fff'}}>
      <AbsoluteFill style={{transform: `scale(${(zoomAt(t) * jelly).toFixed(5)})`, transformOrigin: originAt(t)}}>
        <OffthreadVideo src={staticFile('otms/main.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------ small cute icons ------------------------------ */
const ink = '#4A3A4E';
const sw = {stroke: ink, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
const IconToink: React.FC<{f: number}> = ({f}) => {
  const k = Math.abs(Math.sin(f / 5));
  return (
    <svg viewBox="0 0 100 100" width={92} height={92}>
      <g transform={`translate(50 ${70 - k * 16}) scale(${1 + (1 - k) * 0.12}, ${1 - (1 - k) * 0.12})`}>
        <path d="M-30 18 C-34 -10 -18 -30 0 -30 C18 -30 34 -10 30 18 Z" fill="#FFB8CC" {...sw} />
        <ellipse cx={-12} cy={-6} rx={4} ry={5.5} fill={ink} />
        <ellipse cx={12} cy={-6} rx={4} ry={5.5} fill={ink} />
        <ellipse cx={-19} cy={5} rx={6} ry={3.5} fill="#FF7FA3" opacity={0.7} />
        <ellipse cx={19} cy={5} rx={6} ry={3.5} fill="#FF7FA3" opacity={0.7} />
        <path d="M-5 6 q5 5 10 0" fill="none" {...sw} strokeWidth={3.5} />
        <ellipse cx={-14} cy={-20} rx={6} ry={3} fill="#fff" opacity={0.8} />
      </g>
      <path d="M14 92 h72" {...sw} strokeWidth={4} opacity={0.5} />
    </svg>
  );
};
const IconAcne: React.FC<{f: number}> = ({f}) => (
  <svg viewBox="0 0 100 100" width={92} height={92}>
    <circle cx={50} cy={52} r={36} fill={C.skin} {...sw} />
    <ellipse cx={38} cy={48} rx={4} ry={5.5} fill={ink} />
    <ellipse cx={62} cy={48} rx={4} ry={5.5} fill={ink} />
    <path d="M43 66 q7 -6 14 0" fill="none" {...sw} strokeWidth={3.5} />
    {[
      [30, 34],
      [70, 36],
      [27, 64],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={4 + Math.sin(f / 6 + i) * 0.8} fill="#F08A8A" />
    ))}
    <g transform="translate(70 66) rotate(-30)">
      <rect x={-16} y={-7} width={32} height={14} rx={7} fill="#F7D7B5" stroke={ink} strokeWidth={3} />
      <rect x={-6} y={-7} width={12} height={14} fill="#EFC49A" />
    </g>
  </svg>
);
const IconGlow: React.FC<{f: number}> = ({f}) => (
  <svg viewBox="0 0 100 100" width={92} height={92}>
    <g transform={`translate(50 50) rotate(${f * 1.2})`}>
      {Array.from({length: 8}).map((_, i) => (
        <path key={i} d="M0 -30 v-12" transform={`rotate(${i * 45})`} {...sw} stroke="#F2B53C" />
      ))}
    </g>
    <circle cx={50} cy={50} r={22} fill="#FFD866" {...sw} />
    <path d="M42 50 q8 8 16 0" fill="none" {...sw} strokeWidth={3.5} />
    <circle cx={43} cy={44} r={2.6} fill={ink} />
    <circle cx={57} cy={44} r={2.6} fill={ink} />
    <path transform={`translate(82 20) scale(${0.8 + Math.sin(f / 5) * 0.2})`} d="M0 -10 C2 -2 2 -2 10 0 C2 2 2 2 0 10 C-2 2 -2 2 -10 0 C-2 -2 -2 -2 0 -10Z" fill="#fff" stroke="#F2B53C" strokeWidth={2} />
  </svg>
);
const IconSoothe: React.FC<{f: number}> = ({f}) => (
  <svg viewBox="0 0 100 100" width={92} height={92}>
    <g transform={`rotate(${Math.sin(f / 9) * 8} 50 60)`}>
      <path d="M50 88 C18 70 18 30 50 12 C82 30 82 70 50 88Z" fill="#A8E6B8" {...sw} />
      <path d="M50 84 V22 M50 46 l-14 -10 M50 62 l14 -10" fill="none" {...sw} strokeWidth={3.5} />
    </g>
    <path transform={`translate(80 ${30 + Math.sin(f / 7) * 4})`} d="M0 -12 q10 14 0 20 q-10 -6 0 -20z" fill="#9ED4F7" stroke={ink} strokeWidth={3} />
  </svg>
);

/* ------------------------------ speech-synced text ------------------------------ */
type W = [string, number]; // word, time it is spoken (s)

/** a word that pops in (jelly) at its spoken time */
const PopWord: React.FC<{w: string; at: number; style: React.CSSProperties}> = ({w, at, style}) => {
  const f = useCurrentFrame();
  if (f < sec(at)) return null; // not spoken yet: takes no space, so the card grows word by word
  const p = pop(f, at, FPS, 300, 10);
  const k = f - sec(at);
  const st = 0.18 * Math.sin(k * 0.8) * Math.exp(-k * 0.16);
  return <span style={{...style, display: 'inline-block', transform: `translateY(${(1 - p) * 18}px) scale(${p * (1 + st)}, ${p * (1 - st)})`, transformOrigin: '50% 90%'}}>{w}</span>;
};

/* ---- hook: big bubbly question, word by word ---- */
const HOOK_L1: W[] = [['OTMS', 0.0], ['ni', 0.42], ['boleh', 0.62]];
const HOOK_L2: W[] = [['mix', 0.82], ['dengan', 1.04], ['apa?', 1.2]];
const HOOK_COLORS = [C.coral, '#FF9EB5', C.butterDeep, '#7FD8B4', C.lavender, C.coral];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f > sec(CUT_SHELF)) return null;
  const out = exitAt(f, CUT_SHELF - 0.2, 0.2);
  const line = (ws: W[], off: number, size: number) => (
    <div style={{display: 'flex', justifyContent: 'center', gap: 22, flexWrap: 'wrap'}}>
      {ws.map(([w, at], i) => {
        const p = pop(f, at, FPS, 300, 9);
        const k = f - sec(at);
        const st = k > 0 ? 0.2 * Math.sin(k * 0.8) * Math.exp(-k * 0.15) : 0;
        return (
          <span key={i} style={{display: 'inline-block', opacity: f >= sec(at) ? 1 : 0, transform: `translateY(${(1 - p) * 40 + Math.sin((f - (i + off) * 5) / 6) * 4}px) scale(${p * (1 + st)}, ${p * (1 - st)}) rotate(${Math.sin((f + i * 11) / 10) * 3}deg)`, transformOrigin: '50% 90%'}}>
            <Bubbly text={w} size={size} fill={HOOK_COLORS[(i + off) % HOOK_COLORS.length]} />
          </span>
        );
      })}
    </div>
  );
  const tagP = pop(f, 1.6, FPS, 200, 11);
  return (
    <div style={{position: 'absolute', top: 178, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center', opacity: out}}>
      {line(HOOK_L1, 0, 112)}
      <div style={{marginTop: 6}}>{line(HOOK_L2, 3, 120)}</div>
      {/* what OTMS stands for (read off the jar) */}
      <div style={{marginTop: 16, display: 'inline-block', opacity: f >= sec(1.6) ? 1 : 0, transform: `scale(${tagP}) rotate(-2deg)`}}>
        <div style={{background: 'rgba(255,255,255,0.94)', borderRadius: 30, padding: '8px 24px 10px', boxShadow: '0 8px 18px rgba(60,40,50,0.22)', fontFamily: captionFont, fontWeight: 500, fontSize: 32, color: ink}}>
          <span style={{color: C.coral}}>OTMS</span> = Oatmeal Turmeric Mask & Scrub
        </div>
      </div>
    </div>
  );
};

/* "Jom kita tengok!" – speech-synced sticker line on the hand shot */
const JomLine: React.FC = () => {
  const f = useCurrentFrame();
  if (f < sec(1.9) || f > sec(CUT_SHELF)) return null;
  const out = exitAt(f, CUT_SHELF - 0.15, 0.15);
  const ws: W[] = [['Jom', 1.96], ['kita', 2.42], ['tengok!', 2.54]];
  return (
    <div style={{position: 'absolute', top: 1270, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', justifyContent: 'center', gap: 16, opacity: out, transform: `rotate(-3deg)`}}>
      {ws.map(([w, at], i) => (
        <PopWord key={i} w={w} at={at} style={{fontFamily: roundFont, fontWeight: 500, fontSize: 84, color: '#fff', WebkitTextStroke: `8px ${C.coral}`, paintOrder: 'stroke fill', textShadow: '0 6px 14px rgba(60,30,40,0.3)'}} />
      ))}
      <svg width={80} height={80} style={{alignSelf: 'center', opacity: f >= sec(2.6) ? 1 : 0}}>
        <Star x={40} y={40} s={3} t={f} color={C.butter} />
      </svg>
    </div>
  );
};

/* ---- pairing card: "OTMS + product" then the benefit line, each word synced ---- */
type Pair = {idx: number; start: number; end: number; plus: number; name: W[]; benefit: W[]; icon: (f: number) => React.ReactNode; accent: string};
const PAIRS: Pair[] = [
  {idx: 0, start: 3.42, end: 7.3, plus: 4.0, name: [['Jelita', 4.32], ['KL', 4.8]], benefit: [['untuk', 5.4], ['toink', 5.98], ['toink', 6.26], ['skin!', 6.52]], icon: (f) => <IconToink f={f} />, accent: '#E9B8F0'},
  {idx: 1, start: 7.3, end: 11.82, plus: 7.9, name: [['Cyanara', 8.4], ['Essence', 9.12]], benefit: [['untuk', 10.0], ['kulit', 10.6], ['berjerawat!', 10.92]], icon: (f) => <IconAcne f={f} />, accent: '#F6D49A'},
  {idx: 2, start: 11.9, end: 17.3, plus: 12.5, name: [['Blumé', 13.0], ['Bright', 13.84], ['Toner', 14.28], ['Mist', 15.08]], benefit: [['untuk', 15.6], ['kulit', 16.2], ['kusam!', 16.56]], icon: (f) => <IconGlow f={f} />, accent: '#FFB59E'},
  {idx: 3, start: 17.32, end: 21.85, plus: 17.92, name: [['Bulaney', 18.46], ['Essence', 18.98]], benefit: [['untuk', 19.84], ['soothe', 20.44], ['redness!', 20.66]], icon: (f) => <IconSoothe f={f} />, accent: '#B9E7C4'},
];

const PairCard: React.FC<{p: Pair}> = ({p}) => {
  const f = useCurrentFrame();
  if (f < sec(p.start) || f > sec(p.end)) return null;
  const inP = pop(f, p.start, FPS, 200, 12);
  const out = exitAt(f, p.end - 0.22, 0.22);
  const benefitAt = p.benefit[0][1];
  const bP = pop(f, benefitAt, FPS, 220, 10);
  const nameStyle: React.CSSProperties = {fontFamily: roundFont, fontWeight: 500, fontSize: 72, color: ink, lineHeight: 1.1};
  return (
    <div style={{position: 'absolute', top: 270, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out}}>
      {/* 4-step progress dots */}
      <div style={{display: 'flex', gap: 14, marginBottom: 14, transform: `scale(${inP})`}}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{width: i === p.idx ? 40 : 16, height: 16, borderRadius: 8, background: i === p.idx ? C.coral : i < p.idx ? '#F7B7C6' : 'rgba(255,255,255,0.95)', boxShadow: '0 2px 6px rgba(60,40,50,0.25)'}} />
        ))}
      </div>
      {/* white card with OTMS + product (words appear as spoken) */}
      <div
        style={{
          background: '#fff',
          borderRadius: 40,
          padding: '18px 34px 20px',
          border: `5px solid ${p.accent}`,
          boxShadow: '0 14px 30px rgba(60,40,50,0.18)',
          maxWidth: 820,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: 16,
          rowGap: 4,
          transform: `translateY(${(1 - inP) * -40 + bob(f, 3, 70)}px) scale(${0.85 + 0.15 * inP}) rotate(${-1.5 + Math.sin(f / 25)}deg)`,
          opacity: clamp01(inP * 1.5),
        }}
      >
        <span style={{background: C.coral, color: '#fff', fontFamily: roundFont, fontWeight: 500, fontSize: 56, borderRadius: 24, padding: '2px 20px 6px', transform: `scale(${pop(f, p.start + 0.05, FPS, 300, 9)})`, display: 'inline-block'}}>OTMS</span>
        <PopWord w="+" at={p.plus} style={{...nameStyle, color: C.coral, fontSize: 80}} />
        {p.name.map(([w, at], i) => (
          <PopWord key={i} w={w} at={at} style={nameStyle} />
        ))}
      </div>
      {/* benefit line on a butter-yellow pill with a cute icon */}
      <div style={{marginTop: 18, display: 'flex', alignItems: 'center', gap: 6, opacity: f >= sec(benefitAt) ? 1 : 0, transform: `scale(${bP}) rotate(${1.5 + Math.sin(f / 18)}deg)`}}>
        <div style={{transform: `translateY(${bob(f, 4, 40)}px) scale(1.25)`, marginRight: 12}}>{p.icon(f)}</div>
        <div style={{background: C.butter, borderRadius: 34, padding: '8px 28px 12px', boxShadow: '0 10px 22px rgba(120,90,30,0.22)', display: 'flex', gap: 16, border: '4px solid #fff'}}>
          {p.benefit.map(([w, at], i) => (
            <PopWord key={i} w={w} at={at} style={{fontFamily: captionFont, fontWeight: 500, fontSize: 52, color: ink, fontStyle: i === 0 ? 'italic' : 'normal', paddingRight: i === 0 ? 4 : 0}} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---- shelf magic: sparkle burst when a product appears, cloud "poof" when it leaves, "+" bubble ---- */
const AppearBurst: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const k = f - sec(at);
  if (k < 0 || k > 20) return null;
  const {x, y} = PRODUCT_POS;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <circle cx={x} cy={y} r={60 + k * 14} fill="none" stroke="#fff" strokeWidth={8 * (1 - k / 20)} opacity={1 - k / 20} />
      {Array.from({length: 10}).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + random(`ab${at}${i}`);
        const d = (90 + random(`ad${at}${i}`) * 160) * (0.4 + k / 20);
        return <Star key={i} x={x + Math.cos(a) * d * 0.7} y={y + Math.sin(a) * d} s={(1.6 + random(`as${at}${i}`)) * (1 - k / 20)} t={f} color={i % 3 ? '#fff' : C.butterDeep} phase={i * 7} />;
      })}
    </svg>
  );
};
const PoofCloud: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const k = f - sec(at);
  if (k < 0 || k > 16) return null;
  const {x, y} = PRODUCT_POS;
  const u = k / 16;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: 1 - u}}>
      {Array.from({length: 7}).map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        const d = 40 + u * 120;
        return <circle key={i} cx={x + Math.cos(a) * d * 0.6} cy={y + Math.sin(a) * d} r={(50 + (i % 3) * 14) * (0.6 + u * 0.6)} fill="#fff" opacity={0.85} />;
      })}
    </svg>
  );
};
const PlusBubble: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = APPEAR.findIndex((a, j) => t >= a + 0.2 && t < (REMOVE[j] ?? CUT_END));
  if (i < 0) return null;
  const a = APPEAR[i] + 0.2;
  const r = REMOVE[i] ?? CUT_END;
  const p = pop(f, a, FPS, 260, 9) * exitAt(f, r - 0.15, 0.15);
  return (
    <div style={{position: 'absolute', left: 650 - 42, top: 1020 - 42, width: 84, height: 84, borderRadius: 42, background: C.coral, border: '6px solid #fff', boxShadow: '0 8px 18px rgba(120,40,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p}) rotate(${Math.sin(f / 7) * 10}deg) translateY(${bob(f, 6, 36)}px)`}}>
      <span style={{fontFamily: roundFont, fontWeight: 500, fontSize: 60, color: '#fff', lineHeight: 1, marginTop: -6}}>+</span>
    </div>
  );
};

/* ---- ending: "selamat mencuba!" ---- */
const Ending: React.FC = () => {
  const f = useCurrentFrame();
  if (f < sec(CUT_END)) return null;
  const ws: W[] = [['selamat', 21.96], ['mencuba!', 22.56]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 1180, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {ws.map(([w, at], i) => {
          const p = pop(f, at, FPS, 280, 8);
          const k = f - sec(at);
          const st = k > 0 ? 0.2 * Math.sin(k * 0.8) * Math.exp(-k * 0.15) : 0;
          return (
            <span key={i} style={{display: 'inline-block', opacity: f >= sec(at) ? 1 : 0, transform: `translateY(${(1 - p) * 40 + Math.sin((f - i * 6) / 6) * 5}px) scale(${p * (1 + st)}, ${p * (1 - st)}) rotate(${i ? 3 : -3}deg)`, transformOrigin: '50% 90%'}}>
              <Bubbly text={w} size={i ? 130 : 104} fill={i ? C.coral : C.butterDeep} />
            </span>
          );
        })}
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Star x={170} y={1180} s={2.4} t={f} color={C.butter} />
        <Star x={880} y={1220} s={2} t={f} phase={30} />
        <Star x={860} y={1440} s={1.5} t={f} color={C.rose} phase={60} />
        <Star x={200} y={1440} s={1.6} t={f} phase={90} />
        <path d={HEART_D} transform={`translate(${880 + Math.sin(f / 7) * 5} 1330) scale(0.6) rotate(${12 + Math.sin(f / 6) * 10})`} fill={C.rose} stroke="#fff" strokeWidth={6} />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------ audio: voice on top, light cute SFX ------------------------------ */
type Sx = [number, string, number];
const SFX: Sx[] = [
  [0.0, 'twinkle', 0.12],
  [0.42, 'bubble_pop', 0.08],
  [0.62, 'bubble_pop', 0.08],
  [0.82, 'bubble_pop', 0.08],
  [1.04, 'bubble_pop', 0.08],
  [1.2, 'boing2', 0.11],
  [1.6, 'plink', 0.09],
  [1.96, 'pop', 0.1],
  [2.54, 'squeak', 0.08],
  [3.25, 'slide_up', 0.08],
  [3.47, 'twinkle', 0.09],
  ...PAIRS.flatMap((p): Sx[] => [
    [p.start, 'pop', 0.11],
    [p.plus, 'bubble_pop', 0.1],
    [p.benefit[0][1], 'plink', 0.09],
  ]),
  ...APPEAR.flatMap((a): Sx[] => [
    [a, 'sparkle', 0.12],
    [a + 0.2, 'bubble_pop', 0.09],
  ]),
  ...REMOVE.map((r): Sx => [r, 'poof', 0.12]),
  [5.98, 'boing2', 0.1], // toink
  [6.26, 'boing2', 0.09], // toink
  [10.92, 'squeak', 0.08], // berjerawat
  [16.56, 'twinkle', 0.09], // kusam -> glow
  [20.66, 'bubbles', 0.08], // soothe
  [21.6, 'slide_up', 0.09],
  [21.97, 'tada', 0.13],
  [22.56, 'boing2', 0.1],
  [23.3, 'twinkle', 0.1],
];
const AudioMix: React.FC = () => (
  <>
    <Audio src={staticFile('otms/voice.wav')} volume={1} />
    {SFX.map(([at, name, v], i) => (
      <Sequence key={i} from={sec(at)} durationInFrames={45} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 5, OTMS_DURATION - 10, OTMS_DURATION], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#FFF8EE', opacity: o * 0.9}} />;
};

export const OtmsEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#fff'}}>
    <Camera />
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Bubbles from={0} to={24} />
      <Hook />
      <JomLine />
      {APPEAR.map((a) => (
        <AppearBurst key={a} at={a} />
      ))}
      {REMOVE.map((r) => (
        <PoofCloud key={r} at={r} />
      ))}
      <PlusBubble />
      {PAIRS.map((p) => (
        <PairCard key={p.idx} p={p} />
      ))}
      <HeartWipe at={CUT_END} color={C.butter} />
      <Ending />
      <FloatHearts from={22.2} to={24} />
      <Sfx text="toink!" at={6.0} dur={1.1} x={430} y={800} rot={-8} fill="#FF9EB5" size={64} />
    </AbsoluteFill>
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
