import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from './theme';

type P = {size?: number; style?: React.CSSProperties};
const OUT = '#fff';

export const Watermelon: React.FC<P> = ({size = 90, style}) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 100 72" style={style}>
    <path d="M4 8 A46 46 0 0 0 96 8 Z" fill={C.rindDeep} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
    <path d="M12 10 A38 38 0 0 0 88 10 Z" fill={C.cream} />
    <path d="M16 10 A34 34 0 0 0 84 10 Z" fill={C.melon} />
    {[
      [32, 20],
      [50, 30],
      [68, 20],
      [42, 36],
      [58, 36],
    ].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={2.6} ry={4.2} fill={C.plum} transform={`rotate(${(x - 50) * 0.8} ${x} ${y})`} />
    ))}
    <path d="M24 14 Q34 16 40 14" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
  </svg>
);

export const Drop: React.FC<P & {color?: string; empty?: boolean}> = ({size = 60, color = C.aqua, style, empty}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 80 100" style={style}>
    <path
      d="M40 4 C56 30 74 48 74 66 C74 86 58 96 40 96 C22 96 6 86 6 66 C6 48 24 30 40 4 Z"
      fill={empty ? 'rgba(255,255,255,0.25)' : color}
      stroke="#fff"
      strokeWidth={5}
      strokeDasharray={empty ? '10 8' : undefined}
    />
    {!empty && <ellipse cx="27" cy="62" rx="7" ry="12" fill="#fff" opacity={0.7} />}
    {empty && <path d="M26 60 L36 70 L30 78 L42 88" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />}
  </svg>
);

export const Snowflake: React.FC<P> = ({size = 80, style}) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{...style, transform: `rotate(${f * 0.6}deg)`}}>
      <circle cx="50" cy="50" r="46" fill={C.sky} stroke="#fff" strokeWidth={5} />
      {[0, 60, 120].map((r) => (
        <g key={r} transform={`rotate(${r} 50 50)`} stroke="#5AA9D6" strokeWidth={6} strokeLinecap="round">
          <line x1="50" y1="18" x2="50" y2="82" />
          <line x1="50" y1="28" x2="42" y2="20" />
          <line x1="50" y1="28" x2="58" y2="20" />
          <line x1="50" y1="72" x2="42" y2="80" />
          <line x1="50" y1="72" x2="58" y2="80" />
        </g>
      ))}
    </svg>
  );
};

export const Sunny: React.FC<P> = ({size = 90, style}) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <g transform={`rotate(${f * 0.9} 50 50)`}>
        {Array.from({length: 10}).map((_, i) => (
          <rect key={i} x="46" y="1" width="8" height="18" rx="4" fill="#FFC56B" transform={`rotate(${i * 36} 50 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="27" fill={C.butterDeep} stroke="#fff" strokeWidth={5} />
      {/* little face */}
      <circle cx="41" cy="47" r="3.4" fill={C.plum} />
      <circle cx="59" cy="47" r="3.4" fill={C.plum} />
      <path d="M42 57 Q50 64 58 57" stroke={C.plum} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <ellipse cx="36" cy="55" rx="4" ry="2.4" fill={C.melon} opacity={0.7} />
      <ellipse cx="64" cy="55" rx="4" ry="2.4" fill={C.melon} opacity={0.7} />
    </svg>
  );
};

export const Lifebuoy: React.FC<P> = ({size = 110, style}) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{...style, transform: `rotate(${Math.sin(f / 10) * 12}deg)`}}>
      <circle cx="50" cy="50" r="44" fill="#fff" />
      <circle cx="50" cy="50" r="40" fill="none" stroke={C.melon} strokeWidth={20} strokeDasharray="31.4 31.4" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth={2} opacity={0.5} />
      <circle cx="50" cy="50" r="22" fill="rgba(255,255,255,0)" stroke="#fff" strokeWidth={4} />
    </svg>
  );
};

export const Battery: React.FC<P & {level: number}> = ({size = 150, style, level}) => {
  const col = level > 0.5 ? C.ok : level > 0.2 ? C.butterDeep : C.softRed;
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 120 60" style={style}>
      <rect x="3" y="3" width="104" height="54" rx="14" fill="rgba(255,255,255,0.35)" stroke="#fff" strokeWidth={5} />
      <rect x="108" y="20" width="9" height="20" rx="4" fill="#fff" />
      <rect x="11" y="11" width={Math.max(4, 88 * level)} height="38" rx="8" fill={col} />
    </svg>
  );
};

export const Leaf: React.FC<P> = ({size = 60, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path d="M14 86 C10 40 40 12 90 10 C88 60 60 90 14 86 Z" fill={C.rind} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
    <path d="M20 80 C40 60 56 44 76 24" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);

export const Feather: React.FC<P> = ({size = 70, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path d="M20 90 C24 50 50 16 88 8 C86 44 62 76 20 90 Z" fill={C.lavender} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
    <path d="M14 96 L70 26" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${40 + i * 10} ${62 - i * 12} l14 -2`} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    ))}
  </svg>
);

export const HeartIcon: React.FC<P & {color?: string}> = ({size = 50, color = C.melon, style}) => (
  <svg width={size} height={size * 0.92} viewBox="0 0 100 92" style={style}>
    <path
      d="M50 88 C20 66 2 50 2 28 C2 12 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 12 98 28 C98 50 80 66 50 88 Z"
      fill={color}
      stroke="#fff"
      strokeWidth={6}
    />
    <ellipse cx="28" cy="24" rx="9" ry="6" fill="#fff" opacity={0.6} transform="rotate(-30 28 24)" />
  </svg>
);

export const Tick: React.FC<P & {progress?: number}> = ({size = 52, style, progress = 1}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="44" fill={C.rind} stroke="#fff" strokeWidth={6} />
    <path
      d="M29 52 L44 67 L72 36"
      fill="none"
      stroke="#fff"
      strokeWidth={11}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={70}
      strokeDashoffset={70 * (1 - progress)}
    />
  </svg>
);

/** Hand-drawn curvy arrow that draws itself (progress 0..1). Points from top-right to bottom-left. */
export const Arrow: React.FC<P & {progress: number; color?: string}> = ({size = 200, style, progress, color = C.butter}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
    <path
      d="M170 20 C120 30 60 60 70 150"
      fill="none"
      stroke={color}
      strokeWidth={10}
      strokeLinecap="round"
      strokeDasharray={240}
      strokeDashoffset={240 * (1 - progress)}
      style={{filter: 'drop-shadow(0 3px 0 rgba(74,48,70,0.6))'}}
    />
    {progress > 0.85 && (
      <path d="M44 124 L70 158 L94 126" fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 3px 0 rgba(74,48,70,0.6))'}} />
    )}
  </svg>
);

export const Zzz: React.FC<P> = ({size = 90, style}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'relative', width: size, height: size, ...style}}>
      {[0, 1, 2].map((i) => {
        const ph = ((f + i * 14) % 42) / 42;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: i * size * 0.28,
              top: size * 0.6 - ph * size * 0.6,
              fontFamily: 'HmRound',
              fontWeight: 700,
              fontSize: size * (0.3 + i * 0.1),
              color: C.lavender,
              opacity: Math.sin(ph * Math.PI),
              textShadow: '0 3px 0 rgba(74,48,70,0.5)',
            }}
          >
            z
          </span>
        );
      })}
    </div>
  );
};
