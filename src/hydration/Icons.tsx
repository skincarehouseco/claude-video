import React from 'react';
import {C} from './theme';

/* Hand-drawn style line-art icons (like the reference's "Cleanse / Moisturize" cards).
   Every stroke uses pathLength=1 so `draw` (0..1) animates the line being sketched on. */

type P = {draw: number; size?: number; color?: string};
const stroke = (draw: number, delay = 0, color = C.ink, w = 3.2): React.SVGProps<SVGPathElement> => {
  const d = Math.max(0, Math.min(1, (draw - delay) / (1 - delay || 1)));
  return {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - d,
    fill: 'none',
    stroke: color,
    strokeWidth: w,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
};

const Svg: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    {children}
  </svg>
);

// 1. face being washed: face outline, foam bubbles, "tight" squeeze marks
export const IconWash: React.FC<P & {squeeze?: number}> = ({draw, size = 150, squeeze = 0}) => (
  <Svg size={size}>
    <path d="M50 18 C30 18 24 34 25 50 C26 68 36 82 50 82 C64 82 74 68 75 50 C76 34 70 18 50 18 Z" {...stroke(draw)} />
    <path d="M38 48 q4 -3 8 0 M54 48 q4 -3 8 0" {...stroke(draw, 0.25)} />
    <path d="M44 66 q6 3 12 0" {...stroke(draw, 0.35)} />
    {[[30, 24, 7], [44, 15, 6], [60, 17, 8], [72, 27, 6], [22, 36, 5]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} {...(stroke(draw, 0.4 + i * 0.08, C.waterDeep, 2.6) as object)} />
    ))}
    <g transform={`translate(${-squeeze * 3} 0)`}>
      <path d="M12 50 l-6 -4 M12 56 l-7 0 M12 62 l-6 4" {...stroke(draw, 0.7)} />
    </g>
    <g transform={`translate(${squeeze * 3} 0)`}>
      <path d="M88 50 l6 -4 M88 56 l7 0 M88 62 l6 4" {...stroke(draw, 0.7)} />
    </g>
  </Svg>
);

// 2. magnifying glass over fine lines
export const IconLines: React.FC<P> = ({draw, size = 150}) => (
  <Svg size={size}>
    <path d="M14 34 q8 -5 16 0 t16 0 t16 0 M18 48 q8 -5 16 0 t16 0 M14 62 q8 -5 16 0 t16 0 t16 0" {...stroke(draw, 0, '#8C7F8E', 2.6)} />
    <circle cx="58" cy="48" r="22" {...(stroke(draw, 0.3) as object)} />
    <path d="M74 64 L90 82" {...stroke(draw, 0.6, C.ink, 5)} />
    <path d="M46 38 q5 -6 12 -6" {...stroke(draw, 0.75, C.waterDeep, 2.4)} />
  </Svg>
);

// 3. dull, tired face with sleepy eyes + zzz
export const IconTired: React.FC<P> = ({draw, size = 150}) => (
  <Svg size={size}>
    <path d="M48 22 C30 22 22 36 23 52 C24 70 34 82 48 82 C62 82 72 70 73 52 C74 36 66 22 48 22 Z" {...stroke(draw)} />
    <path d="M34 50 q5 4 10 0 M52 50 q5 4 10 0" {...stroke(draw, 0.25)} />
    <path d="M35 57 q4 2 8 0 M53 57 q4 2 8 0" {...stroke(draw, 0.35, '#9A8C9C', 2.2)} />
    <path d="M42 70 q6 -2 12 0" {...stroke(draw, 0.4)} />
    <path d="M74 20 h9 l-9 10 h9 M84 6 h7 l-7 8 h7" {...stroke(draw, 0.6, '#8C7F8E', 2.6)} />
  </Svg>
);

// 4. cracked powder compact
export const IconCrack: React.FC<P & {crack?: number}> = ({draw, size = 150, crack = 1}) => (
  <Svg size={size}>
    <ellipse cx="50" cy="60" rx="36" ry="22" {...(stroke(draw) as object)} />
    <ellipse cx="50" cy="57" rx="27" ry="15" {...(stroke(draw, 0.2, C.ink, 2.6) as object)} />
    <path d="M18 54 C18 28 82 28 82 54" {...stroke(draw, 0.35)} />
    <path d="M50 44 l-5 7 l6 4 l-4 8 M51 55 l9 2 l4 -5" {...stroke(Math.min(draw, crack), 0, '#C26A6A', 2.4)} />
    <path d="M30 22 l-4 -6 M36 18 l0 -7 M42 20 l4 -6" {...stroke(draw, 0.7, C.butterDeep, 2.4)} />
  </Svg>
);

// 5. oil drops + shine
export const IconOil: React.FC<P> = ({draw, size = 150}) => (
  <Svg size={size}>
    <path d="M42 18 C42 18 22 44 22 58 C22 70 31 80 42 80 C53 80 62 70 62 58 C62 44 42 18 42 18 Z" {...stroke(draw)} />
    <path d="M32 58 q0 10 9 13" {...stroke(draw, 0.35, '#C9A64A', 2.6)} />
    <path d="M72 46 C72 46 62 60 62 67 C62 73 66 77 72 77 C78 77 82 73 82 67 C82 60 72 46 72 46 Z" {...stroke(draw, 0.45)} />
    <path d="M76 18 v12 M70 24 h12 M86 34 v7 M82.5 37.5 h7" {...stroke(draw, 0.75, C.butterDeep, 2.6)} />
  </Svg>
);

/* ---------------- filled cartoon stickers (outro product pop, like the reference) ---------------- */
const Sticker: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(40,30,45,0.22))'}}>
    <g stroke="#fff" strokeWidth={9} strokeLinejoin="round">{children}</g>
    <g stroke={C.ink} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">{children}</g>
  </svg>
);

export const StickerGlass: React.FC<{size?: number}> = ({size = 120}) => (
  <Sticker size={size}>
    <path d="M28 20 L72 20 L66 86 L34 86 Z" fill="#EAF7FD" />
    <path d="M31 44 L69 44 L66 86 L34 86 Z" fill={C.water} />
    <path d="M40 54 q2 8 0 18" fill="none" />
  </Sticker>
);
export const StickerDropper: React.FC<{size?: number}> = ({size = 120}) => (
  <Sticker size={size}>
    <rect x="42" y="8" width="16" height="16" rx="6" fill={C.pink} />
    <rect x="45" y="24" width="10" height="10" fill="#fff" />
    <rect x="30" y="34" width="40" height="54" rx="12" fill={C.lilac} />
    <rect x="38" y="50" width="24" height="18" rx="4" fill="#fff" />
  </Sticker>
);
export const StickerJar: React.FC<{size?: number}> = ({size = 120}) => (
  <Sticker size={size}>
    <rect x="22" y="30" width="56" height="16" rx="6" fill={C.mint} />
    <rect x="26" y="46" width="48" height="36" rx="10" fill="#fff" />
    <path d="M38 62 q12 8 24 0" fill="none" />
  </Sticker>
);
export const StickerTube: React.FC<{size?: number}> = ({size = 120}) => (
  <Sticker size={size}>
    <path d="M34 14 L66 14 L60 74 L40 74 Z" fill={C.peach} />
    <rect x="40" y="74" width="20" height="14" rx="4" fill={C.butter} />
    <path d="M42 34 h16" fill="none" />
  </Sticker>
);

/* droplet mascot: mood -1 (thirsty/sad) .. 1 (happy) */
export const Droplet: React.FC<{size?: number; mood: number; blink?: boolean}> = ({size = 130, mood, blink}) => {
  const fill = mood < 0 ? '#BFD9E6' : C.water;
  const mouth = mood < 0 ? 'M42 70 q8 -6 16 0' : 'M40 66 q10 10 20 0';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(40,30,45,0.22))'}}>
      <path d="M50 6 C50 6 18 46 18 64 C18 82 32 94 50 94 C68 94 82 82 82 64 C82 46 50 6 50 6 Z" fill={fill} stroke="#fff" strokeWidth={7} />
      <path d="M50 6 C50 6 18 46 18 64 C18 82 32 94 50 94 C68 94 82 82 82 64 C82 46 50 6 50 6 Z" fill={fill} stroke={C.ink} strokeWidth={2.6} />
      <path d="M32 58 q-2 -10 6 -18" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
      {blink ? (
        <path d="M37 60 h8 M55 60 h8" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="41" cy="60" rx="3.6" ry="4.6" fill={C.ink} />
          <ellipse cx="59" cy="60" rx="3.6" ry="4.6" fill={C.ink} />
        </>
      )}
      <circle cx="34" cy="70" r="4.5" fill={C.pink} opacity={0.8} />
      <circle cx="66" cy="70" r="4.5" fill={C.pink} opacity={0.8} />
      <path d={mouth} stroke={C.ink} strokeWidth={2.8} fill="none" strokeLinecap="round" />
      {mood < 0 && <path d="M76 40 q4 6 0 10 q-4 -4 0 -10" fill="#DDF2FB" stroke={C.ink} strokeWidth={1.6} />}
    </svg>
  );
};

/* chrome-ish 4-point star (like the silver stars in the font references) */
export const Star: React.FC<{size?: number; color?: string; chrome?: boolean}> = ({size = 40, color = '#fff', chrome}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    {chrome && (
      <defs>
        <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#c9c9d2" />
          <stop offset="0.55" stopColor="#8d8d99" />
          <stop offset="1" stopColor="#f1f1f6" />
        </linearGradient>
      </defs>
    )}
    <path
      d="M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2 Z"
      fill={chrome ? 'url(#chrome)' : color}
      stroke={chrome ? '#6f6f7b' : 'none'}
      strokeWidth={chrome ? 2 : 0}
      style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))'}}
    />
  </svg>
);
