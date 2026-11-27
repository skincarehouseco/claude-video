import React from 'react';

/* Hand-built glossy vector stickers (original artwork) + simple icons used across the edits. */

let uid = 0;
const useId = (p: string) => React.useMemo(() => `${p}${uid++}`, [p]);

export const Heart: React.FC<{size?: number; c1?: string; c2?: string}> = ({size = 90, c1 = '#FFD3E2', c2 = '#F28DB2'}) => {
  const id = useId('h');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.25" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </radialGradient>
      </defs>
      <path d="M50 88 C20 66 6 50 8 32 C10 16 26 8 38 12 C44 14 48 18 50 24 C52 18 56 14 62 12 C74 8 90 16 92 32 C94 50 80 66 50 88Z" fill={`url(#${id})`} stroke="#fff" strokeWidth="3" />
      <ellipse cx="30" cy="28" rx="9" ry="5" fill="#fff" opacity="0.85" transform="rotate(-30 30 28)" />
    </svg>
  );
};

export const Bow: React.FC<{size?: number; c1?: string; c2?: string}> = ({size = 120, c1 = '#FFE1EA', c2 = '#F3A2BE'}) => {
  const id = useId('b');
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 120 96" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.3" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <path d="M58 40 C40 14 10 8 6 26 C2 44 30 54 56 48Z" fill={`url(#${id})`} stroke="#E58AAB" strokeWidth="2" />
      <path d="M62 40 C80 14 110 8 114 26 C118 44 90 54 64 48Z" fill={`url(#${id})`} stroke="#E58AAB" strokeWidth="2" />
      <path d="M54 48 C46 62 36 78 30 92 L44 88 L50 96 C54 80 58 64 60 50Z" fill={`url(#${id})`} stroke="#E58AAB" strokeWidth="2" />
      <path d="M66 48 C74 62 84 78 90 92 L76 88 L70 96 C66 80 62 64 60 50Z" fill={`url(#${id})`} stroke="#E58AAB" strokeWidth="2" />
      <ellipse cx="60" cy="44" rx="11" ry="10" fill={`url(#${id})`} stroke="#E58AAB" strokeWidth="2" />
      <ellipse cx="24" cy="22" rx="8" ry="3" fill="#fff" opacity="0.9" transform="rotate(-20 24 22)" />
      <ellipse cx="96" cy="22" rx="8" ry="3" fill="#fff" opacity="0.9" transform="rotate(20 96 22)" />
    </svg>
  );
};

export const Flower: React.FC<{size?: number; petal?: string; center?: string}> = ({size = 90, petal = '#F7B6CB', center = '#FFE38A'}) => {
  const id = useId('f');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id={id} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.4" stopColor={petal} />
          <stop offset="1" stopColor="#E47FA3" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="50" cy="26" rx="17" ry="22" fill={`url(#${id})`} stroke="#fff" strokeWidth="2" transform={`rotate(${a} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="13" fill={center} stroke="#fff" strokeWidth="2" />
      <circle cx="46" cy="46" r="4" fill="#fff" opacity="0.8" />
    </svg>
  );
};

export const Sparkle: React.FC<{size?: number; color?: string; glow?: boolean}> = ({size = 40, color = '#fff', glow = true}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 6px ${color})` : undefined}}>
    <path d="M20 0 C21 13 27 19 40 20 C27 21 21 27 20 40 C19 27 13 21 0 20 C13 19 19 13 20 0Z" fill={color} />
  </svg>
);

export const Sun: React.FC<{size?: number; color?: string; face?: boolean}> = ({size = 120, color = '#FFC83D'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    {Array.from({length: 12}).map((_, i) => (
      <rect key={i} x="47" y="2" width="6" height="16" rx="3" fill={color} transform={`rotate(${i * 30} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="26" fill={color} />
    <circle cx="42" cy="42" r="8" fill="#fff" opacity="0.45" />
  </svg>
);

export const Moon: React.FC<{size?: number; color?: string}> = ({size = 110, color = '#F6E7A8'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <path d="M62 8 C38 12 22 32 22 54 C22 78 42 94 64 94 C76 94 86 88 92 80 C70 84 46 70 46 44 C46 28 52 16 62 8Z" fill={color} />
    <circle cx="44" cy="64" r="4" fill="#fff" opacity="0.4" />
  </svg>
);

export const SunsetIcon: React.FC<{size?: number}> = ({size = 110}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <path d="M18 62 A32 32 0 0 1 82 62Z" fill="#FF9F43" />
    {[-60, -30, 0, 30, 60].map((a) => (
      <rect key={a} x="48" y="12" width="5" height="14" rx="2.5" fill="#FF9F43" transform={`rotate(${a} 50 62)`} />
    ))}
    <rect x="8" y="64" width="84" height="6" rx="3" fill="#E0743A" />
    <rect x="22" y="76" width="56" height="5" rx="2.5" fill="#E0743A" opacity="0.6" />
  </svg>
);

export const Check: React.FC<{size?: number; color?: string; stroke?: number; progress?: number}> = ({size = 80, color = '#2FB36D', stroke = 12, progress = 1}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <path d="M14 54 L40 78 L88 22" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
  </svg>
);

export const Cross: React.FC<{size?: number; color?: string; stroke?: number; progress?: number}> = ({size = 80, color = '#E5484D', stroke = 12, progress = 1}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <path d="M18 18 L82 82" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, progress * 2)} />
    <path d="M82 18 L18 82" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, progress * 2 - 1)} />
  </svg>
);

/** Hand-drawn marker circle (draws on with progress 0..1). */
export const MarkerCircle: React.FC<{w: number; h: number; color?: string; progress: number; stroke?: number}> = ({w, h, color = '#E8322B', progress, stroke = 6}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
    <path
      d={`M${w * 0.62} ${h * 0.04} C${w * 0.95} ${h * 0.02} ${w * 1.02} ${h * 0.6} ${w * 0.78} ${h * 0.9} C${w * 0.55} ${h * 1.08} ${w * 0.1} ${h * 0.98} ${w * 0.02} ${h * 0.6} C${-w * 0.04} ${h * 0.25} ${w * 0.25} ${h * 0.02} ${w * 0.7} ${h * 0.1}`}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </svg>
);

/** Hand-drawn curved arrow pointing to bottom-left. */
export const MarkerArrow: React.FC<{size?: number; color?: string; progress: number; flip?: boolean}> = ({size = 120, color = '#E8322B', progress, flip}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}>
    <path d="M90 10 C70 14 40 30 22 76" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, progress * 1.4)} />
    <path d="M10 60 L22 80 L40 66" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity={progress > 0.7 ? 1 : 0} />
  </svg>
);

export const Clock: React.FC<{size?: number; hour: number; face?: string; hand?: string}> = ({size = 120, hour, face = '#fff', hand = '#1B2A4A'}) => {
  const ha = (hour % 12) * 30;
  const ma = (hour % 1) * 360;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill={face} stroke={hand} strokeWidth="6" />
      {Array.from({length: 12}).map((_, i) => (
        <rect key={i} x="49" y="8" width="2" height="7" fill={hand} transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <line x1="50" y1="50" x2="50" y2="26" stroke={hand} strokeWidth="6" strokeLinecap="round" transform={`rotate(${ha} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="16" stroke={hand} strokeWidth="4" strokeLinecap="round" transform={`rotate(${ma} 50 50)`} />
      <circle cx="50" cy="50" r="4" fill={hand} />
    </svg>
  );
};
