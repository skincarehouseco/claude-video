import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import './BooihWhimsy'; // loads the BW* fonts

/* booih foam — "kick" re-edit in the WHIMSY reference style:
   hard cuts + speed ramps, instant punch zooms, light-streak cuts, manga speed lines, big bubbly reaction words,
   tiny word-by-word subtitles, scrapbook sticky note / polaroid, chrome stars, a TV-bars glitch gag, dense SFX.
   Footage: public/booih2/enhanced.mp4 (original background, HD grade). Original clip audio is not used. */

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const pop = (f: number, at: number, d = 10, st = 260) => (f < sec(at) ? 0 : spring({frame: f - sec(at), fps: FPS, config: {damping: d, stiffness: st, mass: 0.5}}));
const fadeOut = (f: number, end: number, d = 0.12) => 1 - c01((f - sec(end - d)) / (d * FPS));

const P = {
  cream: '#FFF9F1', butter: '#F7E3A1', gold: '#E0B85A', pink: '#F6C9D0', pinkDeep: '#E893A3', blue: '#C9E2F4', blueDeep: '#8DBFE3',
  sage: '#B9D3AE', sageDeep: '#86A879', cocoa: '#4E3B30',
};
const SAFE = {top: 230, bottom: 1498, left: 86, right: 896};
const NUN = 'BWNunito';
const INK = P.cocoa; // all titles one colour (creator: fonts don't need to be colourful)
const ROUND = 'BWRound';
const SERIF = 'BWSerif';

/* ---------------- timeline: source segments [from, to, speed] cut together hard ---------------- */
const SEGS: [number, number, number][] = [
  [0.0, 3.8, 1.0], // spray (hook)
  [3.9, 7.0, 1.6], // foam forms (fast)
  [7.0, 8.6, 1.0], // first toss
  [8.6, 12.0, 1.0], // heart
  [12.0, 15.0, 1.6], // squish (fast)
  [15.0, 18.0, 1.0], // tosses
  [18.0, 20.0, 1.8], // rolling (fast, glitch gag)
  [20.0, 22.5, 1.0], // donut
  [24.0, 29.0, 1.8], // squishing (fast)
  [29.0, 34.0, 1.5], // ball -> reveal
  [34.0, 36.1, 1.0], // end card
];
const SEG_F: {from: number; len: number; src: number; rate: number}[] = [];
{
  let acc = 0;
  for (const [a, b, r] of SEGS) {
    const len = Math.round(((b - a) / r) * FPS);
    SEG_F.push({from: acc, len, src: sec(a), rate: r});
    acc += len;
  }
}
export const BK_DURATION = SEG_F[SEG_F.length - 1].from + SEG_F[SEG_F.length - 1].len;
/** output time (s) of segment i + offset (s) */
const T = (i: number, o = 0) => SEG_F[i].from / FPS + o;
const CUTS = SEG_F.slice(1).map((s) => s.from / FPS);

/* ---------------- camera: instant punch zooms (snap in 3 frames, small overshoot) + shake ---------------- */
// [time, scale, originY%, shake]
const ZOOM: [number, number, number, number][] = [
  [0, 1.16, 46, 1], [T(0, 1.1), 1.0, 50, 0], [T(0, 1.6), 1.13, 44, 1], [T(0, 2.7), 1.06, 46, 0],
  [T(1), 1.0, 52, 0], [T(1, 1.0), 1.1, 54, 0],
  [T(2), 1.0, 50, 0], [T(2, 0.6), 1.12, 40, 1],
  [T(3), 1.0, 50, 0], [T(3, 0.15), 1.18, 42, 1], [T(3, 1.4), 1.06, 44, 0], [T(3, 2.4), 1.14, 42, 0],
  [T(4), 1.0, 55, 0], [T(4, 0.9), 1.12, 55, 1],
  [T(5), 1.0, 50, 0], [T(5, 0.15), 1.1, 40, 1], [T(5, 1.5), 1.0, 50, 0], [T(5, 2.1), 1.12, 40, 1],
  [T(6), 1.0, 50, 0],
  [T(7), 1.0, 50, 0], [T(7, 0.15), 1.2, 48, 1], [T(7, 1.3), 1.08, 48, 0],
  [T(8), 1.0, 55, 0], [T(8, 0.7), 1.12, 55, 1], [T(8, 1.6), 1.0, 55, 0], [T(8, 2.1), 1.14, 52, 1],
  [T(9), 1.0, 52, 0], [T(9, 1.4), 1.15, 50, 1], [T(9, 2.4), 1.05, 50, 0],
  [T(10), 1.0, 50, 0],
];
const back = Easing.out(Easing.back(2.2));
const camera = (t: number) => {
  let i = 0;
  while (i + 1 < ZOOM.length && ZOOM[i + 1][0] <= t) i++;
  const [kt, s, oy, sh] = ZOOM[i];
  const prev = i > 0 ? ZOOM[i - 1][1] : s;
  const isCut = CUTS.some((c) => Math.abs(c - kt) < 0.01);
  const k = isCut ? 1 : back(c01((t - kt) / 0.1));
  const scale = prev + (s - prev) * k;
  const age = t - kt;
  const amp = sh ? 14 * Math.exp(-age * 14) : 0;
  const dx = amp * Math.sin(t * 95);
  const dy = amp * Math.cos(t * 77);
  return {scale, oy, dx, dy};
};

/* ---------------- graphics ---------------- */
const Bubbly: React.FC<{text: string; size: number; fill: string; font?: string; italic?: boolean}> = ({text, size, fill, font = ROUND, italic}) => (
  <span style={{fontFamily: font, fontStyle: italic ? 'italic' : 'normal', fontWeight: font === SERIF ? 800 : 700, fontSize: size, lineHeight: 1, color: fill, WebkitTextStroke: `${size * 0.11}px #fff`, paintOrder: 'stroke fill', filter: `drop-shadow(0 ${size * 0.05}px 0 ${P.cocoa}) drop-shadow(0 8px 14px rgba(78,59,48,0.25))`, whiteSpace: 'nowrap'}}>
    {text}
  </span>
);

/** big one-word reaction, letters slam in with squash & stretch */
const BigWord: React.FC<{text: string; at: number; end: number; size: number; cols: string[]; y?: number; rot?: number; font?: string; italic?: boolean; stagger?: number}> = ({text, at, end, size, cols, y = 760, rot = -4, font, italic, stagger = 0.035}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const o = fadeOut(f, end);
  return (
    <div style={{position: 'absolute', top: y, left: 0, width: 1080, display: 'flex', justifyContent: 'center', transform: `translateY(-50%) rotate(${rot}deg) scale(${o})`, opacity: o}}>
      {text.split('').map((ch, i) => {
        const t0 = at + i * stagger;
        const p = pop(f, t0, 7, 340);
        const k = f - sec(t0);
        const st = k > 0 ? 0.25 * Math.sin(k * 0.9) * Math.exp(-k * 0.2) : 0;
        return ch === ' ' ? (
          <span key={i} style={{width: size * 0.28}} />
        ) : (
          <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * -60 + Math.sin((f - i * 5) / 5) * 5}px) scale(${p * 1.0 * (1 + st)}, ${p * (1 - st)}) rotate(${(i % 2 ? 4 : -4) * (1 - p)}deg)`, transformOrigin: '50% 90%'}}>
            <Bubbly text={ch} size={size} fill={INK} font={font} italic={italic} />
          </span>
        );
      })}
    </div>
  );
};

/** tiny word-by-word subtitle. *word* = serif italic butter, WORD (caps) = bubbly bigger */
const Sub: React.FC<{at: number; end: number; text: string; y?: number}> = ({at, end, text, y = 1330}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const words = text.split(' ');
  const step = Math.min(0.12, (end - at) / (words.length + 2));
  return (
    <div style={{position: 'absolute', top: y, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 12, alignItems: 'baseline', opacity: fadeOut(f, end, 0.08)}}>
      {words.map((w, i) => {
        const wt = at + i * step;
        if (f < sec(wt)) return null;
        const k = pop(f, wt, 11, 320);
        const em = /^\*.*\*$/.test(w);
        const caps = !em && w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w);
        const txt = em ? w.slice(1, -1) : w;
        const style: React.CSSProperties = em
          ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 800, fontSize: 52, color: '#fff'}
          : caps
          ? {fontFamily: ROUND, fontWeight: 700, fontSize: 54, color: '#fff'}
          : {fontFamily: NUN, fontWeight: 900, fontSize: 42, color: '#fff'};
        return (
          <span key={i} style={{...style, display: 'inline-block', lineHeight: 1.2, WebkitTextStroke: `${caps || em ? 9 : 8}px ${P.cocoa}`, paintOrder: 'stroke fill', filter: 'drop-shadow(0 3px 0 rgba(78,59,48,0.9))', transform: `translateY(${(1 - k) * 14}px) scale(${0.6 + 0.4 * k})`}}>
            {txt}
          </span>
        );
      })}
    </div>
  );
};

/** manga speed lines (re-drawn every 2 frames) */
const SpeedLines: React.FC<{at: number; end: number; col?: string; cx?: number; cy?: number}> = ({at, end, col = '#fff', cx = 540, cy = 860}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const tick = Math.floor(f / 2);
  const lines = [];
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + random(`a${i}${tick}`) * 0.12;
    const r0 = 430 + random(`r${i}${tick}`) * 260;
    const w = 0.012 + random(`w${i}${tick}`) * 0.02;
    const R = 1500;
    const p = (ang: number, r: number) => `${cx + Math.cos(ang) * r} ${cy + Math.sin(ang) * r}`;
    lines.push(<path key={i} d={`M${p(a, r0)} L${p(a - w, R)} L${p(a + w, R)} Z`} fill={col} />);
  }
  const o = c01((f - sec(at)) / 2) * fadeOut(f, end, 0.1);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.85 * o}}>
      <g style={{filter: 'drop-shadow(0 0 2px rgba(78,59,48,0.35))'}}>{lines}</g>
    </svg>
  );
};

/** light-streak sweep across every hard cut */
const Streaks: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {CUTS.map((c, i) => {
        const k = (f - (sec(c) - 4)) / 9;
        if (k < 0 || k > 1) return null;
        const x = -900 + k * 2900;
        const flash = Math.max(0, 1 - Math.abs(f - sec(c)) / 2.5);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, top: -400, width: 380, height: 2800, transform: 'rotate(18deg)', background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,246,214,0.85) 40%, #fff 50%, rgba(255,240,245,0.85) 60%, rgba(255,255,255,0) 100%)`, mixBlendMode: 'screen', filter: 'blur(6px)'}} />
            <div style={{position: 'absolute', left: x - 260, top: -400, width: 90, height: 2800, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(247,227,161,0.8), rgba(255,255,255,0))', mixBlendMode: 'screen', filter: 'blur(4px)'}} />
            <AbsoluteFill style={{background: '#fff', opacity: 0.55 * flash}} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** TV colour-bar glitch gag */
const Glitch: React.FC<{at: number; frames: number}> = ({at, frames}) => {
  const f = useCurrentFrame();
  const k = f - sec(at);
  if (k < 0 || k >= frames) return null;
  const bars = ['#F4F1EA', '#F3DE8A', '#9ED8E0', '#A9D49A', '#E7A3C7', '#EE9A92', '#93AEE3'];
  const slices = [];
  for (let s = 0; s < 12; s++) {
    const off = (random(`g${s}${k}`) - 0.5) * 140;
    slices.push(
      <div key={s} style={{position: 'absolute', top: s * 160, left: off, width: 1080, height: 160, display: 'flex'}}>
        {bars.map((b, i) => (
          <div key={i} style={{flex: 1, background: b}} />
        ))}
      </div>,
    );
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {slices}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 3px, rgba(0,0,0,0) 3px 7px)'}} />
      <div style={{position: 'absolute', top: 860, width: 1080, textAlign: 'center', transform: `translateX(${(random(`gx${k}`) - 0.5) * 30}px)`}}>
        <Bubbly text="eh jap..." size={120} fill={P.cocoa} />
      </div>
    </AbsoluteFill>
  );
};

/* sticker shapes */
const STAR4 = 'M0 -40 C5 -10 10 -5 40 0 C10 5 5 10 0 40 C-5 10 -10 5 -40 0 C-10 -5 -5 -10 0 -40Z';
const HEART = 'M0 22 C-20 8 -32 -4 -28 -16 C-24 -30 -8 -30 0 -17 C8 -30 24 -30 28 -16 C32 -4 20 8 0 22Z';
type Kind = 'chrome' | 'heart' | 'donut' | 'star' | 'bubble' | 'bow' | 'cloud' | 'foamy' | 'duck' | 'smile' | 'soap' | 'flower' | 'sparkle';
type Thing = {kind: Kind; x: number; y: number; s: number; at: number; end: number; col?: string; rot?: number};
const segEnd = (i: number) => (i + 1 < SEG_F.length ? T(i + 1) - 0.05 : BK_DURATION / FPS);
const S = (kind: Kind, x: number, y: number, s: number, seg: number, o: number, extra: Partial<Thing> = {}): Thing => ({kind, x, y, s, at: T(seg, o), end: extra.end ?? segEnd(seg), ...extra});
const THINGS: Thing[] = [
  // 0 spray
  S('soap', 880, 430, 1.1, 0, 0.3, {rot: 8}), S('bubble', 180, 520, 1.0, 0, 0.6), S('sparkle', 830, 1150, 0.9, 0, 1.0, {col: P.butter}),
  S('duck', 175, 1150, 1.0, 0, 1.7, {rot: -8}), S('chrome', 900, 760, 0.9, 0, 2.2), S('bubble', 250, 340, 0.6, 0, 2.6),
  // 1 foam forms (sticky note top-left)
  S('bubble', 900, 560, 0.8, 1, 0.2), S('foamy', 880, 1120, 1.1, 1, 0.4, {rot: 6}), S('sparkle', 180, 1180, 0.8, 1, 0.8, {col: P.pink}),
  // 2 toss
  S('cloud', 860, 400, 1.1, 2, 0.1), S('star', 180, 1150, 0.9, 2, 0.4, {col: P.butter}), S('bubble', 900, 1050, 0.7, 2, 0.7),
  // 3 heart
  S('heart', 160, 560, 2.2, 3, 0.2, {col: P.pink, rot: -14}), S('heart', 900, 640, 1.5, 3, 0.3, {col: P.pinkDeep, rot: 12}),
  S('bow', 880, 1150, 1.0, 3, 0.6, {rot: 10}), S('flower', 160, 1180, 0.9, 3, 1.4), S('smile', 880, 400, 0.9, 3, 2.0, {rot: -6}), S('sparkle', 220, 400, 0.8, 3, 2.4, {col: P.butter}),
  // 4 squish
  S('foamy', 860, 400, 1.0, 4, 0.1, {rot: -6}), S('bubble', 180, 1120, 0.9, 4, 0.4), S('bubble', 240, 1000, 0.5, 4, 0.5), S('sparkle', 900, 1180, 0.8, 4, 0.9, {col: P.blue}),
  // 5 tosses
  S('star', 860, 450, 1.0, 5, 0.2, {col: P.butter}), S('cloud', 180, 420, 1.0, 5, 0.3), S('duck', 880, 1180, 1.0, 5, 1.2, {rot: 8}),
  S('bubble', 200, 1180, 0.7, 5, 1.6), S('sparkle', 900, 760, 0.8, 5, 2.2, {col: P.pink}),
  // 6 rolling
  S('sparkle', 870, 420, 0.9, 6, 0.3, {col: P.butter}), S('bubble', 180, 1150, 0.7, 6, 0.4),
  // 7 donut
  S('donut', 840, 1130, 1.25, 7, 0.25, {rot: 12}), S('chrome', 180, 520, 1.2, 7, 0.3), S('bow', 880, 420, 0.9, 7, 0.6, {rot: -10}), S('smile', 180, 1180, 0.9, 7, 1.2),
  // 8 squishing
  S('chrome', 900, 400, 1.2, 8, 0.1), S('star', 190, 440, 0.9, 8, 0.5, {col: P.pink}), S('soap', 880, 1150, 1.0, 8, 0.9, {rot: -8}),
  S('bubble', 160, 760, 0.7, 8, 1.3), S('flower', 900, 760, 0.8, 8, 1.8),
  // 9 reveal
  S('cloud', 880, 380, 1.0, 9, 0.1), S('bubble', 180, 1100, 0.8, 9, 0.5), S('chrome', 870, 460, 1.3, 9, 1.4), S('heart', 180, 1150, 1.3, 9, 1.5, {col: P.pink, rot: -10}),
  S('foamy', 880, 1150, 1.0, 9, 1.8, {rot: 6}), S('sparkle', 200, 420, 0.9, 9, 2.2, {col: P.butter}),
  // 10 end card (drawn above the end-card veil)
  S('bubble', 170, 400, 0.9, 10, 0.5), S('heart', 900, 330, 1.4, 10, 0.6, {col: P.pink, rot: 12}), S('bow', 190, 820, 0.9, 10, 0.75, {rot: -12}),
  S('sparkle', 880, 800, 1.0, 10, 0.85, {col: P.butter}), S('flower', 170, 1380, 0.9, 10, 1.0), S('soap', 900, 1390, 0.9, 10, 1.1, {rot: 10}),
  S('duck', 540, 1500, 0.8, 10, 1.25),
];
const Face: React.FC<{y?: number; k?: number}> = ({y = 0, k = 1}) => (
  <g transform={`translate(0 ${y}) scale(${k})`}>
    <circle cx={-12} cy={-2} r={4.5} fill={P.cocoa} />
    <circle cx={12} cy={-2} r={4.5} fill={P.cocoa} />
    <circle cx={-10.5} cy={-3.5} r={1.4} fill="#fff" />
    <circle cx={13.5} cy={-3.5} r={1.4} fill="#fff" />
    <ellipse cx={-22} cy={8} rx={6} ry={3.5} fill={P.pinkDeep} opacity={0.7} />
    <ellipse cx={22} cy={8} rx={6} ry={3.5} fill={P.pinkDeep} opacity={0.7} />
    <path d="M-6 6 Q-3 11 0 6 Q3 11 6 6" fill="none" stroke={P.cocoa} strokeWidth={2.5} strokeLinecap="round" />
  </g>
);
const ST = {stroke: P.cocoa, strokeWidth: 3, strokeLinejoin: 'round' as const};
const drawThing = (th: Thing) => {
  switch (th.kind) {
    case 'chrome': return <path d={STAR4} fill="url(#chrome)" stroke="#fff" strokeWidth={3} />;
    case 'star': return <path d={STAR4} fill={th.col} {...ST} />;
    case 'sparkle': return <g><path d={STAR4} transform="scale(0.7)" fill={th.col} {...ST} /><path d={STAR4} transform="translate(34 -30) scale(0.3)" fill="#fff" {...ST} /></g>;
    case 'heart': return <path d={HEART} fill={th.col} stroke={P.cocoa} strokeWidth={2.5} />;
    case 'bubble':
      return (
        <g>
          <circle r={40} fill="rgba(201,226,244,0.35)" stroke="#fff" strokeWidth={5} />
          <circle r={40} fill="none" stroke="rgba(141,191,227,0.6)" strokeWidth={1.5} />
          <path d="M-24 -12 A26 26 0 0 1 -6 -27" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
          <circle cx={18} cy={18} r={4} fill="#fff" />
        </g>
      );
    case 'bow':
      return (
        <g>
          <path d="M-4 6 L-26 50 L-14 44 L-6 54 Z M4 6 L26 50 L14 44 L6 54 Z" fill={P.pinkDeep} {...ST} />
          <path d="M0 0 C-18 -34 -62 -34 -58 0 C-62 34 -18 34 0 0Z" fill={P.pink} {...ST} />
          <path d="M0 0 C18 -34 62 -34 58 0 C62 34 18 34 0 0Z" fill={P.pink} {...ST} />
          <path d="M-20 -8 C-30 -12 -38 -6 -40 2 M20 -8 C30 -12 38 -6 40 2" fill="none" stroke={P.pinkDeep} strokeWidth={3} strokeLinecap="round" />
          <rect x={-11} y={-12} width={22} height={24} rx={8} fill={P.pinkDeep} {...ST} />
        </g>
      );
    case 'cloud':
      return (
        <g>
          <path d="M-58 24 C-78 24 -78 -8 -54 -6 C-56 -34 -20 -42 -8 -22 C0 -46 44 -44 44 -14 C70 -18 76 24 52 24 Z" fill="#fff" {...ST} />
          <Face y={0} k={0.9} />
        </g>
      );
    case 'foamy':
      return (
        <g>
          <path d="M-46 30 C-64 26 -62 0 -48 -6 C-56 -30 -30 -46 -14 -36 C-6 -56 26 -54 30 -34 C52 -40 64 -14 50 0 C66 12 56 36 36 34 C26 46 -30 46 -46 30Z" fill="#CFE8BC" {...ST} />
          <circle cx={-26} cy={-22} r={6} fill="#fff" opacity={0.9} />
          <Face y={4} />
        </g>
      );
    case 'duck':
      return (
        <g>
          <path d="M-50 10 C-50 40 40 44 52 14 C58 -2 40 -4 26 4 C10 10 -20 -6 -50 10Z" fill="#F7D774" {...ST} />
          <circle cx={-16} cy={-18} r={24} fill="#F7D774" {...ST} />
          <path d="M-40 -16 C-54 -16 -56 -8 -40 -6 Z" fill="#F2A65A" {...ST} />
          <circle cx={-22} cy={-22} r={4} fill={P.cocoa} />
          <ellipse cx={-10} cy={-10} rx={5} ry={3} fill={P.pinkDeep} opacity={0.6} />
          <path d="M-4 18 C8 28 26 22 30 10" fill="none" stroke={P.cocoa} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case 'smile':
      return (
        <g>
          <circle r={40} fill={P.butter} {...ST} />
          <Face y={2} k={1.1} />
        </g>
      );
    case 'soap':
      return (
        <g>
          <rect x={-48} y={-28} width={96} height={60} rx={22} fill={P.pink} {...ST} />
          <rect x={-38} y={-20} width={28} height={8} rx={4} fill="#fff" opacity={0.8} />
          <Face y={6} />
          <circle cx={40} cy={-40} r={12} fill="rgba(201,226,244,0.5)" stroke="#fff" strokeWidth={3} />
          <circle cx={56} cy={-60} r={7} fill="rgba(201,226,244,0.5)" stroke="#fff" strokeWidth={3} />
        </g>
      );
    case 'flower':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 24} cy={Math.sin((a * Math.PI) / 180) * 24} r={19} fill={a % 144 ? '#fff' : P.pink} {...ST} />
          ))}
          <circle r={14} fill={P.butter} {...ST} />
        </g>
      );
    case 'donut':
      return (
        <g>
          <circle r={60} fill="#E9C089" stroke={P.cocoa} strokeWidth={4} />
          <path d="M-56 -8 C-50 -50 50 -56 56 -6 C60 20 40 14 30 26 C18 40 0 22 -16 34 C-34 44 -60 22 -56 -8Z" fill={P.pinkDeep} stroke={P.cocoa} strokeWidth={4} />
          <circle r={20} fill={P.cream} stroke={P.cocoa} strokeWidth={4} />
          {[[-34, -26, 20], [8, -44, -30], [36, -20, 60], [-40, 6, -50], [30, 10, 10], [-6, -34, 80]].map(([x, y, r], j) => (
            <rect key={j} x={x - 7} y={y - 2.5} width={14} height={5} rx={2.5} fill={[P.butter, '#fff', P.blueDeep][j % 3]} transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      );
  }
};
const END_AT = T(10);
const Stickers: React.FC<{layer: 'main' | 'end'}> = ({layer}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#c9ccd6" />
          <stop offset="0.5" stopColor="#f6f7fb" />
          <stop offset="0.7" stopColor="#9da3b4" />
          <stop offset="1" stopColor="#eef0f6" />
        </linearGradient>
        {/* die-cut sticker look: white border + soft shadow */}
        <filter id="diecut" x="-40%" y="-40%" width="180%" height="180%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="d" operator="in" result="w" />
          <feGaussianBlur in="d" stdDeviation="5" result="b" />
          <feOffset in="b" dy="5" result="o" />
          <feFlood floodColor="rgba(78,59,48,0.28)" />
          <feComposite in2="o" operator="in" result="sh" />
          <feMerge><feMergeNode in="sh" /><feMergeNode in="w" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {THINGS.map((th, i) => {
        if ((layer === 'end') !== th.at >= END_AT - 0.01) return null;
        if (t < th.at || t > th.end) return null;
        const p = pop(f, th.at, 8, 300) * fadeOut(f, th.end);
        const k = f - sec(th.at);
        const sq = 0.16 * Math.sin(k * 0.8) * Math.exp(-k * 0.18);
        const bob = Math.sin((f + i * 13) / 9) * 6;
        const rot = (th.rot ?? 0) + Math.sin((f + i * 7) / 12) * 8 + (th.kind === 'chrome' ? f * 1.5 : 0);
        const tr = `translate(${th.x} ${th.y + bob}) rotate(${rot}) scale(${1.5 * th.s * p * (1 + sq)} ${1.5 * th.s * p * (1 - sq)})`;
        const cut = th.kind !== 'bubble' && th.kind !== 'chrome';
        return (
          <g key={i} transform={tr} filter={cut ? 'url(#diecut)' : undefined} style={th.kind === 'chrome' ? {filter: 'drop-shadow(0 4px 6px rgba(78,59,48,0.35))'} : undefined}>
            {drawThing(th)}
          </g>
        );
      })}
    </svg>
  );
};
const STICKER_SFX = ['sticker', 'cute_pop', 'bloop', 'blip_up', 'plink', 'bubble_pop'];

/** scrapbook sticky note "cara main" */
const StickyNote: React.FC<{at: number; end: number}> = ({at, end}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const p = pop(f, at, 9, 260) * fadeOut(f, end);
  const lines = ['1. spray', '2. jadi foam', '3. bentuk ikut suka'];
  return (
    <div style={{position: 'absolute', left: SAFE.left + 10, top: SAFE.top + 30, width: 400, padding: '34px 26px 26px', background: '#FFF1B8', boxShadow: '0 14px 24px rgba(78,59,48,0.25)', transform: `rotate(-5deg) scale(${p})`, transformOrigin: '20% 0%'}}>
      <div style={{position: 'absolute', top: -18, left: 140, width: 130, height: 40, background: 'rgba(246,201,208,0.85)', transform: 'rotate(4deg)'}} />
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 800, fontSize: 48, color: P.pinkDeep, marginBottom: 6}}>cara main</div>
      {lines.map((l, i) => {
        const k = pop(f, at + 0.25 + i * 0.3, 12, 300);
        return (
          <div key={i} style={{fontFamily: NUN, fontWeight: 800, fontSize: 36, color: P.cocoa, opacity: c01(k * 1.5), transform: `translateX(${(1 - k) * -20}px)`, lineHeight: 1.35}}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

/** fast-forward badge on sped-up shots */
const FF: React.FC<{at: number; end: number; rate: string}> = ({at, end, rate}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const p = pop(f, at, 12, 300) * fadeOut(f, end, 0.08);
  return (
    <div style={{position: 'absolute', right: 1080 - SAFE.right + 10, top: SAFE.top + 20, display: 'flex', alignItems: 'center', gap: 6, background: P.cocoa, borderRadius: 30, padding: '6px 18px 8px 14px', transform: `scale(${p})`, opacity: 0.92}}>
      <svg width={44} height={26} viewBox="0 0 44 26">
        <path d="M2 2 L20 13 L2 24Z M22 2 L40 13 L22 24Z" fill={P.butter} opacity={Math.floor(f / 6) % 2 ? 1 : 0.6} />
      </svg>
      <span style={{fontFamily: ROUND, fontWeight: 700, fontSize: 32, color: P.butter}}>{rate}</span>
    </div>
  );
};

/** end card: polaroid of the can (from the creator's own footage) + logo + tagline */
const EndCard: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < sec(at)) return null;
  const veil = c01((f - sec(at)) / 6);
  const pol = pop(f, at + 0.1, 9, 240);
  const logo = pop(f, at + 0.45, 7, 300);
  const k = f - sec(at + 0.45);
  const st = k > 0 ? 0.15 * Math.sin(k * 0.8) * Math.exp(-k * 0.15) : 0;
  const tag = pop(f, at + 0.8, 10, 280);
  const flash = Math.max(0, 1 - Math.abs(f - sec(at + 0.15)) / 3);
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, rgba(255,249,241,0.82), rgba(247,227,161,0.88))`, opacity: veil}} />
      <div style={{position: 'absolute', left: 540 - 200, top: 300, width: 400, padding: '20px 20px 74px', background: '#fff', boxShadow: '0 18px 30px rgba(78,59,48,0.28)', transform: `rotate(${-7 + (1 - pol) * -20}deg) scale(${pol}) translateY(${(1 - pol) * -200}px)`}}>
        <div style={{position: 'absolute', top: -20, left: 130, width: 140, height: 42, background: 'rgba(201,226,244,0.9)', transform: 'rotate(-3deg)'}} />
        <Img src={staticFile('booih2/can_polaroid.png')} style={{width: 360, height: 360, display: 'block', objectFit: 'cover'}} />
        <div style={{position: 'absolute', bottom: 14, width: 360, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 800, fontSize: 34, color: P.cocoa}}>booih Fun Foam Cleanser</div>
      </div>
      <div style={{position: 'absolute', top: 900, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Img src={staticFile('brand/booih_logo.png')} style={{width: 520, height: (520 * 477) / 858, transform: `scale(${logo * (1 + st)}, ${logo * (1 - st)}) rotate(${Math.sin(f / 9) * 3}deg)`, filter: 'drop-shadow(0 12px 22px rgba(80,40,60,0.25))'}} />
        <div style={{marginTop: 16, background: P.pinkDeep, color: '#fff', fontFamily: NUN, fontWeight: 900, fontSize: 50, padding: '10px 34px 14px', borderRadius: 44, border: '6px solid #fff', boxShadow: `0 6px 0 ${P.cocoa}`, transform: `scale(${tag}) rotate(-3deg)`, whiteSpace: 'nowrap'}}>
          Booih dulu, baru mandi!
        </div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.8}} />
    </>
  );
};

/* ---------------- sound: dense SFX, no original audio, no music ---------------- */
const SFX: [number, string, number][] = [
  [0.0, 'twinkle', 0.35], [0.35, 'psst', 0.3], [T(0, 1.1), 'blip_up', 0.4], [T(0, 1.6), 'xylo_up', 0.45], [T(0, 1.62), 'boing2', 0.3],
  [T(0, 2.7), 'bloop', 0.4],
  [T(1) - 0.13, 'whoosh', 0.22], [T(1, 0.05), 'chime', 0.3], [T(1, 0.3), 'bubble_pop', 0.35], [T(1, 0.6), 'bubble_pop', 0.35], [T(1, 0.9), 'bubble_pop', 0.35], [T(1, 1.0), 'blip_up', 0.35],
  [T(2) - 0.13, 'whoosh', 0.22], [T(2, 0.6), 'slide_up', 0.4], [T(2, 0.62), 'wink', 0.35],
  [T(3) - 0.13, 'whoosh', 0.25], [T(3, 0.15), 'xylo_up', 0.45], [T(3, 0.2), 'heart', 0.45], [T(3, 1.4), 'bloop', 0.4], [T(3, 2.4), 'sparkle', 0.3],
  [T(4) - 0.13, 'whoosh', 0.22], [T(4, 0.1), 'squish2', 0.5], [T(4, 0.15), 'toy_squeak', 0.4], [T(4, 0.5), 'squish', 0.45], [T(4, 0.9), 'toy_squeak', 0.4], [T(4, 1.0), 'squeak', 0.3],
  [T(5) - 0.13, 'whoosh', 0.22], [T(5, 0.15), 'boing', 0.5], [T(5, 1.2), 'slide_down', 0.35], [T(5, 2.1), 'boing2', 0.45], [T(5, 2.15), 'wink', 0.3],
  [T(6), 'glitch', 0.4], [T(6, 0.25), 'oops', 0.35],
  [T(7) - 0.13, 'whoosh', 0.25], [T(7, 0.15), 'xylo_up', 0.45], [T(7, 0.2), 'ding', 0.35], [T(7, 1.3), 'bloop', 0.4],
  [T(8) - 0.13, 'whoosh', 0.22], [T(8, 0.1), 'squish2', 0.45], [T(8, 0.2), 'toy_squeak', 0.35], [T(8, 0.8), 'squish', 0.4], [T(8, 1.6), 'cute_pop', 0.4], [T(8, 2.1), 'toy_squeak', 0.35], [T(8, 2.2), 'sparkle', 0.3],
  [T(9) - 0.13, 'whoosh', 0.22], [T(9, 0.2), 'psst', 0.2], [T(9, 1.4), 'xylo_up', 0.45], [T(9, 1.45), 'tada', 0.35], [T(9, 2.2), 'chime', 0.3],
  [T(10) - 0.13, 'whoosh', 0.25], [T(10, 0.15), 'shutter', 0.55], [T(10, 0.45), 'boing2', 0.45], [T(10, 0.8), 'xylo_down', 0.35], [T(10, 1.0), 'twinkle', 0.3],
  // every sticker lands with a tiny cute sound
  ...THINGS.map((th, i): [number, string, number] => [th.at, STICKER_SFX[i % STICKER_SFX.length], 0.2]),
];
const Sound: React.FC = () => (
  <>
    {SFX.map(([at, name, v], i) => (
      <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={60} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

export const BooihKick: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = camera(t);
  return (
    <AbsoluteFill style={{background: P.cream}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <AbsoluteFill style={{transform: `translate(${cam.dx}px, ${cam.dy}px) scale(${cam.scale})`, transformOrigin: `50% ${cam.oy}%`}}>
          {SEG_F.map((s, i) => (
            <Sequence key={i} from={s.from} durationInFrames={s.len}>
              <OffthreadVideo src={staticFile('booih2/enhanced.mp4')} startFrom={s.src} playbackRate={s.rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </Sequence>
          ))}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* speed lines on the reveals */}
      <SpeedLines at={T(3, 0.15)} end={T(3, 1.2)} />
      <SpeedLines at={T(7, 0.15)} end={T(7, 1.2)} />
      <SpeedLines at={T(9, 1.4)} end={T(9, 2.4)} col={P.butter} />

      <Stickers layer="main" />

      {/* 0 hook */}
      <Sub at={0.35} end={T(0, 1.9)} text="spray je *sikit*" />
      <Sub at={T(0, 2.0)} end={T(0, 3.75)} text="makin KEMBANG~" />
      {/* 1 foam forms */}
      <StickyNote at={T(1, 0.05)} end={T(2, 0.55)} />
      <FF at={T(1)} end={T(2) - 0.03} rate="x1.6" />
      <Sub at={T(1, 0.1)} end={T(2) - 0.03} text="terus jadi FOAM" />
      {/* 2 toss */}
      <BigWord text="wheee~" at={T(2, 0.6)} end={T(2, 1.55)} size={130} cols={[P.gold, P.butter]} y={560} rot={6} />
      {/* 3 heart */}
      <BigWord text="LOVE?!" at={T(3, 0.15)} end={T(3, 1.3)} size={200} cols={[P.pinkDeep, '#F2A9B5']} y={600} rot={-5} />
      <Sub at={T(3, 1.35)} end={T(3, 3.35)} text="boleh bentuk love pulak" />
      {/* 4 squish */}
      <FF at={T(4)} end={T(5) - 0.03} rate="x1.6" />
      <BigWord text="squish" at={T(4, 0.1)} end={T(4, 0.85)} size={140} cols={[P.sageDeep, '#A3C495']} y={560} rot={-6} />
      <BigWord text="squish!" at={T(4, 0.9)} end={T(4, 1.85)} size={150} cols={[P.blueDeep, '#A9CFEA']} y={600} rot={5} />
      <Sub at={T(4, 0.2)} end={T(5) - 0.03} text="lembut *gila*" />
      {/* 5 tosses */}
      <BigWord text="BOING!" at={T(5, 0.15)} end={T(5, 1.2)} size={190} cols={[P.gold, '#EBCB78']} y={1150} rot={-6} />
      <Sub at={T(5, 1.25)} end={T(5, 2.95)} text="baling-baling pun BOLEH" />
      <BigWord text="boing!" at={T(5, 2.1)} end={T(5, 2.95)} size={120} cols={[P.pinkDeep]} y={1150} rot={7} />
      {/* 6 glitch + rolling */}
      <Glitch at={T(6)} frames={6} />
      <FF at={T(6, 0.2)} end={T(7) - 0.03} rate="x1.8" />
      <Sub at={T(6, 0.25)} end={T(7) - 0.03} text="gulung... gulung..." />
      {/* 7 donut */}
      <BigWord text="DONUT?!" at={T(7, 0.15)} end={T(7, 1.25)} size={190} cols={[P.pinkDeep, P.gold]} y={560} rot={-4} />
      <Sub at={T(7, 1.3)} end={T(7, 2.45)} text="bentuk donut pun boleh" />
      {/* 8 squishing */}
      <FF at={T(8)} end={T(9) - 0.03} rate="x1.8" />
      <BigWord text="satisfying" at={T(8, 0.1)} end={T(8, 2.7)} size={120} cols={[P.gold]} y={520} rot={-6} font={SERIF} italic stagger={0.025} />
      <BigWord text="GILA" at={T(8, 0.55)} end={T(8, 2.7)} size={190} cols={[P.pinkDeep, '#F2A9B5']} y={660} rot={3} />
      <Sub at={T(8, 0.3)} end={T(9) - 0.03} text="tak boleh berhenti tengok" />
      {/* 9 reveal */}
      <FF at={T(9)} end={T(9, 1.35)} rate="x1.5" />
      <Sub at={T(9, 0.1)} end={T(9, 1.35)} text="tapi sebenarnya..." />
      <BigWord text="SABUN" at={T(9, 1.4)} end={T(9, 3.3)} size={210} cols={[P.pinkDeep, '#F2A9B5']} y={560} rot={-4} />
      <BigWord text="rupanya!" at={T(9, 1.7)} end={T(9, 3.3)} size={120} cols={[P.gold]} y={730} rot={-4} font={SERIF} italic />
      <Sub at={T(9, 2.0)} end={T(9, 3.3)} text="mandi jadi FUN" />
      {/* 10 end */}
      <EndCard at={T(10)} />
      <Stickers layer="end" />

      <Streaks />
      <Sound />
    </AbsoluteFill>
  );
};
