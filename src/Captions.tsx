import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {pop, ramp} from './anim';
import {C, CX, FPS, SANS} from './theme';

type Word = {text: string; start: number; end: number; key: boolean};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// one-line captions sitting just above TikTok's bottom UI (safe bottom = 1490)
const BASELINE_Y = 1405;

export const Captions: React.FC<{hideFrom?: number}> = ({hideFrom = 999}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t >= hideFrom) return null;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.04 && t < c.end);
  if (!chunk) return null;
  const enter = pop(t, chunk.start - 0.04, 320, 16);
  const exit = 1 - ramp(t, chunk.end - 0.07, 0.07);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: CX - 430,
          width: 860,
          top: BASELINE_Y - 50,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          columnGap: 16,
          opacity: exit,
          transform: `translateY(${(1 - enter) * 22}px) scale(${0.9 + 0.1 * enter})`,
        }}
      >
        {chunk.words.map((w, i) => {
          const active = t >= w.start - 0.03;
          const p = pop(t, w.start - 0.03, 420, 14);
          const big = w.key;
          return (
            <span
              key={i}
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: big ? 66 : 58,
                lineHeight: 1,
                letterSpacing: -0.5,
                color: big ? C.yellow : C.white,
                opacity: active ? 1 : 0.55,
                display: 'inline-block',
                transform: `translateY(${-(big ? 8 : 4) * Math.sin(Math.PI * Math.min(1, p))}px) scale(${active ? 0.92 + 0.08 * p : 0.92})`,
                WebkitTextStroke: '10px #0B141A',
                paintOrder: 'stroke fill',
                textShadow: '0 6px 0 rgba(11,20,26,0.9), 0 10px 24px rgba(0,0,0,0.35)',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
