import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FPS} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const ANAGEN = {from: 24.95, until: 33.88, lines: ['A healthy lash', 'environment', 'supports the', 'natural', 'growth', 'process.'], at: 25.05};
const TELOGEN = {from: 33.88, until: 46.5, lines: ['The lash rests', 'in the follicle', 'before', 'shedding as', 'part of the', 'natural cycle.'], at: 34.05};

/** Little skin cross-section with a lash follicle. `phase` 0 = anagen (growing), 1 = telogen (resting). */
const Follicle: React.FC<{phase: 0 | 1; grow: number}> = ({phase, grow}) => {
  const hairLen = 300;
  const rise = phase === 1 ? 26 * grow : 0; // telogen: hair is slowly pushed up (shedding)
  return (
    <svg width={200} height={230} viewBox="0 0 200 230">
      <defs>
        <clipPath id={`skin${phase}`}>
          <rect x={0} y={0} width={200} height={230} rx={6} />
        </clipPath>
      </defs>
      <g clipPath={`url(#skin${phase})`}>
        <rect width={200} height={230} fill="#FFF8F0" />
        {/* skin layers */}
        <path d="M0 95 Q50 85 100 95 T200 92 V230 H0Z" fill="#F6C9A7" />
        <path d="M0 120 Q50 110 100 122 T200 118 V230 H0Z" fill="#F2B184" />
        <path d="M0 150 Q60 140 110 152 T200 148 V230 H0Z" fill="#F7D9A6" />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M0 ${170 + k * 14} Q50 ${160 + k * 14} 100 ${172 + k * 14} T200 ${168 + k * 14}`} stroke={['#E9A23B', '#7FB7A4', '#E57C6E', '#F0C04F'][k]} strokeWidth={3} fill="none" opacity={0.85} />
        ))}
        {/* follicle sheath */}
        <path d={phase === 0 ? 'M88 92 C86 140 84 175 92 205 Q100 215 108 205 C116 175 114 140 112 92Z' : 'M90 92 C89 120 88 140 93 160 Q100 168 107 160 C112 140 111 120 110 92Z'} fill="#E9B08A" stroke="#C98663" strokeWidth={2} />
        {/* bulb / club */}
        {phase === 0 ? <ellipse cx={100} cy={200} rx={12} ry={11} fill="#7A4B2E" /> : <ellipse cx={100} cy={152 - rise} rx={7} ry={9} fill="#B98A62" />}
        {/* lash hair */}
        <path
          d={`M100 ${phase === 0 ? 195 : 150 - rise} C100 120, 104 60, 140 6`}
          stroke="#3A2A22"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={hairLen}
          strokeDashoffset={phase === 0 ? hairLen * (1 - grow) : 0}
        />
      </g>
    </svg>
  );
};

const Card: React.FC<{phase: 0 | 1; grow: number}> = ({phase, grow}) => (
  <div style={{width: 230, background: '#fff', padding: '14px 14px 12px', boxShadow: '0 12px 30px rgba(0,0,0,0.28)', borderRadius: 4}}>
    <Follicle phase={phase} grow={grow} />
    <div style={{textAlign: 'center', fontFamily: 'Cap', fontWeight: 700, fontSize: 24, color: '#222', marginTop: 6}}>{phase === 0 ? 'Anagen' : 'Telogen'}</div>
    <div style={{textAlign: 'center', fontFamily: 'Cap', fontWeight: 500, fontSize: 15, color: '#777'}}>{phase === 0 ? '(growing phase)' : '(resting phase)'}</div>
  </div>
);

const Lines: React.FC<{lines: string[]; at: number; until: number}> = ({lines, at, until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const out = interpolate(t, [until - 0.1, until + 0.15], [0, 1], clamp);
  return (
    <div style={{textAlign: 'right', opacity: 1 - out}}>
      {lines.map((l, i) => {
        const s = at + i * 0.32;
        const p = spring({frame: frame - Math.round(s * fps), fps, config: {damping: 14, stiffness: 160, mass: 0.6}});
        return (
          <div
            key={i}
            style={{
              fontFamily: 'Cond',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 64,
              lineHeight: 0.98,
              letterSpacing: -1,
              color: '#fff',
              textShadow: '0 3px 12px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.4)',
              opacity: p,
              transform: `translateX(${(1 - p) * 40}px)`,
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

export const PhaseCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / FPS;
  if (t < ANAGEN.from - 0.05 || t > TELOGEN.until + 0.3) return null;
  const inP = spring({frame: frame - Math.round(ANAGEN.from * fps), fps, config: {damping: 13, stiffness: 120, mass: 0.8}});
  const out = interpolate(t, [TELOGEN.until - 0.05, TELOGEN.until + 0.25], [0, 1], clamp);
  // card flip anagen -> telogen
  const flip = interpolate(t, [TELOGEN.from - 0.15, TELOGEN.from + 0.25], [0, 180], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const phase: 0 | 1 = flip < 90 ? 0 : 1;
  const grow = phase === 0 ? interpolate(t, [ANAGEN.from + 0.3, ANAGEN.from + 4], [0.25, 1], {...clamp, easing: Easing.out(Easing.quad)}) : interpolate(t, [TELOGEN.from + 0.5, TELOGEN.until - 1], [0, 1], clamp);
  const bob = Math.sin(t * 1.8) * 5;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 95,
          top: 830 + bob,
          transform: `translateX(${(1 - inP) * -320}px) rotate(${-4 + (1 - inP) * -12}deg) perspective(900px) rotateY(${phase === 0 ? flip : flip - 180}deg) scale(${1 - out * 0.2})`,
          opacity: 1 - out,
        }}
      >
        <Card phase={phase} grow={grow} />
      </div>
      <div style={{position: 'absolute', right: 1080 - 905, top: 840, width: 520}}>
        {t < TELOGEN.from ? <Lines {...ANAGEN} /> : <Lines {...TELOGEN} />}
      </div>
    </>
  );
};
