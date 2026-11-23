import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {P} from './style';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

type Base = {at: number; until: number; x: number; y: number; size?: number; rot?: number; color?: string};

/** shared pop-in / soft fade-out + gentle idle float for every sticker */
const useLife = (at: number, until: number, seed = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - at, fps, config: {damping: 9, stiffness: 170, mass: 0.6}});
  const out = interpolate(frame, [until - 7, until], [1, 0], clamp);
  const float = Math.sin((frame + seed * 17) / 11) * 5;
  const visible = frame >= at && frame < until;
  return {frame, pop, out, float, visible, local: frame - at};
};

const Wrap: React.FC<Base & {seed?: number; children: (l: ReturnType<typeof useLife>) => React.ReactNode}> = ({
  at,
  until,
  x,
  y,
  size = 100,
  rot = 0,
  seed = 0,
  children,
}) => {
  const l = useLife(at, until, seed);
  if (!l.visible) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity: Math.min(1, l.pop * 1.4) * l.out,
        transform: `translateY(${l.float}px) rotate(${rot + Math.sin((l.frame + seed * 9) / 14) * 5}deg) scale(${l.pop})`,
        filter: 'drop-shadow(0 4px 10px rgba(60,25,40,0.28))',
      }}
    >
      {children(l)}
    </div>
  );
};

export const Sparkle: React.FC<Base & {seed?: number}> = (p) => (
  <Wrap {...p}>
    {(l) => {
      const tw = 0.75 + 0.25 * Math.sin((l.frame + (p.seed ?? 0) * 5) / 4);
      return (
        <svg viewBox="-50 -50 100 100" width="100%" height="100%" style={{transform: `scale(${tw})`}}>
          <path d="M0 -46 C6 -10 10 -6 46 0 C10 6 6 10 0 46 C-6 10 -10 6 -46 0 C-10 -6 -6 -10 0 -46Z" fill={p.color ?? P.butter} />
          <circle r="7" fill="#fff" opacity="0.9" />
        </svg>
      );
    }}
  </Wrap>
);

export const Heart: React.FC<Base & {seed?: number}> = (p) => (
  <Wrap {...p}>
    {(l) => (
      <svg viewBox="0 0 100 92" width="100%" height="100%" style={{transform: `scale(${1 + 0.06 * Math.sin(l.frame / 5)})`}}>
        <path d="M50 88 C20 66 2 48 4 28 C6 10 22 2 34 4 C42 5 48 11 50 18 C52 11 58 5 66 4 C78 2 94 10 96 28 C98 48 80 66 50 88Z" fill={p.color ?? P.pink} stroke="#fff" strokeWidth="5" />
        <ellipse cx="30" cy="26" rx="9" ry="6" fill="#fff" opacity="0.65" transform="rotate(-30 30 26)" />
      </svg>
    )}
  </Wrap>
);

/** pink bow sticker (the reference has one on the cheek) */
export const Bow: React.FC<Base & {seed?: number}> = (p) => (
  <Wrap {...p}>
    {() => (
      <svg viewBox="0 0 120 90" width="100%" height="100%">
        <g stroke="#fff" strokeWidth="5" strokeLinejoin="round">
          <path d="M58 40 C40 10 10 6 8 26 C6 46 30 54 56 48Z" fill={P.pink} />
          <path d="M62 40 C80 10 110 6 112 26 C114 46 90 54 64 48Z" fill={P.pink} />
          <path d="M54 50 L36 84 L48 80 L56 88 L60 54Z" fill={P.rose} />
          <path d="M66 50 L84 84 L72 80 L64 88 L60 54Z" fill={P.rose} />
          <ellipse cx="60" cy="44" rx="11" ry="12" fill={P.rose} />
        </g>
        <path d="M22 22 C28 18 36 20 42 28" stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
      </svg>
    )}
  </Wrap>
);

export const Question: React.FC<Base & {seed?: number}> = (p) => (
  <Wrap {...p}>
    {() => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <text x="50" y="80" textAnchor="middle" fontFamily="PRound" fontWeight={500} fontSize="90" fill={p.color ?? P.butter} stroke={P.cocoa} strokeOpacity="0.35" strokeWidth="2">
          ?
        </text>
      </svg>
    )}
  </Wrap>
);

export const Coin: React.FC<Base & {seed?: number}> = (p) => (
  <Wrap {...p}>
    {(l) => (
      <svg viewBox="-50 -50 100 100" width="100%" height="100%" style={{transform: `scaleX(${Math.cos(l.frame / 7) * 0.35 + 0.65})`}}>
        <circle r="44" fill="#F7D36B" stroke="#fff" strokeWidth="5" />
        <circle r="31" fill="none" stroke="#E2AE3C" strokeWidth="4" />
        <text y="17" textAnchor="middle" fontFamily="PRound" fontWeight={600} fontSize="46" fill="#C98A1E">
          RM
        </text>
      </svg>
    )}
  </Wrap>
);

/** little eyelash doodle with a growing arrow */
export const LashGrow: React.FC<Base> = (p) => (
  <Wrap {...p}>
    {(l) => {
      const d = interpolate(l.local, [4, 22], [1, 0], {...clamp, easing: ease});
      return (
        <svg viewBox="0 0 140 120" width="100%" height="100%">
          <path d="M14 92 Q70 62 126 92" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
          {[22, 40, 58, 76, 94, 112].map((x, k) => (
            <path
              key={k}
              d={`M${x} ${86 - Math.sin((x / 140) * Math.PI) * 18} q ${(x - 70) / 6} -26 ${(x - 70) / 3} -${34 + Math.sin((x / 140) * Math.PI) * 14}`}
              stroke="#fff"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={interpolate(l.local, [k * 2, k * 2 + 12], [1, 0], clamp)}
            />
          ))}
          <path d="M128 70 L128 14 M114 28 L128 12 L142 28" stroke={P.butter} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={d} />
        </svg>
      );
    }}
  </Wrap>
);

/** hand-drawn swoosh underline that draws itself on */
export const Swoosh: React.FC<Base & {w?: number; dur?: number}> = ({at, until, x, y, w = 420, dur = 14, color}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= until) return null;
  const d = interpolate(frame - at, [0, dur], [1, 0], {...clamp, easing: ease});
  const o = interpolate(frame, [until - 7, until], [1, 0], clamp);
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity: o}} width={w} height={40} viewBox={`0 0 ${w} 40`}>
      <path
        d={`M6 26 C ${w * 0.3} 6, ${w * 0.6} 36, ${w - 8} 12`}
        stroke={color ?? P.butter}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={d}
        style={{filter: 'drop-shadow(0 2px 3px rgba(60,30,38,0.45))'}}
      />
    </svg>
  );
};

/** rising bubbles (formula / active ingredients) */
export const Bubbles: React.FC<{at: number; until: number; x: number; y: number}> = ({at, until, x, y}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= until) return null;
  const o = interpolate(frame, [at, at + 8, until - 8, until], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const life = ((frame - at + k * 11) % 60) / 60;
        const r = 14 + ((k * 7) % 4) * 6;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: Math.sin(k * 2.1 + life * 5) * 24 + k * 34,
              top: -life * 240,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.9)',
              background: 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.9) 0 18%, rgba(255,240,166,0.25) 40%, rgba(247,184,204,0.18))',
              opacity: Math.sin(life * Math.PI),
            }}
          />
        );
      })}
    </div>
  );
};

/** soft confetti + heart burst for "Of course boleh!" */
export const Burst: React.FC<{at: number; x: number; y: number; dur?: number}> = ({at, x, y, dur = 34}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > dur) return null;
  const colors = [P.butter, P.pink, P.lilac, P.mint, P.sky, '#fff'];
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      {Array.from({length: 18}).map((_, k) => {
        const ang = (k / 18) * Math.PI * 2 + 0.3;
        const p = Easing.out(Easing.cubic)(Math.min(1, t / (dur * 0.7)));
        const dist = 150 + (k % 3) * 70;
        const o = interpolate(t, [0, 3, dur * 0.6, dur], [0, 1, 1, 0], clamp);
        const s = k % 3 === 0 ? 22 : 14;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: Math.cos(ang) * dist * p - s / 2,
              top: Math.sin(ang) * dist * p - s / 2 + t * t * 0.08,
              width: s,
              height: k % 2 ? s : s * 0.55,
              borderRadius: k % 2 ? '50%' : 4,
              background: colors[k % colors.length],
              opacity: o,
              transform: `rotate(${t * 12 + k * 40}deg)`,
              boxShadow: '0 2px 5px rgba(60,25,40,0.25)',
            }}
          />
        );
      })}
    </div>
  );
};

/** bouncing hand-drawn arrow pointing down (to the description) */
export const ArrowDown: React.FC<Base> = (p) => (
  <Wrap {...p}>
    {(l) => {
      const d = interpolate(l.local, [0, 14], [1, 0], {...clamp, easing: ease});
      return (
        <svg viewBox="0 0 80 120" width="100%" height="100%" style={{transform: `translateY(${Math.abs(Math.sin(l.frame / 6)) * 14}px)`}}>
          <path d="M40 8 C 30 40, 52 62, 40 104 M18 82 L40 108 L62 82" stroke={p.color ?? P.butter} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={d} />
        </svg>
      );
    }}
  </Wrap>
);

/** "+" and "=" tokens for the little product formula */
export const Plus: React.FC<Base & {seed?: number}> = (p) => (
  <Wrap {...p}>
    {() => (
      <svg viewBox="-50 -50 100 100" width="100%" height="100%">
        <circle r="44" fill={P.pink} stroke="#fff" strokeWidth="5" />
        <path d="M0 -22 V22 M-22 0 H22" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      </svg>
    )}
  </Wrap>
);

/** product name tag that pops in and points at a product */
export const Tag: React.FC<Base & {label: string; seed?: number; bg?: string}> = ({label, bg, ...p}) => {
  const l = useLife(p.at, p.until, p.seed ?? 0);
  if (!l.visible) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x,
        top: p.y,
        transform: `translate(-50%, -50%) translateY(${l.float * 0.6}px) rotate(${p.rot ?? 0}deg) scale(${l.pop})`,
        opacity: Math.min(1, l.pop * 1.4) * l.out,
        padding: '10px 26px 12px',
        borderRadius: 40,
        background: bg ?? 'rgba(255,251,239,0.92)',
        border: '3px solid #fff',
        boxShadow: '0 8px 20px rgba(60,25,40,0.25)',
        fontFamily: 'PScript',
        fontSize: 52,
        lineHeight: 1,
        color: P.berry,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
};
