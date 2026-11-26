import React from 'react';
import {C, HAND, pop, prog, SANS, SERIF, SERIF_I} from './theme';

/* ============================== icons (clean beauty line-art) ============================== */
type IP = {size?: number; color?: string; style?: React.CSSProperties};

export const Sparkle: React.FC<IP & {t: number; phase?: number}> = ({size = 40, color = '#fff', t, phase = 0, style}) => {
  const tw = 0.7 + 0.3 * Math.sin(t * 5 + phase);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `scale(${tw}) rotate(${Math.sin(t + phase) * 15}deg)`, ...style}}>
      <path d="M50 4 C53 36 64 47 96 50 C64 53 53 64 50 96 C47 64 36 53 4 50 C36 47 47 36 50 4 Z" fill={color} />
    </svg>
  );
};

export const Check: React.FC<IP> = ({size = 44, color = C.cherry, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="46" fill={color} />
    <path d="M28 52 L44 67 L73 35" stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** generic cleanser pump bottle (unbranded illustration) */
export const PumpBottle: React.FC<IP> = ({size = 200, color = C.lilacMid, style}) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 100 160" style={style}>
    <rect x="44" y="6" width="26" height="8" rx="4" fill="#fff" stroke={C.ink} strokeWidth="2.5" />
    <rect x="44" y="12" width="8" height="18" rx="3" fill="#fff" stroke={C.ink} strokeWidth="2.5" />
    <rect x="36" y="28" width="28" height="14" rx="5" fill="#fff" stroke={C.ink} strokeWidth="2.5" />
    <rect x="18" y="40" width="64" height="114" rx="22" fill={color} stroke={C.ink} strokeWidth="2.5" />
    <rect x="28" y="70" width="44" height="46" rx="10" fill="#fff" opacity="0.85" />
    <path d="M36 84 H64 M36 94 H58 M36 104 H52" stroke={C.inkSoft} strokeWidth="3" strokeLinecap="round" />
    <path d="M26 54 C26 48 30 46 34 46" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
  </svg>
);

/** generic spray bottle (unbranded illustration) */
export const SprayIcon: React.FC<IP> = ({size = 120, color = C.coral, style}) => (
  <svg width={size} height={size * 1.5} viewBox="0 0 100 150" style={style}>
    <rect x="34" y="8" width="32" height="34" rx="8" fill="#fff" opacity="0.8" stroke={C.ink} strokeWidth="2.5" />
    <rect x="40" y="18" width="20" height="22" rx="5" fill={color} stroke={C.ink} strokeWidth="2.5" />
    <rect x="30" y="40" width="40" height="12" rx="4" fill={color} stroke={C.ink} strokeWidth="2.5" />
    <rect x="24" y="50" width="52" height="94" rx="14" fill={color} stroke={C.ink} strokeWidth="2.5" opacity="0.92" />
    <path d="M32 62 C32 57 35 55 39 55" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
  </svg>
);

/** line-art face (front) */
export const Face: React.FC<IP & {closed?: boolean; blush?: number}> = ({size = 160, color = C.ink, closed = true, blush = 1, style}) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115" style={style}>
    <path d="M50 6 C78 6 90 30 88 56 C86 86 68 108 50 108 C32 108 14 86 12 56 C10 30 22 6 50 6 Z" fill={C.peach} stroke={color} strokeWidth="2.6" />
    {closed ? (
      <>
        <path d="M28 56 C32 61 40 61 44 56" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M56 56 C60 61 68 61 72 56" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="36" cy="56" r="3.5" fill={color} />
        <circle cx="64" cy="56" r="3.5" fill={color} />
      </>
    )}
    <ellipse cx="28" cy="72" rx="8" ry="4.5" fill={C.rose} opacity={0.55 * blush} />
    <ellipse cx="72" cy="72" rx="8" ry="4.5" fill={C.rose} opacity={0.55 * blush} />
    <path d="M42 84 C46 88 54 88 58 84" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </svg>
);

/** open palm */
export const Palm: React.FC<IP> = ({size = 130, color = C.ink, style}) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115" style={style}>
    <g fill={C.peach} stroke={color} strokeWidth="2.6" strokeLinejoin="round">
      <rect x="26" y="10" width="12" height="52" rx="6" />
      <rect x="40" y="4" width="12" height="58" rx="6" />
      <rect x="54" y="8" width="12" height="54" rx="6" />
      <rect x="68" y="18" width="11" height="46" rx="5.5" />
      <path d="M24 52 C24 50 26 48 30 48 L78 48 C80 48 80 52 80 56 L80 80 C80 98 68 110 52 110 C36 110 24 98 24 82 Z" />
      <path d="M24 70 C16 62 8 56 6 50 C4 44 10 40 16 44 C22 48 26 56 30 60" />
    </g>
    <path d="M40 80 C46 84 56 84 62 80" stroke={color} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
  </svg>
);

export const Drop: React.FC<IP> = ({size = 60, color = C.skyDeep, style}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={style}>
    <path d="M50 6 C66 34 88 58 88 84 C88 106 70 124 50 124 C30 124 12 106 12 84 C12 58 34 34 50 6 Z" fill={color} />
    <path d="M30 86 C30 74 36 66 42 62" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8" />
  </svg>
);

export const Lock: React.FC<IP & {open: number}> = ({size = 120, color = C.cherry, open, style}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={style}>
    <g transform={`translate(${open * 18} ${-open * 14})`}>
      <path d="M28 56 V36 C28 20 38 10 50 10 C62 10 72 20 72 36 V56" stroke={C.ink} strokeWidth="9" fill="none" strokeLinecap="round" />
    </g>
    <rect x="14" y="52" width="72" height="60" rx="16" fill={color} stroke={C.ink} strokeWidth="3" />
    <circle cx="50" cy="78" r="8" fill="#fff" />
    <rect x="46" y="80" width="8" height="16" rx="4" fill="#fff" />
  </svg>
);

export const Bag: React.FC<IP> = ({size = 120, color = C.rose, style}) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 100 110" style={style}>
    <path d="M32 36 V28 C32 16 40 8 50 8 C60 8 68 16 68 28 V36" stroke={C.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M14 34 H86 L80 100 C80 104 76 106 72 106 H28 C24 106 20 104 20 100 Z" fill={color} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
    <path d="M38 58 C42 66 58 66 62 58" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

export const Gift: React.FC<IP & {lid: number}> = ({size = 150, color = C.cherry, lid, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', ...style}}>
    <rect x="16" y="44" width="68" height="50" rx="8" fill={color} stroke={C.ink} strokeWidth="3" />
    <rect x="45" y="44" width="10" height="50" fill={C.butter} />
    <g transform={`translate(${lid * 12} ${-lid * 30}) rotate(${lid * 16} 50 40)`}>
      <rect x="10" y="30" width="80" height="16" rx="6" fill={color} stroke={C.ink} strokeWidth="3" />
      <rect x="45" y="30" width="10" height="16" fill={C.butter} />
      <path d="M50 30 C40 14 26 18 32 28 C36 32 46 31 50 30 C54 31 64 32 68 28 C74 18 60 14 50 30 Z" fill={C.butter} stroke={C.ink} strokeWidth="2.5" />
    </g>
  </svg>
);

export const Person: React.FC<IP & {on: number}> = ({size = 46, on, style}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 50 60" style={style}>
    <circle cx="25" cy="16" r="11" fill={on > 0.5 ? C.cherry : 'rgba(255,255,255,0.55)'} />
    <path d="M6 58 C6 40 14 32 25 32 C36 32 44 40 44 58 Z" fill={on > 0.5 ? C.rose : 'rgba(255,255,255,0.45)'} />
  </svg>
);

/* ============================== typographic pieces ============================== */

/** big editorial numeral + label, used for STEP 01..04 */
export const StepTag: React.FC<{t: number; at: number; n: string; color: string; label: string; sub?: string}> = ({t, at, n, color, label, sub}) => {
  const p = pop(t, at);
  const p2 = pop(t, at + 0.12);
  const p3 = pop(t, at + 0.25);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
        <div style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 40, letterSpacing: 0.3, color: C.cherry}}>step</div>
        <div style={{width: 70 * p, height: 3, borderRadius: 2, background: C.cherry, opacity: 0.55}} />
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 176,
          lineHeight: 0.9,
          color,
          transform: `translateY(${(1 - p) * 40}px) scale(${0.8 + 0.2 * p})`,
          transformOrigin: 'left bottom',
          opacity: p,
          textShadow: '0 6px 24px rgba(255,255,255,0.6)',
        }}
      >
        {n}
      </div>
      <div style={{fontFamily: SERIF_I, fontStyle: 'italic', fontSize: 64, lineHeight: 1.05, color: C.ink, marginTop: 6, opacity: p2, transform: `translateX(${(1 - p2) * -30}px)`}}>
        {label}
      </div>
      {sub && (
        <div style={{fontFamily: HAND, fontStyle: 'italic', fontWeight: 600, fontSize: 29, color: C.dusty, marginTop: 2, opacity: p3, transform: `translateX(${(1 - p3) * -20}px) rotate(-2deg)`}}>
          {sub}
        </div>
      )}
    </div>
  );
};

/** rounded pill chip */
export const Chip: React.FC<{t: number; at: number; text: string; bg?: string; color?: string; size?: number; icon?: React.ReactNode; tilt?: number}> = ({
  t,
  at,
  text,
  bg = '#fff',
  color = C.ink,
  size = 38,
  icon,
  tilt = 0,
}) => {
  const p = pop(t, at, {damping: 13, stiffness: 170, mass: 0.6});
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: `${size * 0.32}px ${size * 0.7}px`,
        borderRadius: 999,
        background: bg,
        boxShadow: '0 10px 26px rgba(20,22,30,0.18), inset 0 0 0 1.5px rgba(255,255,255,0.8)',
        fontFamily: SANS,
        fontWeight: 650,
        fontSize: size,
        color,
        whiteSpace: 'nowrap',
        opacity: Math.min(1, p * 1.4),
        transform: `scale(${0.6 + 0.4 * p}) rotate(${tilt * p}deg)`,
      }}
    >
      {icon}
      {text}
    </div>
  );
};

/** hand-drawn underline that draws on */
export const Underline: React.FC<{t: number; at: number; width: number; color?: string; dur?: number}> = ({t, at, width, color = C.cherry, dur = 0.35}) => {
  const p = prog(t, at, at + dur);
  const len = width * 1.15;
  return (
    <svg width={width} height={30} viewBox={`0 0 ${width} 30`} style={{display: 'block', overflow: 'visible'}}>
      <path
        d={`M4 18 C ${width * 0.3} 8, ${width * 0.6} 26, ${width - 4} 12`}
        stroke={color}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
      />
    </svg>
  );
};

/** handwritten note that writes on letter by letter */
export const HandNote: React.FC<{t: number; at: number; text: string; size?: number; color?: string; rot?: number; cps?: number}> = ({
  t,
  at,
  text,
  size = 64,
  color = C.cherry,
  rot = -4,
  cps = 22,
}) => {
  const n = Math.floor(Math.max(0, t - at) * cps);
  return (
    <div style={{fontFamily: HAND, fontStyle: 'italic', fontWeight: 700, fontSize: size * 0.62, color, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap', textShadow: '0 3px 14px rgba(255,255,255,0.7)'}}>
      {text.split('').map((ch, i) => (
        <span key={i} style={{opacity: i < n ? 1 : 0}}>
          {ch}
        </span>
      ))}
    </div>
  );
};

/** curved arrow that draws on (absolute coords in an SVG overlay) */
export const CurvedArrow: React.FC<{t: number; at: number; d: string; len?: number; color?: string; width?: number; head: [number, number, number]}> = ({
  t,
  at,
  d,
  len = 600,
  color = C.ink,
  width = 5,
  head,
}) => {
  const p = prog(t, at, at + 0.45);
  const [hx, hy, ang] = head;
  return (
    <g>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={`${len}`} strokeDashoffset={len * (1 - p)} />
      <g transform={`translate(${hx} ${hy}) rotate(${ang})`} opacity={p > 0.95 ? 1 : 0}>
        <path d="M-16 -12 L0 0 L-16 12" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** frosted rounded information card */
export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties; t: number; at: number}> = ({children, style, t, at}) => {
  const p = pop(t, at, {damping: 16, stiffness: 140, mass: 0.75});
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.78)',
        borderRadius: 40,
        padding: '28px 34px',
        boxShadow: '0 18px 50px rgba(20,22,30,0.18), inset 0 0 0 2px rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        opacity: Math.min(1, p * 1.3),
        transform: `translateY(${(1 - p) * 50}px) scale(${0.85 + 0.15 * p})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
