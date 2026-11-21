import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, SAFE_CX} from './theme';

/**
 * The clip has no voice-over (audio is a music track), so the captions carry the product
 * information, each one timed to the shot that shows it.
 * [fromFrame, toFrame, text, highlighted words]
 */
export const CAPTIONS: [number, number, string, string[]][] = [
  [4, 59, 'hydrating toner ni jenis spray', ['spray']],
  [61, 101, 'boleh pakai sebagai facemist', ['facemist']],
  [103, 147, 'teksturnya milky', ['milky']],
  [148, 193, 'cepat meresap ke dalam kulit', ['meresap']],
  [195, 242, 'buat kulit nampak plump', ['plump']],
  [244, 283, 'sesuai untuk dehydrated skin', ['dehydrated', 'skin']],
];

export const CAPTION_SIZE = 52; // clean, small, regular-weight captions
const CAPTION_Y = 1300; // lower-middle, above TikTok's bottom UI (safe until y=1490)
const MAX_W = 830; // full safe-zone width (x 80..910)

const Caption: React.FC<{from: number; to: number; text: string; hi: string[]}> = ({from, to, text, hi}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = f - from;
  const words = text.split(' ');
  const box = spring({frame: local, fps, config: {damping: 18, stiffness: 170, mass: 0.7}});
  const out = interpolate(f, [to - 5, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_CX - MAX_W / 2,
        width: MAX_W,
        top: CAPTION_Y,
        display: 'flex',
        justifyContent: 'center',
        opacity: Math.min(box * 1.3, 1) * out,
        transform: `translateY(${(1 - box) * 22 + (1 - out) * -10}px) scale(${0.92 + 0.08 * box})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 12,
          padding: '10px 26px 14px',
          borderRadius: 28,
          // soft frosted cocoa pill keeps light butter yellow readable over the pale scarf
          background: 'rgba(70,52,48,0.50)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 6px 20px rgba(40,25,30,0.22), inset 0 0 0 1.5px rgba(255,240,166,0.22)',
        }}
      >
        {words.map((w, i) => {
          // words pop in one after another, like typed-out TikTok captions
          const p = spring({frame: local - i * 2.5, fps, config: {damping: 14, stiffness: 220, mass: 0.5}});
          const isHi = hi.includes(w);
          return (
            <span
              key={i}
              style={{
                position: 'relative',
                display: 'inline-block',
                fontFamily: F.sans,
                fontWeight: 500,
                fontSize: CAPTION_SIZE,
                lineHeight: 1.2,
                letterSpacing: 0.3,
                color: C.butter,
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${(1 - p) * 14}px)`,
                textShadow: '0 2px 6px rgba(40,25,30,0.45)',
              }}
            >
              {w}
              {isHi && <Squiggle delay={from + 8 + i * 2.5} />}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// hand-drawn wavy underline that draws itself under the key word
const Squiggle: React.FC<{delay: number}> = ({delay}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{position: 'absolute', left: 0, bottom: -4, width: '100%', height: 12}}>
      <path
        d="M2 7 Q 10 1 18 7 T 34 7 T 50 7 T 66 7 T 82 7 T 98 7"
        fill="none"
        stroke={C.pink}
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const c = CAPTIONS.find(([a, b]) => f >= a && f < b);
  if (!c) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Caption key={c[0]} from={c[0]} to={c[1]} text={c[2]} hi={c[3]} />
    </AbsoluteFill>
  );
};
