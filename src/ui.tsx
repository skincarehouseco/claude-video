import React from 'react';
import {Img, staticFile} from 'remotion';
import {pop, ramp} from './anim';
import {C, DISPLAY, SANS} from './theme';

/* ---------------------------------------------------------------- icons (flat, drawn in SVG) */
type IconProps = {size?: number; color?: string};

export const Bottle: React.FC<IconProps> = ({size = 120, color = '#7CC6F2'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="38" y="6" width="24" height="14" rx="3" fill="#2C3E50" />
    <path d="M30 24 h40 a6 6 0 0 1 6 6 v58 a6 6 0 0 1 -6 6 h-40 a6 6 0 0 1 -6 -6 v-58 a6 6 0 0 1 6 -6z" fill={color} />
    <rect x="32" y="44" width="36" height="26" rx="3" fill="#fff" opacity="0.9" />
    <rect x="30" y="28" width="6" height="56" rx="3" fill="#fff" opacity="0.35" />
  </svg>
);

export const Jar: React.FC<IconProps> = ({size = 120, color = '#F7B7C8'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="18" y="26" width="64" height="16" rx="4" fill="#2C3E50" />
    <path d="M20 42 h60 v36 a10 10 0 0 1 -10 10 h-40 a10 10 0 0 1 -10 -10z" fill={color} />
    <rect x="30" y="54" width="40" height="18" rx="3" fill="#fff" opacity="0.9" />
  </svg>
);

export const Dropper: React.FC<IconProps> = ({size = 120, color = '#F2C14E'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <ellipse cx="50" cy="12" rx="9" ry="9" fill="#2C3E50" />
    <rect x="44" y="16" width="12" height="16" fill="#2C3E50" />
    <path d="M32 34 h36 a6 6 0 0 1 6 6 v48 a6 6 0 0 1 -6 6 h-36 a6 6 0 0 1 -6 -6 v-48 a6 6 0 0 1 6 -6z" fill={color} opacity="0.95" />
    <rect x="36" y="52" width="28" height="22" rx="3" fill="#fff" opacity="0.9" />
  </svg>
);

export const Products: React.FC<IconProps> = ({size = 120}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="10" y="30" width="24" height="62" rx="5" fill="#9AD9C4" />
    <rect x="15" y="20" width="14" height="12" rx="2" fill="#2C3E50" />
    <rect x="38" y="44" width="26" height="48" rx="5" fill="#F7B7C8" />
    <rect x="40" y="36" width="22" height="9" rx="2" fill="#2C3E50" />
    <rect x="68" y="18" width="22" height="74" rx="8" fill="#F2C14E" />
    <rect x="73" y="8" width="12" height="12" rx="2" fill="#2C3E50" />
  </svg>
);

export const Pump: React.FC<IconProps> = ({size = 150, color = '#8ED1C6'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M44 4 h22 v6 h-14 v8 h-8z" fill="#2C3E50" />
    <rect x="42" y="16" width="14" height="10" fill="#2C3E50" />
    <path d="M30 28 h38 a8 8 0 0 1 8 8 v52 a8 8 0 0 1 -8 8 h-38 a8 8 0 0 1 -8 -8 v-52 a8 8 0 0 1 8 -8z" fill={color} />
    <rect x="30" y="46" width="38" height="28" rx="4" fill="#fff" opacity="0.92" />
    <text x="49" y="64" fontFamily={SANS} fontWeight={800} fontSize="9" textAnchor="middle" fill="#2C3E50">
      GENTLE
    </text>
  </svg>
);

export const Drop: React.FC<IconProps> = ({size = 90, color = '#3BA7F5'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 6 C50 6 18 46 18 64 a32 32 0 0 0 64 0 C82 46 50 6 50 6z" fill={color} />
    <ellipse cx="38" cy="62" rx="7" ry="12" fill="#fff" opacity="0.55" />
  </svg>
);

export const Tissue: React.FC<IconProps & {oil?: number}> = ({size = 200, oil = 0}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M12 18 L84 10 L90 82 L18 90z" fill="#fff" stroke="#D9DEE2" strokeWidth="1.5" />
    <path d="M12 18 L84 10 L80 24 L16 30z" fill="#EEF1F3" />
    {oil > 0 && (
      <g opacity={oil}>
        <ellipse cx="50" cy="40" rx="16" ry="9" fill="#F2C14E" opacity="0.55" />
        <ellipse cx="52" cy="58" rx="6" ry="9" fill="#F2C14E" opacity="0.5" />
        <ellipse cx="48" cy="40" rx="7" ry="4" fill="#F7DC8A" opacity="0.8" />
      </g>
    )}
  </svg>
);

export const XMark: React.FC<{size?: number; progress?: number; color?: string; stroke?: number}> = ({
  size = 140,
  progress = 1,
  color = C.red,
  stroke = 14,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    {[
      ['M12 12 L88 88', Math.min(1, progress * 2)],
      ['M88 12 L12 88', Math.max(0, progress * 2 - 1)],
    ].map(([d, p], i) => (
      <path
        key={i}
        d={d as string}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray="110"
        strokeDashoffset={110 * (1 - (p as number))}
        style={{filter: 'drop-shadow(0 3px 0 rgba(0,0,0,0.35))'}}
      />
    ))}
  </svg>
);

export const Check: React.FC<{size?: number; progress?: number; color?: string}> = ({size = 80, progress = 1, color = C.green}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill={color} />
    <path d="M28 52 L44 68 L74 36" stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - progress)} />
  </svg>
);

export const Emoji: React.FC<{code: string; size?: number; style?: React.CSSProperties}> = ({code, size = 120, style}) => (
  <Img src={staticFile(`emoji/${code}.svg`)} style={{width: size, height: size, ...style}} />
);

/* ---------------------------------------------------------------- typography pieces */

/** pill label that pops in (reference: highlighted keyword boxes) */
export const Chip: React.FC<{
  t: number;
  at: number;
  until?: number;
  x: number;
  y: number;
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  rotate?: number;
  anchor?: 'left' | 'center' | 'right';
  font?: string;
}> = ({t, at, until = 999, x, y, children, bg = C.yellow, color = C.ink, size = 46, rotate = -3, anchor = 'center', font = SANS}) => {
  const p = pop(t, at, 300, 12);
  const out = ramp(t, until - 0.18, 0.18);
  if (p <= 0.001 || out >= 1) return null;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) rotate(${rotate}deg) scale(${p * (1 - out)})`,
        transformOrigin: 'center',
        background: bg,
        color,
        fontFamily: font,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.1,
        padding: `${size * 0.2}px ${size * 0.45}px`,
        borderRadius: size * 0.32,
        boxShadow: '0 8px 0 rgba(0,0,0,0.25), 0 14px 30px rgba(0,0,0,0.2)',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.25,
      }}
    >
      {children}
    </div>
  );
};

/** big chunky outlined statement text (reference: "jangan", "gemes") */
export const Statement: React.FC<{
  t: number;
  at: number;
  until?: number;
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  stroke?: string;
  rotate?: number;
  shake?: boolean;
}> = ({t, at, until = 999, x, y, text, size = 140, color = C.yellow, stroke = C.ink, rotate = -4, shake = false}) => {
  const p = pop(t, at, 380, 11);
  const out = ramp(t, until - 0.15, 0.15);
  if (p <= 0.001 || out >= 1) return null;
  const k = shake ? Math.max(0, 1 - (t - at) / 0.35) : 0;
  const sx = k * 10 * Math.sin((t - at) * 90);
  return (
    <div
      style={{
        position: 'absolute',
        left: x + sx,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${(0.4 + 0.6 * p) * (1 - out)})`,
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 0.95,
        color,
        whiteSpace: 'pre',
        textAlign: 'center',
        WebkitTextStroke: `${Math.round(size / 9)}px ${stroke}`,
        paintOrder: 'stroke fill',
        textShadow: `0 ${size / 14}px 0 ${stroke}, 0 ${size / 8}px 30px rgba(0,0,0,0.3)`,
        opacity: Math.min(1, p * 2),
      }}
    >
      {text}
    </div>
  );
};

/** small "STEP n" tag + title, top-left */
export const StepTag: React.FC<{t: number; at: number; until: number; n: number; title: string; y?: number}> = ({t, at, until, n, title, y = 200}) => {
  const p = pop(t, at, 260, 14);
  const out = ramp(t, until - 0.2, 0.2);
  if (p <= 0.001 || out >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        top: y,
        display: 'flex',
        alignItems: 'stretch',
        transform: `translateX(${(1 - p) * -380 - out * 380}px)`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        borderRadius: 22,
        overflow: 'hidden',
      }}
    >
      <div style={{background: C.ink, color: C.yellow, fontFamily: DISPLAY, fontSize: 44, padding: '10px 20px'}}>STEP {n}</div>
      <div style={{background: C.white, color: C.ink, fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: '12px 24px'}}>{title}</div>
    </div>
  );
};

/** result stamp e.g. "COMBINATION SKIN" */
export const Stamp: React.FC<{t: number; at: number; until?: number; x: number; y: number; title: string; sub?: string; color?: string}> = ({
  t,
  at,
  until = 999,
  x,
  y,
  title,
  sub = 'SKIN TYPE',
  color = C.yellow,
}) => {
  const p = pop(t, at, 420, 10);
  const out = ramp(t, until - 0.2, 0.2);
  if (p <= 0.001 || out >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(-5deg) scale(${(2.2 - 1.2 * p) * (1 - out)})`,
        opacity: Math.min(1, p * 1.6),
        border: `8px solid ${color}`,
        borderRadius: 26,
        padding: '10px 30px 14px',
        background: 'rgba(14,27,36,0.92)',
        textAlign: 'center',
        boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: '#fff', opacity: 0.85}}>{sub}</div>
      <div style={{fontFamily: DISPLAY, fontSize: 84, color, lineHeight: 1, whiteSpace: 'nowrap'}}>{title}</div>
    </div>
  );
};

/** small honest label for illustrative textures */
export const IllustrationTag: React.FC<{x?: number; y?: number}> = ({x = 700, y = 176}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: 22,
      color: '#fff',
      background: 'rgba(0,0,0,0.38)',
      padding: '4px 12px',
      borderRadius: 10,
      letterSpacing: 1,
    }}
  >
    ilustrasi
  </div>
);
