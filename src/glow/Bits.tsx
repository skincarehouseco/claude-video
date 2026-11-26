import React from 'react';
import {FPS, SERIF, SANS, BODY, C, prog, pop, win, easeOut} from './theme';

/* ---------------- text animation ---------------- */
type RiseProps = {
  f: number;
  at: number;
  end?: number;
  y?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};
/** soft rise + de-blur entrance, optional fade-out at `end` */
export const Rise: React.FC<RiseProps> = ({f, at, end = 999, y = 36, blur = 10, style, children}) => {
  const p = prog(f, at, 16);
  const o = win(f, at, end, 10, 8);
  return (
    <div style={{opacity: o, transform: `translateY(${(1 - p) * y}px)`, filter: `blur(${(1 - p) * blur}px)`, ...style}}>
      {children}
    </div>
  );
};

/** word-by-word reveal, each word at its own time */
export const Words: React.FC<{f: number; words: [string, number][]; end?: number; style?: React.CSSProperties; gap?: number}> = ({
  f,
  words,
  end = 999,
  style,
  gap = 0.28,
}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', columnGap: `${gap}em`, ...style}}>
    {words.map(([w, at], i) => (
      <Rise key={i} f={f} at={at} end={end} y={28} blur={8}>
        {w}
      </Rise>
    ))}
  </div>
);

/** marker highlight that swipes in behind text */
export const Swipe: React.FC<{f: number; at: number; color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
  f,
  at,
  color,
  children,
  style,
}) => {
  const p = prog(f, at, 12);
  return (
    <span style={{position: 'relative', display: 'inline-block', ...style}}>
      <span
        style={{
          position: 'absolute',
          left: '-0.12em',
          right: '-0.12em',
          bottom: '0.08em',
          height: '0.42em',
          borderRadius: '0.2em',
          background: color,
          transformOrigin: 'left center',
          transform: `scaleX(${p})`,
        }}
      />
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};

export const Kicker: React.FC<{children: React.ReactNode; color?: string; bg?: string; style?: React.CSSProperties}> = ({
  children,
  color = C.ink,
  bg = 'rgba(255,255,255,0.72)',
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 28px',
      borderRadius: 999,
      background: bg,
      boxShadow: '0 10px 30px rgba(90,50,70,0.10), inset 0 0 0 1.5px rgba(255,255,255,0.9)',
      fontFamily: BODY,
      fontWeight: 600,
      fontSize: 28,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/** frosted glass card */
export const Glass: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      background: 'linear-gradient(150deg, rgba(255,255,255,0.86), rgba(255,255,255,0.58))',
      borderRadius: 40,
      boxShadow: '0 24px 60px rgba(90,50,70,0.16), inset 0 0 0 2px rgba(255,255,255,0.85)',
      backdropFilter: 'blur(14px)',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------------- ornaments ---------------- */
export const Sparkle: React.FC<{f: number; at: number; x: number; y: number; size?: number; color?: string; life?: number}> = ({
  f,
  at,
  x,
  y,
  size = 60,
  color = '#fff',
  life = 1.4,
}) => {
  const d = (f - at * FPS) / FPS;
  if (d < 0 || d > life) return null;
  const s = Math.sin(Math.min(d / life, 1) * Math.PI);
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${s}) rotate(${d * 90}deg)`, overflow: 'visible'}}
    >
      <path d="M0,-50 C6,-12 12,-6 50,0 C12,6 6,12 0,50 C-6,12 -12,6 -50,0 C-12,-6 -6,-12 0,-50Z" fill={color} style={{filter: `drop-shadow(0 0 8px ${color})`}} />
    </svg>
  );
};
/** burst of sparkles around a point */
export const Burst: React.FC<{f: number; at: number; x: number; y: number; r?: number; color?: string; n?: number}> = ({f, at, x, y, r = 160, color = '#fff', n = 6}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.4;
      const rr = r * (0.7 + ((i * 37) % 10) / 25);
      return <Sparkle key={i} f={f} at={at + i * 0.04} x={x + Math.cos(a) * rr} y={y + Math.sin(a) * rr} size={26 + ((i * 13) % 4) * 12} color={color} life={1.1} />;
    })}
  </>
);

/** glossy water droplet */
export const Droplet: React.FC<{x: number; y: number; size: number; f: number; phase?: number; opacity?: number; tint?: string}> = ({
  x,
  y,
  size,
  f,
  phase = 0,
  opacity = 1,
  tint = C.skyMid,
}) => {
  const bob = Math.sin(f / 34 + phase) * 14;
  const id = `dg${Math.round(phase * 100)}`;
  return (
    <svg width={size} height={size * 1.32} viewBox="0 0 100 132" style={{position: 'absolute', left: x, top: y + bob, opacity, transform: `rotate(${Math.sin(f / 50 + phase) * 6}deg)`, overflow: 'visible'}}>
      <defs>
        <radialGradient id={id} cx="38%" cy="62%" r="62%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.55" stopColor={tint} stopOpacity="0.55" />
          <stop offset="1" stopColor="#6FA6D6" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <path d="M50 2 C50 2 92 58 92 84 A42 42 0 0 1 8 84 C8 58 50 2 50 2Z" fill={`url(#${id})`} style={{filter: 'drop-shadow(0 14px 18px rgba(70,120,170,0.25))'}} />
      <path d="M50 2 C50 2 92 58 92 84 A42 42 0 0 1 8 84 C8 58 50 2 50 2Z" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" />
      <ellipse cx="34" cy="80" rx="9" ry="16" fill="#fff" opacity="0.9" transform="rotate(20 34 80)" />
      <circle cx="66" cy="104" r="5" fill="#fff" opacity="0.7" />
    </svg>
  );
};

/** pearl / glossy sphere */
export const Pearl: React.FC<{x: number; y: number; d: number; c1?: string; c2?: string; f: number; phase?: number; blur?: number}> = ({
  x,
  y,
  d,
  c1 = '#fff',
  c2 = C.blushMid,
  f,
  phase = 0,
  blur = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y + Math.sin(f / 40 + phase) * 16,
      width: d,
      height: d,
      borderRadius: '50%',
      background: `radial-gradient(circle at 32% 28%, ${c1} 0%, ${c1} 8%, ${c2} 62%, rgba(0,0,0,0.06) 100%)`,
      boxShadow: `0 ${d * 0.18}px ${d * 0.35}px rgba(90,50,70,0.14)`,
      filter: blur ? `blur(${blur}px)` : undefined,
    }}
  />
);

/** centella asiatica (gotu kola) leaf: kidney-shaped, scalloped, radial veins */
export const Leaf: React.FC<{x: number; y: number; size: number; rot?: number; grow?: number; tint?: string}> = ({x, y, size, rot = 0, grow = 1, tint = C.sageDeep}) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `rotate(${rot}deg) scale(${grow})`, overflow: 'visible'}}>
    <defs>
      <radialGradient id={`lf${tint.slice(1)}`} cx="50%" cy="70%" r="70%">
        <stop offset="0" stopColor="#E3EED9" />
        <stop offset="1" stopColor={tint} />
      </radialGradient>
    </defs>
    <path
      d="M0 14 C-8 6 -18 8 -24 14 C-44 4 -52 -22 -36 -40 C-28 -48 -18 -50 -10 -48 C-4 -54 4 -54 10 -48 C18 -50 28 -48 36 -40 C52 -22 44 4 24 14 C18 8 8 6 0 14Z"
      fill={`url(#lf${tint.slice(1)})`}
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.5"
      style={{filter: 'drop-shadow(0 8px 10px rgba(70,100,60,0.2))'}}
    />
    {[-140, -115, -90, -65, -40].map((a) => (
      <line key={a} x1="0" y1="12" x2={Math.cos((a * Math.PI) / 180) * 40} y2={12 + Math.sin((a * Math.PI) / 180) * 50} stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" />
    ))}
    <line x1="0" y1="12" x2="0" y2="58" stroke={tint} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/** close-up skin disc: pores / texture / redness / marks are each 0..1 */
export const SkinDisc: React.FC<{d: number; pores?: number; rough?: number; red?: number; marks?: number; glow?: number}> = ({
  d,
  pores = 0,
  rough = 0,
  red = 0,
  marks = 0,
  glow = 0,
}) => {
  const pts = Array.from({length: 46}).map((_, i) => [((i * 73) % 100) - 50, ((i * 41 + (i % 7) * 13) % 100) - 50, 1 + ((i * 17) % 5) / 3]);
  return (
    <svg width={d} height={d} viewBox="-50 -50 100 100" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="skin" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#FBE3D4" />
          <stop offset="1" stopColor="#EFC2A8" />
        </radialGradient>
        <clipPath id="skinclip">
          <circle r="48" />
        </clipPath>
        <filter id="soft">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>
      <circle r="48" fill="url(#skin)" />
      <g clipPath="url(#skinclip)">
        {/* uneven texture */}
        {Array.from({length: 9}).map((_, i) => (
          <path key={i} d={`M-60 ${-40 + i * 10} q 15 ${-4 * rough} 30 0 t 30 0 t 30 0 t 30 0`} fill="none" stroke="#D9A588" strokeWidth={0.9} opacity={0.6 * rough} />
        ))}
        {pts.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r * (0.35 + 0.65 * pores)} fill="#C98C70" opacity={0.75 * pores} />
        ))}
        <g filter="url(#soft)" opacity={red}>
          <ellipse cx="-14" cy="6" rx="22" ry="15" fill="#E36F78" opacity="0.55" />
          <ellipse cx="18" cy="-12" rx="16" ry="12" fill="#E36F78" opacity="0.45" />
        </g>
        {[[-20, -18], [12, 16], [24, -4], [-6, 24], [-28, 10]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.2} fill="#B56A5A" opacity={0.8 * marks} />
        ))}
        <circle r="48" fill="url(#skin)" opacity={0.0} />
        <ellipse cx="-16" cy="-22" rx="20" ry="11" fill="#fff" opacity={0.18 + 0.4 * glow} filter="url(#soft)" />
      </g>
      <circle r="48" fill="none" stroke="#fff" strokeWidth="3" />
    </svg>
  );
};

/** skin cross-section: drop sinks through the layers ("absorbs quickly") */
export const SkinLayers: React.FC<{w: number; f: number; at: number}> = ({w, f, at}) => {
  const p = prog(f, at + 0.2, 34, easeOut);
  const h = w * 0.66;
  return (
    <svg width={w} height={h} viewBox="0 0 300 200" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="dermis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7CFC4" />
          <stop offset="1" stopColor="#EFB2A6" />
        </linearGradient>
        <clipPath id="layclip">
          <rect x="0" y="40" width="300" height="160" rx="22" />
        </clipPath>
      </defs>
      <g clipPath="url(#layclip)">
        <rect x="0" y="40" width="300" height="160" fill="url(#dermis)" />
        <rect x="0" y="40" width="300" height="56" fill="#FBE0D6" />
        {/* stratum corneum "bricks" = skin barrier */}
        {Array.from({length: 2}).map((_, r) =>
          Array.from({length: 8}).map((_, i) => (
            <rect key={`${r}-${i}`} x={i * 40 - (r % 2) * 20 + 2} y={42 + r * 13} width="36" height="11" rx="4" fill="#FFF3EC" stroke="#F2C9BB" strokeWidth="1" />
          )),
        )}
        {Array.from({length: 7}).map((_, i) => (
          <circle key={i} cx={22 + i * 44} cy={150 + (i % 2) * 18} r="14" fill="none" stroke="#E8A497" strokeWidth="1.4" opacity="0.6" />
        ))}
        {/* hydration spreading */}
        <ellipse cx="150" cy={70 + p * 60} rx={20 + p * 120} ry={10 + p * 40} fill={C.skyMid} opacity={0.5 * Math.min(1, p * 3) * (1 - p * 0.4)} />
      </g>
      {/* droplet falling then sinking */}
      <g transform={`translate(150 ${-20 + Math.min(1, p * 2.2) * 75}) scale(${1 - Math.max(0, p - 0.45) * 1.6})`} opacity={1 - Math.max(0, p - 0.6) * 2.5}>
        <path d="M0 -22 C0 -22 16 0 16 9 A16 16 0 0 1 -16 9 C-16 0 0 -22 0 -22Z" fill={C.skyDeep} />
        <ellipse cx="-5" cy="6" rx="3.5" ry="6" fill="#fff" opacity="0.85" />
      </g>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${100 + i * 50} ${100 + p * 20} l0 ${22 * p} m-7 -8 l7 8 l7 -8`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={p > 0.35 ? (p - 0.35) * 1.6 : 0} />
      ))}
    </svg>
  );
};

export const Feather: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 100 160" style={{overflow: 'visible', filter: 'drop-shadow(0 18px 20px rgba(120,90,70,0.18))'}}>
    <defs>
      <linearGradient id="fth" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor={C.blush} />
      </linearGradient>
    </defs>
    <path d="M52 4 C80 26 88 70 72 108 C64 126 54 134 46 138 C34 120 22 96 24 66 C26 36 38 16 52 4Z" fill="url(#fth)" stroke="#fff" strokeWidth="2" />
    {Array.from({length: 11}).map((_, i) => (
      <path key={i} d={`M${50 - i * 0.5} ${22 + i * 10} q ${-14} ${6} ${-22 + i * 0.6} ${16}`} stroke={C.blushMid} strokeWidth="1.2" fill="none" opacity="0.8" />
    ))}
    {Array.from({length: 10}).map((_, i) => (
      <path key={`r${i}`} d={`M${50 - i * 0.5} ${24 + i * 10} q ${14} ${4} ${22 - i * 0.4} ${14}`} stroke={C.blushMid} strokeWidth="1.2" fill="none" opacity="0.8" />
    ))}
    <path d="M52 10 C50 60 46 110 40 156" stroke={C.rose} strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </svg>
);

/** animated check circle */
export const Check: React.FC<{f: number; at: number; size?: number; color?: string}> = ({f, at, size = 64, color = C.rose}) => {
  const s = pop(f, at, 11, 200);
  const p = prog(f, at + 0.08, 12);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{transform: `scale(${s})`, flexShrink: 0}}>
      <circle cx="32" cy="32" r="30" fill={color} />
      <path d="M19 33 L28 42 L46 23" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset={40 * (1 - p)} />
    </svg>
  );
};

/** simple skincare bottle icon */
export const BottleIcon: React.FC<{kind: 'toner' | 'essence' | 'serum' | 'cream'; size: number; color: string}> = ({kind, size, color}) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    {kind === 'toner' && (
      <g>
        <rect x="20" y="8" width="20" height="8" rx="2" fill={color} />
        <rect x="15" y="16" width="30" height="38" rx="7" fill="#fff" stroke={color} strokeWidth="2.5" />
      </g>
    )}
    {kind === 'essence' && (
      <g>
        <rect x="22" y="5" width="16" height="14" rx="3" fill={C.peachDeep} />
        <path d="M14 34 A16 16 0 0 1 46 34 L46 50 A5 5 0 0 1 41 55 L19 55 A5 5 0 0 1 14 50Z" fill="#fff" stroke={C.peachDeep} strokeWidth="2.5" />
        <rect x="22" y="22" width="16" height="4" fill={C.peachDeep} opacity="0" />
        <rect x="20" y="36" width="20" height="12" rx="2" fill={C.peach} />
      </g>
    )}
    {kind === 'serum' && (
      <g>
        <ellipse cx="30" cy="8" rx="6" ry="5" fill={color} />
        <rect x="26" y="12" width="8" height="8" fill={color} />
        <rect x="18" y="20" width="24" height="34" rx="6" fill="#fff" stroke={color} strokeWidth="2.5" />
      </g>
    )}
    {kind === 'cream' && (
      <g>
        <rect x="10" y="22" width="40" height="10" rx="4" fill={color} />
        <rect x="12" y="32" width="36" height="20" rx="7" fill="#fff" stroke={color} strokeWidth="2.5" />
      </g>
    )}
  </svg>
);

export const fonts = {SERIF, SANS, BODY};
