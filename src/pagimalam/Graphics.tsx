import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cross, Droplet, Heart, Moon, Shield, Sparkle, Sun, Warn} from '../Icons';
import {C, CX, F, fr, SAFE} from './theme';

/* ================= helpers (all times are SOURCE seconds; footage plays 1x) ================= */
const SOFT = {damping: 15, stiffness: 150, mass: 0.7};
const BOUNCY = {damping: 10, stiffness: 170, mass: 0.6};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const usePop = (at: number, cfg = SOFT) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - fr(at), fps, config: cfg});
};
const useFloat = (amp = 5, period = 80, phase = 0) => Math.sin(((useCurrentFrame() + phase) * 2 * Math.PI) / period) * amp;
/** 1 while inside [from,to], easing in/out over `len` frames: used for every group exit */
const useWindow = (from: number, to: number, len = 9) => {
  const f = useCurrentFrame();
  return interpolate(f, [fr(from), fr(from) + 1, fr(to) - len, fr(to)], [0, 1, 1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
};

const softShadow = '0 3px 10px rgba(40,22,38,0.45), 0 1px 2px rgba(40,22,38,0.5)';

/* ================= extra stickers ================= */
const Citrus: React.FC<{size?: number}> = ({size = 70}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="#FFB866" stroke="#fff" strokeWidth={6} />
    <circle cx="50" cy="50" r="33" fill="#FFE29A" />
    {Array.from({length: 8}).map((_, i) => (
      <path key={i} d="M50 50 L46 22 Q50 18 54 22 Z" fill="#FFC26E" transform={`rotate(${i * 45} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="5" fill="#fff" />
  </svg>
);
const Bottle: React.FC<{size?: number; color?: string}> = ({size = 70, color = C.lilac}) => (
  <svg width={size * 0.62} height={size} viewBox="0 0 62 100">
    <rect x="22" y="2" width="18" height="22" rx="8" fill={C.plum} opacity={0.75} />
    <rect x="18" y="20" width="26" height="10" rx="3" fill="#fff" />
    <rect x="6" y="28" width="50" height="68" rx="16" fill={color} stroke="#fff" strokeWidth={5} />
    <rect x="15" y="50" width="32" height="24" rx="6" fill="#fff" opacity={0.85} />
    <ellipse cx="17" cy="42" rx="4" ry="8" fill="#fff" opacity={0.7} />
  </svg>
);
const Bricks: React.FC<{size?: number}> = ({size = 70}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80">
    {[
      [4, 4, 44], [52, 4, 44], [4, 30, 26], [34, 30, 44], [82, 30, 14], [4, 56, 44], [52, 56, 44],
    ].map(([x, y, w], i) => (
      <rect key={i} x={x} y={y} width={w} height={20} rx={6} fill={i % 2 ? C.peach : C.pink} stroke="#fff" strokeWidth={4} />
    ))}
  </svg>
);
const Peel: React.FC<{size?: number}> = ({size = 70}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill={C.mint} stroke="#fff" strokeWidth={6} />
    {[[34, 38, 7], [60, 30, 5], [62, 60, 8], [38, 66, 5], [50, 48, 4]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.9} />
    ))}
  </svg>
);
const Star5: React.FC<{size?: number; color?: string}> = ({size = 30, color = C.butterDeep}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 6 L62 38 L96 40 L69 61 L79 94 L50 75 L21 94 L31 61 L4 40 L38 38 Z" fill={color} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

/* ================= ambient whimsy: a few twinkles in the wall area ================= */
const TWINKLES: [number, number, number, number][] = [
  [118, 610, 26, 0], [930, 560, 22, 40], [150, 930, 18, 80], [960, 860, 24, 20], [900, 1080, 16, 60],
];
export const Ambient: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {TWINKLES.map(([x, y, s, d], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y + Math.sin((f + d) / 35) * 8, opacity: 0.42}}>
          <Sparkle size={s} delay={d} color={i % 2 ? C.butter : C.cream} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/* ================= section transition: sparkle sweep + soft bloom ================= */
export const SweepTransition: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame() - fr(at);
  if (f < -2 || f > 22) return null;
  const p = interpolate(f, [0, 18], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const bloom = interpolate(f, [0, 4, 14], [0, 0.16, 0], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 22%, ${C.cream} 0%, rgba(255,251,239,0) 60%)`, opacity: bloom * 3}} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = interpolate(p, [0, 1], [-160, 1240]) - i * 70;
        const y = 210 + Math.sin(p * Math.PI * 2 + i) * 40 + i * 44;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: Math.sin(p * Math.PI) * (1 - i * 0.12)}}>
            <Sparkle size={44 - i * 5} delay={i * 7} color={i % 2 ? C.butter : '#fff'} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ================= HOOK  0.0 – 7.25 ================= */
const HookWord: React.FC<{text: string; at: number; font: string; size: number; color: string; italic?: boolean; tilt?: number}> = ({
  text, at, font, size, color, italic, tilt = 0,
}) => {
  const p = usePop(at, BOUNCY);
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: font,
        fontStyle: italic ? 'italic' : 'normal',
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1,
        color,
        textShadow: softShadow,
        opacity: Math.min(1, p * 1.5),
        transform: `translateY(${(1 - p) * 40}px) scale(${0.5 + 0.5 * p}) rotate(${tilt * p}deg)`,
      }}
    >
      {text}
    </span>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const vis = useWindow(0, 7.3, 10);
  const sunP = usePop(0.05, BOUNCY);
  const moonP = usePop(1.1, BOUNCY);
  const subP = usePop(3.18);
  const qP = usePop(2.34, BOUNCY);
  const qOut = interpolate(f, [fr(3.6), fr(4.0)], [1, 0], clamp);
  // the sun / moon bounce again when she says "pagi" (5.6) and "malam" (6.74)
  const sunHop = spring({frame: f - fr(5.6), fps: 30, config: BOUNCY}) * (1 - interpolate(f, [fr(5.6) + 8, fr(5.6) + 20], [0, 1], clamp));
  const moonHop = spring({frame: f - fr(6.74), fps: 30, config: BOUNCY}) * (1 - interpolate(f, [fr(6.74) + 8, fr(6.74) + 20], [0, 1], clamp));
  const underline = interpolate(f, [fr(3.5), fr(4.6)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const moonSway = useFloat(6, 90);
  if (vis <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: vis, filter: `blur(${(1 - vis) * 6}px)`}}>
      {/* title */}
      <div style={{position: 'absolute', top: SAFE.top + 104, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 22}}>
          <HookWord text="Pagi" at={0.0} font={F.serif} size={112} color={C.butter} italic tilt={-3} />
          <HookWord text="atau" at={0.42} font={F.hand} size={70} color={C.pink} />
          <HookWord text="Malam?" at={1.08} font={F.serif} size={112} color={C.lilac} italic tilt={3} />
        </div>
      </div>
      {/* sun + moon stickers */}
      <div style={{position: 'absolute', left: SAFE.left + 6, top: SAFE.top + 4 - sunHop * 26, transform: `scale(${sunP})`}}>
        <Sun size={92} color={C.butterDeep} />
      </div>
      <div style={{position: 'absolute', left: SAFE.right - 96, top: SAFE.top + 10 - moonHop * 26, transform: `scale(${moonP}) rotate(${moonSway}deg)`}}>
        <Moon size={86} color={C.lilac} />
      </div>
      {/* subtitle with hand-drawn underline */}
      <div
        style={{
          position: 'absolute',
          top: SAFE.top + 236,
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          textAlign: 'center',
          fontFamily: F.hand,
          fontWeight: 500,
          fontSize: 62,
          color: C.cream,
          textShadow: softShadow,
          opacity: subP,
          transform: `translateY(${(1 - subP) * 20}px)`,
        }}
      >
        skincare mana yang sesuai?
        <svg width={460} height={30} viewBox="0 0 460 30" style={{display: 'block', margin: '-4px auto 0'}}>
          <path
            d="M6 18 C90 6 170 26 250 14 S400 8 454 16"
            fill="none"
            stroke={C.butter}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={520}
            strokeDashoffset={520 * (1 - underline)}
          />
        </svg>
      </div>
      {/* "korang tahu tak?" kaomoji bubble */}
      {f < fr(4.0) && (
        <div
          style={{
            position: 'absolute',
            left: 700,
            top: 560,
            padding: '10px 22px 12px',
            borderRadius: 30,
            background: C.cream,
            border: `4px solid ${C.pink}`,
            fontFamily: F.round,
            fontWeight: 600,
            fontSize: 40,
            color: C.plum,
            boxShadow: '0 8px 20px rgba(40,20,40,0.25)',
            opacity: qOut,
            transform: `scale(${qP * qOut}) rotate(${Math.sin(f / 4) * 4}deg)`,
          }}
        >
          (o.o?)
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ================= INGREDIENT SECTION (reference layout: title, tag, two compared cards) ================= */
type Mark = 'check' | 'cross' | 'none';
type Slot = {mark: Mark; at: number; note?: string; noteAt?: number; star?: number; warn?: number};
export type SectionDef = {
  n: number;
  name: string;
  from: number;
  to: number;
  nameAt: number;
  icon: React.ReactNode;
  chip: {text: string; at: number; color: string};
  pagi: Slot;
  malam: Slot;
};

const TypeIn: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame() - fr(at);
  return (
    <span>
      {text.split('').map((ch, i) => {
        const p = interpolate(f, [i * 1.2, i * 1.2 + 7], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: p, transform: `translateY(${(1 - p) * 26}px) scale(${0.6 + 0.4 * p})`}}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

const Card: React.FC<{kind: 'pagi' | 'malam'; slot: Slot; appear: number}> = ({kind, slot, appear}) => {
  const f = useCurrentFrame();
  const p = usePop(appear);
  const mk = usePop(slot.at, BOUNCY);
  const st = usePop(slot.star ?? 999, BOUNCY);
  const wn = usePop(slot.warn ?? 999, BOUNCY);
  const nt = usePop(slot.noteAt ?? slot.at);
  const isPagi = kind === 'pagi';
  const marked = f >= fr(slot.at) && slot.mark !== 'none';
  const dim = slot.mark === 'cross' && marked ? 0.78 : 1;
  const glow = slot.star !== undefined && f >= fr(slot.star);
  const fl = useFloat(4, 90, isPagi ? 0 : 45);
  return (
    <div
      style={{
        position: 'relative',
        width: 262,
        height: 168,
        borderRadius: 30,
        background: isPagi
          ? 'linear-gradient(160deg, rgba(255,251,239,0.95) 0%, rgba(255,236,190,0.92) 100%)'
          : 'linear-gradient(160deg, rgba(246,240,255,0.95) 0%, rgba(214,200,247,0.92) 100%)',
        border: '4px solid #fff',
        boxShadow: glow
          ? `0 0 0 5px ${isPagi ? C.butter : C.lilac}, 0 12px 30px rgba(40,20,40,0.3)`
          : '0 12px 30px rgba(40,20,40,0.28)',
        opacity: Math.min(1, p * 1.4) * dim,
        transform: `translateY(${(1 - p) * 40 + fl}px) scale(${0.7 + 0.3 * p}) rotate(${(isPagi ? -2.5 : 2.5) * p}deg)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      {isPagi ? <Sun size={62} color={C.butterDeep} /> : <Moon size={58} color={C.lavender} />}
      <div style={{fontFamily: F.hand, fontWeight: 600, fontSize: 48, lineHeight: 0.95, color: C.plum}}>{isPagi ? 'pagi' : 'malam'}</div>
      {slot.note && (
        <div
          style={{
            position: 'absolute',
            bottom: -26,
            left: '50%',
            transform: `translateX(-50%) scale(${nt})`,
            padding: '4px 16px 6px',
            borderRadius: 999,
            background: C.plum,
            color: C.cream,
            fontFamily: F.round,
            fontWeight: 600,
            fontSize: 24,
            whiteSpace: 'nowrap',
          }}
        >
          {slot.note}
        </div>
      )}
      {/* tick / cross badge, like the reference's ✗ / ✓ */}
      {slot.mark !== 'none' && (
        <div style={{position: 'absolute', left: -22, top: -22, transform: `scale(${mk}) rotate(${(1 - mk) * -140}deg)`}}>
          {slot.mark === 'check' ? <Check size={64} color={C.ok} /> : <Cross size={64} color={C.no} />}
        </div>
      )}
      {slot.star !== undefined && (
        <div style={{position: 'absolute', right: -16, top: -18, transform: `scale(${st}) rotate(${Math.sin(f / 10) * 10}deg)`}}>
          <Star5 size={54} />
        </div>
      )}
      {slot.warn !== undefined && (
        <div style={{position: 'absolute', right: -14, top: -16, transform: `scale(${wn}) rotate(${Math.sin(f / 5) * 8 * wn}deg)`}}>
          <Warn size={50} color={C.warn} />
        </div>
      )}
    </div>
  );
};

const Section: React.FC<{d: SectionDef}> = ({d}) => {
  const f = useCurrentFrame();
  const vis = useWindow(d.from, d.to, 9);
  const numP = usePop(d.from + 0.05, BOUNCY);
  const iconP = usePop(d.nameAt + 0.25, BOUNCY);
  const chipP = usePop(d.chip.at, BOUNCY);
  const divider = interpolate(f, [fr(d.nameAt + 0.2), fr(d.nameAt + 0.7)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const cardsAt = Math.min(d.pagi.at, d.malam.at) - 0.25;
  const iconSway = useFloat(7, 70);
  if (vis <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: vis, filter: `blur(${(1 - vis) * 7}px)`, transform: `translateY(${(1 - vis) * -14}px)`}}>
      {/* title row: number bubble + ingredient name + sticker */}
      <div
        style={{
          position: 'absolute',
          top: SAFE.top + 18,
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: 40,
            background: C.pink,
            border: '4px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: F.hand,
            fontWeight: 700,
            fontSize: 54,
            color: C.plum,
            boxShadow: '0 8px 18px rgba(40,20,40,0.25)',
            transform: `scale(${numP}) rotate(${(1 - numP) * -90 - 6}deg)`,
            flexShrink: 0,
          }}
        >
          {d.n}
        </div>
        <div style={{fontFamily: F.serif, fontSize: 84, lineHeight: 1, color: C.cream, textShadow: softShadow, whiteSpace: 'nowrap'}}>
          <TypeIn text={d.name} at={d.nameAt} />
        </div>
        <div style={{transform: `scale(${iconP}) rotate(${iconSway}deg)`, flexShrink: 0}}>{d.icon}</div>
      </div>

      {/* tag chip (like the reference's coloured label under the title) */}
      <div style={{position: 'absolute', top: SAFE.top + 122, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            padding: '6px 26px 9px',
            borderRadius: 999,
            background: d.chip.color,
            border: '3px solid #fff',
            fontFamily: F.bubble,
            fontSize: 36,
            color: C.plum,
            letterSpacing: 0.5,
            boxShadow: '0 6px 16px rgba(40,20,40,0.22)',
            opacity: Math.min(1, chipP * 1.5),
            transform: `scale(${0.4 + 0.6 * chipP}) rotate(${(1 - chipP) * 8 - 1.5}deg)`,
          }}
        >
          {d.chip.text}
        </div>
      </div>

      {/* pagi | malam cards with a dashed divider */}
      <div style={{position: 'absolute', top: SAFE.top + 212, left: CX - 300, width: 600, display: 'flex', justifyContent: 'space-between'}}>
        <Card kind="pagi" slot={d.pagi} appear={cardsAt} />
        <svg width={8} height={180} style={{position: 'absolute', left: 296, top: -6}}>
          <line x1="4" y1="4" x2="4" y2={4 + 172 * divider} stroke="#fff" strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" opacity={0.9} />
        </svg>
        <Card kind="malam" slot={d.malam} appear={cardsAt + 0.12} />
      </div>
    </AbsoluteFill>
  );
};

/* ================= the 7 ingredients, timed to her words ================= */
export const SECTIONS: SectionDef[] = [
  {
    n: 1, name: 'Vitamin C', from: 7.27, to: 12.95, nameAt: 8.36,
    icon: <Citrus size={70} />,
    chip: {text: 'highly recommend: pagi', at: 10.7, color: C.butter},
    pagi: {mark: 'check', at: 9.98, star: 11.86, note: 'best time', noteAt: 11.86},
    malam: {mark: 'check', at: 10.1, note: 'boleh juga', noteAt: 10.3},
  },
  {
    n: 2, name: 'Niacinamide', from: 12.95, to: 19.3, nameAt: 13.06,
    icon: <Bottle size={76} color={C.mint} />,
    chip: {text: 'fleksibel', at: 13.72, color: C.mint},
    pagi: {mark: 'check', at: 14.98, star: 18.04, note: 'lagi okey', noteAt: 18.44},
    malam: {mark: 'check', at: 16.3},
  },
  {
    n: 3, name: 'Hyaluronic Acid', from: 19.3, to: 26.45, nameAt: 19.38,
    icon: <Droplet size={52} color={C.sky} />,
    chip: {text: '24/7 hydration', at: 21.58, color: C.sky},
    pagi: {mark: 'check', at: 22.94, note: 'anytime', noteAt: 23.1},
    malam: {mark: 'check', at: 23.1, note: 'anytime', noteAt: 23.25},
  },
  {
    n: 4, name: 'Ceramide', from: 26.45, to: 33.7, nameAt: 26.7,
    icon: <Bricks size={74} />,
    chip: {text: 'support skin barrier', at: 31.74, color: C.peach},
    pagi: {mark: 'check', at: 28.38},
    malam: {mark: 'check', at: 29.7},
  },
  {
    n: 5, name: 'Retinol', from: 33.7, to: 42.03, nameAt: 33.9,
    icon: <Bottle size={76} color={C.lilac} />,
    chip: {text: 'malam je!', at: 36.0, color: C.lilac},
    pagi: {mark: 'cross', at: 39.2, note: 'kulit sensitif', noteAt: 39.4, warn: 41.02},
    malam: {mark: 'check', at: 36.0},
  },
  {
    n: 6, name: 'Salicylic Acid', from: 42.03, to: 49.62, nameAt: 42.06,
    icon: <Shield size={58} color={C.mint} />,
    chip: {text: 'lagi prefer: malam', at: 45.5, color: C.lilac},
    pagi: {mark: 'check', at: 43.82, warn: 48.54, note: 'lebih sensitif', noteAt: 48.6},
    malam: {mark: 'check', at: 44.56, star: 46.22, note: 'prefer', noteAt: 46.3},
  },
  {
    n: 7, name: 'Lactic Acid', from: 49.62, to: 55.62, nameAt: 49.96,
    icon: <Peel size={66} />,
    chip: {text: 'exfoliating ingredient', at: 54.06, color: C.mint},
    pagi: {mark: 'none', at: 52.6},
    malam: {mark: 'check', at: 52.88, star: 53.0, note: 'better', noteAt: 52.5},
  },
];
export const SECTION_STARTS = SECTIONS.map((s) => s.from);

/* ================= little reactions on key moments ================= */
const Reaction: React.FC<{at: number; dur: number; x: number; y: number; children: React.ReactNode}> = ({at, dur, x, y, children}) => {
  const f = useCurrentFrame();
  const p = usePop(at, BOUNCY);
  const out = interpolate(f, [fr(at + dur) - 8, fr(at + dur)], [1, 0], clamp);
  if (f < fr(at) || f > fr(at + dur)) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: out, transform: `scale(${p}) rotate(${Math.sin(f / 6) * 5}deg)`}}>{children}</div>
  );
};
const bubble: React.CSSProperties = {
  padding: '8px 20px 10px',
  borderRadius: 28,
  background: C.cream,
  fontFamily: F.round,
  fontWeight: 600,
  fontSize: 36,
  color: C.plum,
  boxShadow: '0 8px 20px rgba(40,20,40,0.25)',
  whiteSpace: 'nowrap',
};

const Reactions: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* HA: "keep your skin hydrated" -> droplets drift up */}
      {f > fr(24.4) && f < fr(26.4) &&
        [0, 1, 2, 3].map((i) => {
          const k = (f - fr(24.4 + i * 0.2)) / 40;
          if (k < 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: [150, 800, 210, 760][i], top: 1000 - k * 260, opacity: Math.max(0, Math.sin(Math.min(1, k) * Math.PI)) * 0.9}}>
              <Droplet size={38 + (i % 2) * 10} color={C.sky} />
            </div>
          );
        })}
      {/* Retinol + sunlight */}
      <Reaction at={39.25} dur={2.7} x={720} y={640}>
        <div style={{...bubble, border: `4px solid ${C.no}`}}>(&gt;_&lt;)</div>
      </Reaction>
      {/* Ceramide: skin barrier shield */}
      <Reaction at={32.2} dur={1.4} x={760} y={650}>
        <Shield size={84} color={C.peach} />
      </Reaction>
    </AbsoluteFill>
  );
};

/* ================= OUTRO 55.62 – end ================= */
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const a = usePop(55.68, BOUNCY);
  const b = usePop(56.3);
  const c = usePop(58.74, BOUNCY);
  if (f < fr(55.62)) return null;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: SAFE.top - 4, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center'}}>
        <div style={{fontFamily: F.hand, fontWeight: 600, fontSize: 58, color: C.pink, textShadow: softShadow, transform: `scale(${a}) rotate(-3deg)`, opacity: a}}>
          so girls,
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: F.serif,
            fontStyle: 'italic',
            fontSize: 68,
            lineHeight: 1.0,
            color: C.butter,
            textShadow: softShadow,
            opacity: b,
            transform: `translateY(${(1 - b) * 24}px)`,
          }}
        >
          know your <span style={{color: C.cream}}>pagi</span> &amp; <span style={{color: C.lilac}}>malam</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: SAFE.top + 160, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 24px 9px',
            borderRadius: 999,
            background: C.butter,
            border: '4px solid #fff',
            fontFamily: F.bubble,
            fontSize: 36,
            color: C.plum,
            boxShadow: '0 8px 20px rgba(40,20,40,0.25)',
            opacity: Math.min(1, c * 1.5),
            transform: `scale(${0.4 + 0.6 * c}) rotate(${-2 + Math.sin(f / 12) * 1.5}deg)`,
          }}
        >
          <Heart size={34} color={C.rose} /> better results <Sparkle size={30} color={C.cream} />
        </div>
      </div>
      {/* floating hearts */}
      {[0, 1, 2, 3, 4].map((i) => {
        const k = (f - fr(56.0 + i * 0.45)) / 75;
        if (k < 0 || k > 1) return null;
        return (
          <div key={i} style={{position: 'absolute', left: [130, 830, 180, 860, 120][i] + Math.sin(k * 6 + i) * 18, top: 1050 - k * 420, opacity: Math.sin(k * Math.PI) * 0.85}}>
            <Heart size={30 + (i % 3) * 8} color={[C.pink, C.rose, C.butter][i % 3]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Graphics: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Ambient />
    <Hook />
    {SECTIONS.map((d) => (
      <Section key={d.n} d={d} />
    ))}
    <Reactions />
    <Outro />
    {SECTION_STARTS.map((s) => (
      <SweepTransition key={s} at={s} />
    ))}
    <SweepTransition at={55.62} />
  </AbsoluteFill>
);
