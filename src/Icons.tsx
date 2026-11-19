import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from './theme';

type P = {size?: number; color?: string; style?: React.CSSProperties};

// 4-point twinkle star
export const Sparkle: React.FC<P & {delay?: number; speed?: number}> = ({
  size = 40,
  color = C.cream,
  style,
  delay = 0,
  speed = 1,
}) => {
  const f = useCurrentFrame();
  const tw = 0.65 + 0.35 * Math.sin(((f + delay) / 9) * speed);
  const rot = Math.sin((f + delay) / 30) * 12;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `scale(${tw}) rotate(${rot}deg)`,
        filter: `drop-shadow(0 0 ${size / 6}px rgba(255,248,210,0.9))`,
        ...style,
      }}
    >
      <path
        d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z"
        fill={color}
      />
    </svg>
  );
};

export const Heart: React.FC<P> = ({size = 40, color = C.rose, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 92" style={style}>
    <path
      d="M50 88 C20 66 2 50 2 28 C2 12 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 12 98 28 C98 50 80 66 50 88 Z"
      fill={color}
      stroke="#fff"
      strokeWidth={6}
    />
    <ellipse cx="28" cy="24" rx="9" ry="6" fill="#fff" opacity={0.6} transform="rotate(-30 28 24)" />
  </svg>
);

export const Droplet: React.FC<P> = ({size = 50, color = C.sky, style}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 80 100" style={style}>
    <path d="M40 4 C56 30 74 48 74 66 C74 86 58 96 40 96 C22 96 6 86 6 66 C6 48 24 30 40 4 Z" fill={color} stroke="#fff" strokeWidth={5} />
    <ellipse cx="27" cy="62" rx="7" ry="12" fill="#fff" opacity={0.7} />
  </svg>
);

export const Sun: React.FC<P> = ({size = 56, color = C.butterDeep, style}) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{...style, transform: `rotate(${f * 0.8}deg)`}}>
      {Array.from({length: 8}).map((_, i) => (
        <rect key={i} x="46" y="2" width="8" height="18" rx="4" fill={color} transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="24" fill={color} stroke="#fff" strokeWidth={4} />
    </svg>
  );
};

export const Moon: React.FC<P> = ({size = 56, color = C.lavender, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path d="M64 8 C40 14 26 34 26 54 C26 76 44 94 68 94 C78 94 86 90 92 86 C60 88 42 66 46 42 C48 28 54 16 64 8 Z" fill={color} stroke="#fff" strokeWidth={5} />
  </svg>
);

export const Check: React.FC<P> = ({size = 60, color = C.okGreen, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="44" fill={color} stroke="#fff" strokeWidth={6} />
    <path d="M30 52 L45 66 L71 36" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Cross: React.FC<P> = ({size = 60, color = C.softRed, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="44" fill={color} stroke="#fff" strokeWidth={6} />
    <path d="M35 35 L65 65 M65 35 L35 65" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
  </svg>
);

export const Plus: React.FC<P> = ({size = 60, color = C.okGreen, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="44" fill={color} stroke="#fff" strokeWidth={6} />
    <path d="M50 30 L50 70 M30 50 L70 50" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
  </svg>
);

export const Shield: React.FC<P> = ({size = 50, color = C.mint, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 110" style={style}>
    <path d="M50 4 L92 18 C92 60 76 90 50 106 C24 90 8 60 8 18 Z" fill={color} stroke="#fff" strokeWidth={6} />
    <path d="M32 56 L46 70 L70 42" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Warn: React.FC<P> = ({size = 36, color = C.butterDeep, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 92" style={style}>
    <path d="M50 6 L94 84 L6 84 Z" fill={color} stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
    <rect x="45" y="32" width="10" height="28" rx="5" fill={C.ink} />
    <circle cx="50" cy="71" r="6" fill={C.ink} />
  </svg>
);
