import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SAFE} from '../theme';
import {BEATS, brushFont, sansFont, serifFont2, y2kFont} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SOFT = {damping: 14, stiffness: 150, mass: 0.7};
const ZONE_L = SAFE.left; // 80
const ZONE_W = SAFE.right - SAFE.left; // 830
const TOP_Y = SAFE.top + 70; // 230: text block sits in the upper third
const OUTLINE = '#4B3340'; // deep plum-cocoa edge
const YELLOW = '#FFE45C'; // sticker / highlight yellow (ref 4)

/* ================================================================== */
/* type recipes, one per reference                                     */
/* ================================================================== */
// soft edge so the butter yellow stays readable on the pale wall without looking heavy
const edge = (w: number, glow = 0.45): React.CSSProperties => ({
  WebkitTextStroke: `${w}px ${OUTLINE}`,
  paintOrder: 'stroke fill',
  textShadow: `0 4px 14px rgba(40,22,32,${glow})`,
});

type Kind =
  | 'sans' // ref 1/4: clean rounded sans
  | 'pill' // ref 1/4: keyword in a coloured highlight box
  | 'serif' // ref 2: upright editorial serif
  | 'serifItalic' // ref 2: italic serif
  | 'brush' // ref 2: white brush script ("makan")
  | 'y2k'; // ref 3: bubbly geometric letters, pastel fill + dark outline
type Tok = {t: string; k?: Kind; color?: string; size?: number; bg?: string; star?: 'chrome' | 'yellow'};

const styleFor = (tok: Tok, size: number): React.CSSProperties => {
  const k = tok.k ?? 'sans';
  const color = tok.color ?? C.butter;
  switch (k) {
    case 'sans':
      return {fontFamily: sansFont, fontWeight: 500, fontSize: size, color, letterSpacing: 0.2, ...edge(5)};
    case 'pill':
      return {fontFamily: sansFont, fontWeight: 500, fontSize: size * 0.92, color: tok.color ?? C.plum, letterSpacing: 0.2};
    case 'serif':
      return {fontFamily: serifFont2, fontWeight: 600, fontSize: size * 1.15, color, letterSpacing: -0.5, ...edge(4)};
    case 'serifItalic':
      return {fontFamily: serifFont2, fontStyle: 'italic', fontWeight: 400, fontSize: size * 1.1, color, ...edge(4)};
    case 'brush':
      return {fontFamily: brushFont, fontWeight: 400, fontSize: size * 1.3, color: tok.color ?? '#FFFDF6', ...edge(5)};
    case 'y2k':
      return {fontFamily: y2kFont, fontWeight: 700, fontSize: size * 1.1, color: tok.color ?? C.lavender, letterSpacing: -1, ...edge(8, 0.35)};
  }
};

/** words spring in one by one, bob gently, then lift away at the end of the beat */
const Lines: React.FC<{
  lines: Tok[][];
  top: number;
  size?: number;
  delay?: number;
  gap?: number;
  hold?: boolean;
  align?: 'center' | 'flex-start';
  indent?: number[]; // per-line x offset (cascading stack, ref 3)
  lineGap?: number;
}> = ({lines, top, size = 68, delay = 3, gap = 2, hold = false, align = 'center', indent, lineGap = 0}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const exit = hold ? 0 : interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  let idx = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: ZONE_L,
        width: ZONE_W,
        top,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align,
        rowGap: lineGap,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 24}px)`,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{display: 'flex', flexWrap: 'nowrap', justifyContent: align, alignItems: 'center', columnGap: 16, marginLeft: indent?.[li] ?? 0}}
        >
          {line.map((tok, ti) => {
            const i = idx++;
            const p = spring({frame: frame - delay - i * gap, fps, config: SOFT});
            const bob = Math.sin((frame + i * 11) / 13) * 2.5;
            const s = tok.size ?? size;
            if (tok.star) {
              return (
                <div key={ti} style={{transform: `scale(${p}) rotate(${(1 - p) * 120}deg)`, margin: '0 -4px'}}>
                  {tok.star === 'chrome' ? <ChromeStar size={s * 0.75} phase={i * 9} /> : <YellowSparkle size={s * 0.8} phase={i * 9} />}
                </div>
              );
            }
            const st = styleFor(tok, s);
            if (tok.k === 'pill') {
              // highlight box wipes open left->right, then the word pops inside (ref 1 "Unboxing" / ref 4 "OTW Ngalcer")
              const wipe = spring({frame: frame - delay - i * gap, fps, config: {damping: 18, stiffness: 160}});
              const txt = spring({frame: frame - delay - i * gap - 4, fps, config: SOFT});
              return (
                <div key={ti} style={{position: 'relative', transform: `translateY(${bob}px) rotate(-2deg)`, padding: '2px 26px 6px'}}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 22,
                      background: tok.bg ?? C.pink,
                      border: `4px solid ${OUTLINE}`,
                      boxShadow: `0 6px 0 ${OUTLINE}, 0 12px 24px rgba(40,22,32,0.3)`,
                      transform: `scaleX(${wipe})`,
                      transformOrigin: 'left center',
                    }}
                  />
                  <span style={{position: 'relative', display: 'inline-block', lineHeight: 1.15, opacity: txt, transform: `scale(${0.8 + 0.2 * txt})`, whiteSpace: 'nowrap', ...st}}>
                    {tok.t}
                  </span>
                </div>
              );
            }
            return (
              <span
                key={ti}
                style={{
                  display: 'inline-block',
                  lineHeight: tok.k === 'brush' ? 1.05 : 1.12,
                  opacity: Math.min(1, p * 1.5),
                  transform: `translateY(${(1 - p) * 26 + bob}px) scale(${0.7 + 0.3 * p}) rotate(${(random(`r${li}${ti}`) - 0.5) * 4 * p}deg)`,
                  whiteSpace: 'nowrap',
                  ...st,
                }}
              >
                {tok.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ================================================================== */
/* stickers                                                            */
/* ================================================================== */
// puffy chrome star (refs 2 + 3)
export const ChromeStar: React.FC<{size?: number; phase?: number; points?: 4 | 5}> = ({size = 60, phase = 0, points = 5}) => {
  const frame = useCurrentFrame();
  const rot = Math.sin((frame + phase) / 22) * 10;
  const shine = 30 + 40 * ((((frame + phase) % 60) + 60) % 60) / 60;
  const id = `cs${phase}${points}`;
  const pts = Array.from({length: points * 2}, (_, i) => {
    const r = i % 2 === 0 ? 46 : points === 5 ? 21 : 14;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${rot}deg)`, overflow: 'visible', filter: 'drop-shadow(0 4px 6px rgba(40,22,32,0.35))'}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset={`${shine / 100}`} stopColor="#C9CCD6" />
          <stop offset="0.62" stopColor="#7C808E" />
          <stop offset="0.8" stopColor="#E8EAF0" />
          <stop offset="1" stopColor="#9A9EAB" />
        </linearGradient>
      </defs>
      <polygon points={pts} fill={`url(#${id})`} stroke={`url(#${id})`} strokeWidth={12} strokeLinejoin="round" />
      <polygon points={pts} fill="none" stroke="#5E6270" strokeWidth={1.5} strokeLinejoin="round" opacity={0.6} />
      <ellipse cx="40" cy="36" rx="8" ry="4" fill="#fff" opacity={0.85} transform="rotate(-35 40 36)" />
    </svg>
  );
};

// chunky yellow sparkle sticker with a white keyline (ref 4)
export const YellowSparkle: React.FC<{size?: number; phase?: number; color?: string}> = ({size = 50, phase = 0, color = YELLOW}) => {
  const frame = useCurrentFrame();
  const tw = 0.85 + 0.15 * Math.sin((frame + phase) / 5);
  const d = 'M50 2 C55 36 64 45 98 50 C64 55 55 64 50 98 C45 64 36 55 2 50 C36 45 45 36 50 2 Z';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `scale(${tw}) rotate(${Math.sin((frame + phase) / 18) * 12}deg)`, overflow: 'visible'}}>
      <path d={d} fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
      <path d={d} fill={color} stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx="44" cy="40" r="5" fill="#fff" opacity={0.9} />
    </svg>
  );
};

// kept for the lyric captions' little hopping sparkle
export const PixelSparkle: React.FC<{size?: number; color?: string; phase?: number}> = ({size = 30, phase = 0}) => (
  <YellowSparkle size={size} phase={phase} />
);

/** sticker burst used to punctuate text-beat changes */
const Burst: React.FC<{x: number; y: number; n?: number; seed: string; spread?: number}> = ({x, y, n = 6, seed, spread = 190}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(seed + i) * 0.6;
        const d = interpolate(frame, [0, 16], [0, spread * (0.6 + 0.4 * random(seed + 'd' + i))], {...clamp, easing: Easing.out(Easing.cubic)});
        const o = interpolate(frame, [0, 3, 12, 20], [0, 1, 1, 0], clamp);
        const s = 22 + 18 * random(seed + 's' + i);
        return (
          <div key={i} style={{position: 'absolute', left: x + Math.cos(a) * d - s / 2, top: y + Math.sin(a) * d - s / 2, opacity: o}}>
            {i % 2 ? <ChromeStar size={s} phase={i * 7} points={4} /> : <YellowSparkle size={s} phase={i * 5} />}
          </div>
        );
      })}
    </>
  );
};

/** anime-style speed lines flashing in from the frame edges (ref 1) */
const SpeedLines: React.FC<{cx: number; cy: number; seed: string}> = ({cx, cy, seed}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 3, 14, 22], [0, 0.85, 0.6, 0], clamp);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      {Array.from({length: 18}).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + random(seed + i) * 0.25;
        const r0 = 560 + random(seed + 'r' + i) * 160 - frame * 6;
        const r1 = 1300;
        return (
          <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * r1} y2={cy + Math.sin(a) * r1} stroke="#FFFDF6" strokeWidth={3 + random(seed + 'w' + i) * 5} strokeLinecap="round" />
        );
      })}
    </svg>
  );
};

/* ---- beat 1: comment bubble "pakai mana dulu ? merah or pink ?" ---- */
const PixelHeart: React.FC<{size?: number; color?: string}> = ({size = 40, color = C.pink}) => {
  const rows = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  return (
    <svg width={size} height={(size * 6) / 7} viewBox="0 0 7 6" shapeRendering="crispEdges">
      {rows.flatMap((r, y) =>
        r.split('').map((ch, x) => (ch === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={x === 1 && y === 1 ? '#fff' : color} /> : null)),
      )}
    </svg>
  );
};

const CommentBubble: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = spring({frame: frame - 1, fps, config: {damping: 11, stiffness: 170, mass: 0.6}});
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], {...clamp, easing: Easing.in(Easing.back(1.6))});
  const wobble = Math.sin(frame / 9) * 1.2;
  const typed = (s: string, startF: number) => s.slice(0, Math.max(0, Math.floor((frame - startF) * 1.6)));
  const l1 = 'pakai mana dulu ?';
  const l2 = 'merah or pink ?';
  const line: React.CSSProperties = {fontFamily: sansFont, fontWeight: 500, fontSize: 50, lineHeight: 1.2, color: '#1F1A1D', minHeight: 60};
  return (
    <div
      style={{
        position: 'absolute',
        left: ZONE_L + 40,
        top: SAFE.top + 40,
        transformOrigin: '12% 100%',
        transform: `scale(${(0.4 + 0.6 * p) * (1 - exit)}) rotate(${-3 + wobble + (1 - p) * -10}deg)`,
        opacity: Math.min(1, p * 1.6) * (1 - exit),
      }}
    >
      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          borderRadius: 30,
          padding: '20px 36px 22px 24px',
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          boxShadow: `0 6px 0 ${C.pink}, 0 18px 34px rgba(60,30,45,0.3)`,
          minWidth: 600,
        }}
      >
        <div style={{width: 84, height: 84, borderRadius: 42, background: `linear-gradient(160deg, ${C.pink}, ${C.lavender})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid #fff'}}>
          <PixelHeart size={44} color={C.rose} />
        </div>
        <div>
          <div style={{fontFamily: sansFont, fontWeight: 400, fontSize: 28, color: '#8E8A8C', marginBottom: 4}}>Reply to comment</div>
          <div style={line}>{typed(l1, 4)}</div>
          <div style={line}>
            {typed(l2, 4 + l1.length / 1.6)
              .split(/(merah|pink)/)
              .map((part, i) => (
                <span key={i} style={{color: part === 'merah' ? '#D6336C' : part === 'pink' ? '#F06BA8' : undefined}}>
                  {part}
                </span>
              ))}
          </div>
        </div>
        <div style={{position: 'absolute', left: 54, bottom: -24, width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: '28px solid #FFFFFF'}} />
      </div>
      <div style={{position: 'absolute', right: -30, top: -34}}>
        <ChromeStar size={64} phase={3} />
      </div>
    </div>
  );
};

/* ---- "for growth": a little sprout that grows ---- */
const Sprout: React.FC<{x: number; y: number; delay: number}> = ({x, y, delay}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const g = interpolate(frame - delay, [0, 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const leaf = spring({frame: frame - delay - 14, fps, config: {damping: 10, stiffness: 160}});
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], clamp);
  const sway = Math.sin(frame / 10) * 4;
  return (
    <svg width={110} height={130} viewBox="0 0 110 130" style={{position: 'absolute', left: x, top: y, opacity: exit, transform: `rotate(${sway}deg)`, transformOrigin: '50% 100%', overflow: 'visible'}}>
      <path d="M55 128 C55 100 52 80 56 52" stroke={OUTLINE} strokeWidth={13} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
      <path d="M55 128 C55 100 52 80 56 52" stroke="#9BDDB0" strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
      <g transform={`translate(56 60) scale(${leaf})`}>
        <path d="M0 0 C-10 -26 -38 -32 -46 -22 C-38 -6 -16 4 0 0 Z" fill="#B9EBC6" stroke={OUTLINE} strokeWidth={4} />
        <path d="M0 -6 C10 -32 38 -40 48 -30 C40 -12 18 -2 0 -6 Z" fill="#9BDDB0" stroke={OUTLINE} strokeWidth={4} />
      </g>
    </svg>
  );
};

/* ---- jelly droplets that squish-bounce for "jelly lash oil" ---- */
const JellyDrop: React.FC<{x: number; y: number; delay: number; color: string; size?: number}> = ({x, y, delay, color, size = 56}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 8, stiffness: 140, mass: 0.6}});
  const k = frame - delay;
  const cyc = (k % 26) / 26;
  const hop = k < 0 ? 0 : Math.abs(Math.sin(cyc * Math.PI)) * 22;
  const squash = k < 0 ? 1 : 1 + 0.16 * Math.max(0, Math.cos(cyc * Math.PI * 2)) * (hop < 6 ? 1 : 0);
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], clamp);
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 80 96"
      style={{position: 'absolute', left: x, top: y - hop, opacity: Math.min(1, p * 2) * exit, transform: `scale(${p * squash}, ${p / squash})`, transformOrigin: '50% 100%', overflow: 'visible'}}
    >
      <path d="M40 4 C56 30 74 46 74 64 C74 84 58 94 40 94 C22 94 6 84 6 64 C6 46 24 30 40 4 Z" fill={color} stroke={OUTLINE} strokeWidth={5} />
      <ellipse cx="27" cy="60" rx="7" ry="12" fill="#fff" opacity={0.75} />
      <circle cx="31" cy="72" r="3.4" fill={OUTLINE} />
      <circle cx="50" cy="72" r="3.4" fill={OUTLINE} />
      <path d="M36 80 Q40 84 45 80" stroke={OUTLINE} strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/* ---- floating water droplets for "hydrating serum" ---- */
const Drops: React.FC<{y: number}> = ({y}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], clamp);
  const spots: [number, number, number][] = [
    [ZONE_L + 20, y, 0],
    [SAFE.right - 60, y - 20, 8],
  ];
  return (
    <>
      {spots.map(([x, yy, d], i) => {
        const o = interpolate(frame - 6 - d, [0, 8], [0, 1], clamp) * exit;
        const fy = Math.sin((frame + d * 5) / 12) * 8;
        return (
          <svg key={i} width={46} height={58} viewBox="0 0 80 100" style={{position: 'absolute', left: x, top: yy + fy, opacity: o, transform: `rotate(${i ? 12 : -12}deg)`}}>
            <path d="M40 4 C56 30 74 48 74 66 C74 86 58 96 40 96 C22 96 6 86 6 66 C6 48 24 30 40 4 Z" fill={C.sky} stroke={OUTLINE} strokeWidth={5} />
            <ellipse cx="27" cy="62" rx="7" ry="12" fill="#fff" opacity={0.8} />
          </svg>
        );
      })}
    </>
  );
};

/* ---- stickers that pop on and wiggle for a whole beat ---- */
const Sticker: React.FC<{x: number; y: number; delay: number; children: React.ReactNode}> = ({x, y, delay, children}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 10, stiffness: 170, mass: 0.6}});
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], clamp);
  return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${p * exit})`, opacity: Math.min(1, p * 2)}}>{children}</div>;
};

/* ---- final CTA: "WAJIB CUBA NI!" bubbly letters hop in ---- */
const BouncyWord: React.FC<{text: string; size: number; delay: number}> = ({text, size, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const colors = [C.butter, C.butter, C.butter, C.butter, C.butter, ' ', C.pink, C.pink, C.pink, C.pink, ' ', C.lavender, C.lavender, C.butter];
  return (
    <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap'}}>
      {text.split('').map((ch, i) => {
        const p = spring({frame: frame - delay - i * 0.7, fps, config: {damping: 9, stiffness: 190, mass: 0.5}});
        const wave = Math.sin((frame - i * 3) / 5) * 4 * Math.min(1, p);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: ch === ' ' ? size * 0.3 : undefined,
              fontFamily: y2kFont,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.1,
              letterSpacing: -1,
              color: colors[i] ?? C.butter,
              opacity: Math.min(1, p * 1.6),
              transform: `translateY(${(1 - p) * 50 + wave}px) scale(${p})`,
              ...edge(9, 0.35),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/* ================================================================== */
/* ambient twinkles (very sparse so the screen never gets crowded)     */
/* ================================================================== */
const Twinkles: React.FC = () => {
  const frame = useCurrentFrame();
  const spots: [number, number, number][] = [
    [ZONE_L + 10, SAFE.top + 10, 0],
    [SAFE.right - 40, SAFE.top + 330, 40],
    [SAFE.right - 60, SAFE.bottom - 120, 90],
    [ZONE_L + 20, SAFE.bottom - 300, 130],
  ];
  return (
    <>
      {spots.map(([x, y, ph], i) => {
        const cycle = ((frame + ph) % 110) / 110;
        const o = Math.sin(cycle * Math.PI) ** 2 * 0.8;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y + Math.sin((frame + ph) / 20) * 6, opacity: o}}>
            {i % 2 ? <ChromeStar size={26} phase={ph} points={4} /> : <YellowSparkle size={24} phase={ph} color={C.butter} />}
          </div>
        );
      })}
    </>
  );
};

/* ================================================================== */
/* the beats — same wording as the reference clip                      */
/* ================================================================== */
const T = (t: string, k: Kind = 'sans', o: Partial<Tok> = {}): Tok => ({t, k, ...o});
const CHROME: Tok = {t: '', star: 'chrome'};
const SPARK: Tok = {t: '', star: 'yellow'};

const beatContent: Record<string, React.ReactNode> = {
  comment: <CommentBubble />,

  // ref 1 "Unboxing" — clean sans + keyword in a highlight pill
  tonic: (
    <>
      <Lines top={TOP_Y + 20} lines={[[T('pakai'), T('lash tonic', 'pill', {bg: C.pink}), T('dulu!')]]} />
      <Burst x={495} y={TOP_Y + 60} seed="tonic" />
    </>
  ),

  // ref 2 "After Marriage Date Idea" — italic serif + upright serif + brush script, chrome stars
  root: (
    <>
      <Lines
        top={TOP_Y - 10}
        size={70}
        lineGap={-8}
        lines={[
          [CHROME, T('root', 'serifItalic'), T('treatment', 'serif')],
          [T('for', 'serifItalic'), T('growth', 'brush', {color: '#FFFDF6'}), CHROME],
        ]}
      />
      <Sprout x={SAFE.right - 140} y={TOP_Y + 70} delay={12} />
    </>
  ),

  // ref 3 "what's that edit?!" — bubbly geometric letters, pastel fill + dark outline, cascading stack
  focus: (
    <>
      <Lines
        top={TOP_Y - 40}
        size={80}
        gap={2.5}
        align="flex-start"
        indent={[10, 170]}
        lineGap={-18}
        lines={[
          [T('focus on', 'y2k', {color: C.lavender}), T('lebatkan', 'y2k', {color: C.pink})],
          [T('bulu mata', 'y2k', {color: C.butter})],
        ]}
      />
      <Sticker x={ZONE_L + 30} y={TOP_Y + 110} delay={12}>
        <ChromeStar size={96} phase={5} />
      </Sticker>
    </>
  ),

  // ref 4 "PASAR ANYAR / OTW Ngalcer" — casual sans, yellow highlight pill, yellow sparkle stickers
  jelly: (
    <>
      <Lines top={TOP_Y + 20} lines={[[T('next'), T('jelly lash oil!', 'pill', {bg: YELLOW})]]} />
      <Sticker x={ZONE_L + 60} y={TOP_Y - 40} delay={8}>
        <YellowSparkle size={62} phase={1} />
      </Sticker>
      <Sticker x={SAFE.right - 90} y={TOP_Y + 110} delay={12}>
        <YellowSparkle size={48} phase={9} />
      </Sticker>
      <JellyDrop x={ZONE_L + 120} y={TOP_Y + 150} delay={12} color="#F48FB8" />
      <JellyDrop x={ZONE_L + 200} y={TOP_Y + 170} delay={17} color="#FFC2DA" size={44} />
      <JellyDrop x={SAFE.right - 210} y={TOP_Y + 160} delay={22} color="#E5577F" size={50} />
    </>
  ),

  // ref 2 "mikirin kerja, produktif" — italic serif line + clean sans line, sparkles
  hydrate: (
    <>
      <Lines
        top={TOP_Y - 10}
        size={66}
        lineGap={-4}
        lines={[
          [SPARK, T('hydrating serum,', 'serifItalic')],
          [T('panjangkan bulu mata', 'sans', {size: 58}), SPARK],
        ]}
      />
      <Drops y={TOP_Y + 190} />
    </>
  ),

  // ref 2 brush script headline + ref 1 clean sans body
  worry: (
    <Lines
      top={TOP_Y - 30}
      size={52}
      gap={1.2}
      lineGap={-2}
      lines={[[T("don't worry!", 'brush', {size: 74, color: C.pink})], [T('lash oil ni akan serap into your')], [T('skin macam pakai'), T('skincare!', 'pill', {bg: C.lavender, size: 52})]]}
    />
  ),

  // italic serif question + ref 3 bubbly CTA + ref 1 speed lines
  cta: (
    <>
      <SpeedLines cx={495} cy={1250} seed="cta" />
      <div style={{position: 'absolute', left: ZONE_L, width: ZONE_W, top: 1060}}>
        <Lines top={0} size={56} delay={1} gap={1} hold lineGap={-6} lines={[[T('nak bulu mata', 'serifItalic')], [T('macam Dahlia Rizal?', 'serifItalic')]]} />
        <div style={{position: 'absolute', top: 160, left: 0, width: ZONE_W}}>
          <BouncyWord text="WAJIB CUBA NI!" size={86} delay={4} />
        </div>
      </div>
      <Sticker x={ZONE_L - 10} y={1170} delay={8}>
        <ChromeStar size={80} phase={2} />
      </Sticker>
      <Sticker x={SAFE.right - 70} y={1300} delay={11}>
        <YellowSparkle size={60} phase={6} />
      </Sticker>
      <Sequence from={5} layout="none">
        <Burst x={495} y={1270} n={8} seed="cta" spread={320} />
      </Sequence>
    </>
  ),
};

export const LashGraphics: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Twinkles />
    {BEATS.map((b) => (
      <Sequence key={b.id} from={b.from} durationInFrames={b.to - b.from + (b.id === 'cta' ? 0 : 3)} layout="none">
        {beatContent[b.id]}
      </Sequence>
    ))}
  </AbsoluteFill>
);
