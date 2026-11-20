import React from 'react';
import {C} from './theme';

/* Small hand-drawn style illustrations (200x200 viewBox) for the comparison cards. `t` = frames since shown. */
type P = {t: number};
const stroke = {stroke: C.ink, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

const Face: React.FC<{t: number; mood: 'sad' | 'happy' | 'meh'; spots?: boolean; shine?: boolean; dry?: boolean; dull?: boolean}> = ({t, mood, spots, shine, dry, dull}) => {
  const blink = t % 90 > 84 ? 0.15 : 1;
  return (
    <g>
      <circle cx={100} cy={106} r={70} fill={dull ? '#E9D3C2' : C.skin} {...stroke} />
      {!dull && <ellipse cx={58} cy={126} rx={13} ry={8} fill={C.rose} opacity={0.75} />}
      {!dull && <ellipse cx={142} cy={126} rx={13} ry={8} fill={C.rose} opacity={0.75} />}
      {mood === 'happy' ? (
        <>
          <path d="M66 100 q10 -12 20 0" fill="none" {...stroke} />
          <path d="M114 100 q10 -12 20 0" fill="none" {...stroke} />
          <path d="M82 128 q18 18 36 0" fill="none" {...stroke} />
        </>
      ) : (
        <>
          <ellipse cx={76} cy={100} rx={6} ry={8 * blink} fill={C.ink} />
          <ellipse cx={124} cy={100} rx={6} ry={8 * blink} fill={C.ink} />
          {mood === 'sad' ? <path d="M84 138 q16 -12 32 0" fill="none" {...stroke} /> : <path d="M86 134 h28" fill="none" {...stroke} />}
          {mood === 'sad' && <path d="M62 84 l14 -6 M138 84 l-14 -6" {...stroke} />}
        </>
      )}
      {spots &&
        [
          [60, 80],
          [140, 78],
          [132, 148],
          [70, 150],
          [104, 68],
        ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5.5} fill="#F08A8A" opacity={0.9} />)}
      {dry && (
        <g fill="none" stroke="#C9A58C" strokeWidth={3} strokeLinecap="round">
          <path d="M48 92 l8 6 l-4 8" />
          <path d="M150 90 l-8 7 l4 8" />
          <path d="M96 60 l6 6 l-6 6" />
        </g>
      )}
      {shine && (
        <g fill="#fff" opacity={0.9}>
          <ellipse cx={100} cy={64} rx={14} ry={6} />
          <ellipse cx={56} cy={110} rx={6} ry={10} />
          <ellipse cx={146} cy={110} rx={6} ry={10} />
        </g>
      )}
    </g>
  );
};

export const Star: React.FC<{x: number; y: number; s: number; t: number; color?: string; phase?: number}> = ({x, y, s, t, color = '#fff', phase = 0}) => {
  const k = 0.7 + 0.3 * Math.sin((t + phase) / 7);
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s * k}) rotate(${(t + phase) * 1.5})`}
      d="M0 -10 C2 -2 2 -2 10 0 C2 2 2 2 0 10 C-2 2 -2 2 -10 0 C-2 -2 -2 -2 0 -10Z"
      fill={color}
    />
  );
};

export const FaceSpots: React.FC<P> = ({t}) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect width={200} height={200} rx={26} fill={C.blush} />
    <Face t={t} mood="sad" spots />
  </svg>
);
export const FaceGlow: React.FC<P> = ({t}) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect width={200} height={200} rx={26} fill={C.mint} />
    <Face t={t} mood="happy" />
    <Star x={40} y={44} s={1.5} t={t} />
    <Star x={164} y={52} s={1.1} t={t} phase={20} />
    <Star x={160} y={168} s={1.3} t={t} phase={40} />
  </svg>
);

/** week calendar: `n` days ticked with a scrub icon */
export const Calendar: React.FC<P & {n: number; good: boolean}> = ({t, n, good}) => {
  const days = [0, 1, 2, 3, 4, 5, 6];
  const picks = n === 7 ? days : [1, 4];
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <rect width={200} height={200} rx={26} fill={good ? C.mint : C.blush} />
      <rect x={24} y={34} width={152} height={140} rx={16} fill="#fff" {...stroke} />
      <path d="M24 70 h152" {...stroke} />
      <rect x={24} y={34} width={152} height={36} rx={14} fill={good ? C.okGreen : C.coral} />
      <path d="M58 24 v20 M142 24 v20" {...stroke} />
      {days.map((d) => {
        const x = 44 + (d % 4) * 37;
        const y = 92 + Math.floor(d / 4) * 42;
        const on = picks.includes(d);
        const k = Math.min(1, Math.max(0, (t - 6 - picks.indexOf(d) * 3) / 6));
        return (
          <g key={d} transform={`translate(${x} ${y})`}>
            <circle r={14} fill={on ? (good ? '#DFF5E7' : '#FFE1E6') : '#F4EEE8'} />
            {on && <circle r={8 * k} fill={good ? C.okGreen : C.coral} />}
          </g>
        );
      })}
    </svg>
  );
};

export const Bubbles: React.FC<P & {many: boolean}> = ({t, many}) => {
  const n = many ? 9 : 3;
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <rect width={200} height={200} rx={26} fill={many ? C.blush : C.mint} />
      {/* cleanser bottle */}
      <rect x={70} y={78} width={60} height={96} rx={16} fill={C.sky} {...stroke} />
      <rect x={88} y={52} width={24} height={28} rx={6} fill="#fff" {...stroke} />
      <path d="M100 52 v-14 h22" fill="none" {...stroke} />
      <path d="M84 118 h32 M84 132 h22" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      {Array.from({length: n}).map((_, i) => {
        const x = 30 + ((i * 53) % 140);
        const y = 160 - (((t * (1.2 + (i % 3) * 0.4) + i * 37) % 150));
        return <circle key={i} cx={x} cy={y} r={7 + (i % 3) * 4} fill="#fff" opacity={0.85} stroke="#A9D2F2" strokeWidth={2.5} />;
      })}
    </svg>
  );
};

export const SunMoon: React.FC<P> = ({t}) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect width={200} height={200} rx={26} fill={C.mint} />
    <g transform={`translate(62 96) rotate(${t * 0.8})`}>
      {Array.from({length: 8}).map((_, i) => (
        <path key={i} d="M0 -40 v-10" transform={`rotate(${i * 45})`} {...stroke} stroke="#F2B53C" />
      ))}
      <circle r={28} fill="#FFD866" {...stroke} />
    </g>
    <path d="M150 70 a34 34 0 1 0 22 58 a28 28 0 1 1 -22 -58z" fill="#CFC3F5" {...stroke} />
    <text x={62} y={176} textAnchor="middle" fontFamily="SkinRound" fontSize={22} fill={C.ink}>
      pagi
    </text>
    <text x={146} y={176} textAnchor="middle" fontFamily="SkinRound" fontSize={22} fill={C.ink}>
      malam
    </text>
  </svg>
);

export const HeavyCream: React.FC<P> = ({t}) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect width={200} height={200} rx={26} fill={C.blush} />
    <g transform={`translate(0 ${Math.sin(t / 10) * 2})`}>
      <path d="M46 96 q54 -44 108 0" fill="#fff" {...stroke} />
      <rect x={40} y={96} width={120} height={70} rx={14} fill={C.lavender} {...stroke} />
      <rect x={36} y={86} width={128} height={20} rx={8} fill="#fff" {...stroke} />
      <path d="M68 134 h64" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
    </g>
    {/* sweaty drops = too heavy */}
    <path d="M164 50 q8 12 0 18 q-8 -6 0 -18z" fill="#A9D2F2" stroke={C.ink} strokeWidth={3} />
    <path d="M30 60 q7 10 0 15 q-7 -5 0 -15z" fill="#A9D2F2" stroke={C.ink} strokeWidth={3} />
  </svg>
);

export const GelTube: React.FC<P> = ({t}) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect width={200} height={200} rx={26} fill={C.mint} />
    <g transform={`rotate(-18 100 110) translate(0 ${Math.sin(t / 12) * 3})`}>
      <path d="M62 50 h76 l-10 100 h-56z" fill={C.sky} {...stroke} />
      <rect x={82} y={150} width={36} height={22} rx={5} fill="#fff" {...stroke} />
      <text x={100} y={108} textAnchor="middle" fontFamily="SkinRound" fontSize={26} fill={C.ink}>
        gel
      </text>
    </g>
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        transform={`translate(${150 + i * 10 - 10} ${44 + i * 40 + Math.sin((t + i * 20) / 9) * 4})`}
        d="M0 -12 q10 14 0 20 q-10 -6 0 -20z"
        fill="#9ED4F7"
        stroke={C.ink}
        strokeWidth={3}
      />
    ))}
  </svg>
);

export const Sunscreen: React.FC<P & {good: boolean}> = ({t, good}) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect width={200} height={200} rx={26} fill={good ? C.mint : C.blush} />
    <g transform={`rotate(${good ? -14 : 10} 100 100)`} opacity={good ? 1 : 0.55}>
      <path d="M60 40 h80 l-8 108 h-64z" fill="#FFE58A" {...stroke} />
      <rect x={80} y={148} width={40} height={24} rx={5} fill="#fff" {...stroke} />
      <circle cx={100} cy={82} r={16} fill="#FFB347" stroke={C.ink} strokeWidth={4} />
      <text x={100} y={128} textAnchor="middle" fontFamily="SkinRound" fontSize={22} fill={C.ink}>
        SPF
      </text>
    </g>
    {good ? (
      // generous dollop
      <g transform={`translate(150 150) scale(${1 + Math.sin(t / 8) * 0.04})`}>
        <path d="M-26 14 q-4 -22 14 -24 q4 -18 22 -10 q20 -2 16 20 q6 14 -6 16z" fill="#fff" {...stroke} />
      </g>
    ) : (
      <g {...stroke} fill="none" stroke={C.ink} opacity={0.7}>
        <text x={152} y={62} fontFamily="SkinRound" fontSize={30} fill={C.ink} stroke="none">
          z
        </text>
        <text x={168} y={40} fontFamily="SkinRound" fontSize={22} fill={C.ink} stroke="none">
          z
        </text>
      </g>
    )}
  </svg>
);

export const Check: React.FC<{good: boolean; size?: number}> = ({good, size = 40}) => (
  <svg viewBox="0 0 40 40" width={size} height={size}>
    <circle cx={20} cy={20} r={18} fill={good ? C.okGreen : C.noRed} />
    {good ? (
      <path d="M11 20.5 l6 6 l12 -13" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M13 13 l14 14 M27 13 l-14 14" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" />
    )}
  </svg>
);
