import React from 'react';
import {C} from './theme';

type P = {size?: number; style?: React.CSSProperties};
const W = '#fff';

/* ---------- pastel product stickers (white sticker border) ---------- */
export const Bottle: React.FC<P & {color?: string}> = ({size = 90, color = C.pink, style}) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 60 100" style={style}>
    <rect x="22" y="4" width="16" height="16" rx="3" fill={C.lavender} stroke={W} strokeWidth="4" />
    <rect x="8" y="20" width="44" height="76" rx="12" fill={color} stroke={W} strokeWidth="5" />
    <rect x="16" y="44" width="28" height="22" rx="5" fill={W} opacity="0.85" />
    <rect x="13" y="28" width="6" height="56" rx="3" fill={W} opacity="0.45" />
  </svg>
);
export const Tube: React.FC<P & {color?: string}> = ({size = 90, color = C.mint, style}) => (
  <svg width={size * 0.55} height={size} viewBox="0 0 55 100" style={style}>
    <path d="M6 6 H49 L42 80 H13 Z" fill={color} stroke={W} strokeWidth="5" strokeLinejoin="round" />
    <rect x="15" y="80" width="25" height="16" rx="4" fill={C.peach} stroke={W} strokeWidth="4" />
    <rect x="15" y="30" width="25" height="18" rx="4" fill={W} opacity="0.85" />
  </svg>
);
export const Dropper: React.FC<P & {color?: string}> = ({size = 90, color = C.peach, style}) => (
  <svg width={size * 0.5} height={size} viewBox="0 0 50 100" style={style}>
    <rect x="17" y="2" width="16" height="24" rx="8" fill={C.rose} stroke={W} strokeWidth="4" />
    <rect x="13" y="24" width="24" height="10" rx="3" fill={C.ink} opacity="0.8" />
    <rect x="5" y="34" width="40" height="62" rx="10" fill={color} stroke={W} strokeWidth="5" />
    <rect x="12" y="52" width="26" height="20" rx="4" fill={W} opacity="0.85" />
  </svg>
);
export const Jar: React.FC<P & {color?: string}> = ({size = 80, color = C.sky, style}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80" style={style}>
    <rect x="12" y="6" width="76" height="20" rx="6" fill={C.lavender} stroke={W} strokeWidth="5" />
    <rect x="6" y="24" width="88" height="52" rx="14" fill={color} stroke={W} strokeWidth="5" />
    <rect x="28" y="38" width="44" height="22" rx="5" fill={W} opacity="0.85" />
  </svg>
);
export const Pump: React.FC<P & {color?: string}> = ({size = 90, color = C.butterDeep, style}) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 60 100" style={style}>
    <path d="M30 4 H50 V12 H36 V24" fill="none" stroke={W} strokeWidth="9" strokeLinecap="round" />
    <path d="M30 4 H50 V12 H36 V24" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    <rect x="22" y="22" width="20" height="10" rx="3" fill={C.rose} stroke={W} strokeWidth="3" />
    <rect x="8" y="32" width="48" height="64" rx="12" fill={color} stroke={W} strokeWidth="5" />
    <rect x="16" y="50" width="32" height="22" rx="5" fill={W} opacity="0.85" />
  </svg>
);
export const PRODUCTS = [Bottle, Tube, Dropper, Jar, Pump];

/* ---------- line-art icons (like the reference's sketch icons) ---------- */
const line = {fill: 'none', stroke: C.ink, strokeWidth: 4.5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

/** cleanse: foamy face-wash tube with bubbles */
export const CleanseIcon: React.FC<P & {draw?: number}> = ({size = 120, draw = 1, style}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    <g {...line} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw}>
      <path pathLength={1} d="M38 100 L32 40 H72 L66 100 Z" />
      <path pathLength={1} d="M42 40 V28 H62 V40" />
      <path pathLength={1} d="M42 62 H62 M44 74 H60" />
    </g>
    <g {...line} strokeWidth={4} opacity={draw}>
      <circle cx="84" cy="34" r="10" />
      <circle cx="98" cy="54" r="7" />
      <circle cx="80" cy="60" r="5" />
      <circle cx="96" cy="20" r="4" />
    </g>
  </svg>
);
/** hydrate: water drop with ripple */
export const HydrateIcon: React.FC<P & {draw?: number}> = ({size = 120, draw = 1, style}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    <g {...line}>
      <path pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} d="M60 14 C74 36 90 52 90 72 C90 90 76 102 60 102 C44 102 30 90 30 72 C30 52 46 36 60 14 Z" />
      <path pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} d="M44 74 C44 84 50 90 58 92" />
      <path opacity={draw} d="M20 108 C30 102 40 102 50 108 M70 108 C80 102 90 102 100 108" strokeWidth={3.5} />
    </g>
  </svg>
);
/** moisturize: cream jar with a swirl */
export const MoisturizeIcon: React.FC<P & {draw?: number}> = ({size = 120, draw = 1, style}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    <g {...line}>
      <path pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} d="M22 58 H98 V92 C98 100 92 104 84 104 H36 C28 104 22 100 22 92 Z" />
      <path pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} d="M26 46 H94 V58 H26 Z" />
      <path pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} d="M44 36 C44 22 76 22 74 34 C72 44 52 40 56 30 C58 24 66 26 64 32" />
      <path opacity={draw} d="M40 76 H80" strokeWidth={3.5} />
    </g>
  </svg>
);

/* ---------- small doodles ---------- */
export const Sparkle: React.FC<P & {color?: string; glow?: boolean}> = ({size = 40, color = C.cream, style, glow = true}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: glow ? `drop-shadow(0 0 ${size / 6}px rgba(255,248,210,0.9))` : undefined, ...style}}>
    <path d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z" fill={color} />
  </svg>
);
export const Heart: React.FC<P & {color?: string}> = ({size = 40, color = C.rose, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 92" style={style}>
    <path d="M50 88 C20 66 2 50 2 28 C2 12 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 12 98 28 C98 50 80 66 50 88 Z" fill={color} stroke={W} strokeWidth={6} />
    <ellipse cx="28" cy="24" rx="9" ry="6" fill={W} opacity={0.6} transform="rotate(-30 28 24)" />
  </svg>
);
export const Check: React.FC<P> = ({size = 44, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="44" fill={C.okGreen} stroke={W} strokeWidth={7} />
    <path d="M30 52 L45 66 L71 36" fill="none" stroke={W} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Cross: React.FC<P> = ({size = 44, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="44" fill={C.softRed} stroke={W} strokeWidth={7} />
    <path d="M35 35 L65 65 M65 35 L35 65" stroke={W} strokeWidth={10} strokeLinecap="round" />
  </svg>
);
/** anime-style "!" stress marks */
export const Marks: React.FC<P & {color?: string}> = ({size = 70, color = C.softRed, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <g stroke={color} strokeWidth={9} strokeLinecap="round">
      <path d="M20 70 L8 40" />
      <path d="M45 60 L42 18" />
      <path d="M70 66 L86 34" />
    </g>
  </svg>
);
/** grumpy little storm cloud */
export const StormCloud: React.FC<P & {flash?: number}> = ({size = 150, flash = 1, style}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 150 120" style={style}>
    <path d="M78 92 L66 112 L80 110 L70 128" fill="none" stroke={C.butterDeep} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={flash} />
    <path d="M30 84 C12 84 6 66 18 56 C14 36 38 28 50 38 C56 16 92 14 100 36 C120 30 140 44 132 64 C144 72 136 90 120 88 Z" fill="#C9C3D9" stroke={W} strokeWidth={6} />
    <path d="M52 58 L64 62 M98 58 L86 62" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <path d="M64 76 C70 70 80 70 86 76" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
  </svg>
);
/** sleepy cloud for "give your skin a break" */
export const SleepyCloud: React.FC<P> = ({size = 150, style}) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 150 98" style={style}>
    <path d="M30 88 C12 88 6 70 18 60 C14 40 38 32 50 42 C56 20 92 18 100 40 C120 34 140 48 132 68 C144 76 136 94 120 92 Z" fill={C.cream} stroke={W} strokeWidth={6} />
    <path d="M50 64 C54 70 62 70 66 64 M86 64 C90 70 98 70 102 64" fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
    <ellipse cx="46" cy="76" rx="7" ry="4" fill={C.blush} opacity={0.8} />
    <ellipse cx="106" cy="76" rx="7" ry="4" fill={C.blush} opacity={0.8} />
  </svg>
);
/** bubbling test flask */
export const Flask: React.FC<P & {bubble?: number}> = ({size = 120, bubble = 0, style}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    {[0, 1, 2].map((i) => {
      const ph = (bubble * 0.9 + i / 3) % 1;
      return <circle key={i} cx={52 + i * 9} cy={34 - ph * 30} r={4 + i * 1.5} fill={C.mint} stroke={W} strokeWidth={3} opacity={1 - ph} />;
    })}
    <path d="M46 34 V58 L22 100 C18 108 24 114 32 114 H88 C96 114 102 108 98 100 L74 58 V34" fill="#E9F7EE" stroke={W} strokeWidth={6} strokeLinejoin="round" />
    <path d="M30 96 C46 88 72 104 92 94 L98 104 C100 110 96 112 88 112 H32 C24 112 22 108 24 102 Z" fill={C.mint} />
    <rect x="40" y="26" width="40" height="10" rx="5" fill={C.lavender} stroke={W} strokeWidth={4} />
  </svg>
);
