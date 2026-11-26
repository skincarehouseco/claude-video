import React from 'react';
import {useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {C, FPS, pop, SANS, W} from './theme';

type Chunk = {start: number; end: number; words: {text: string; start: number; end: number}[]};
const CH = captions as Chunk[];
// keywords that get the blush highlight when spoken
const KEY = /galactomyces|pores|smoother|5%|niacinamide|centella|asiatica|soothe|redness|scars|texture|lightweight|watery|quickly|heavy|comfortable|easy|try|best|essence/i;

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = CH.findIndex((c, j) => t >= c.start - 0.05 && t < (CH[j + 1]?.start ?? c.end + 0.6) - 0.05 && t < c.end + 0.6);
  if (i < 0) return null;
  const c = CH[i];
  const s = pop(f, c.start - 0.05, 14, 220);
  return (
    <div style={{position: 'absolute', top: 1500, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          display: 'flex',
          gap: 14,
          padding: '14px 30px',
          borderRadius: 26,
          background: 'rgba(255,255,255,0.78)',
          boxShadow: '0 14px 36px rgba(75,52,66,0.16), inset 0 0 0 1.5px rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          transform: `translateY(${(1 - s) * 18}px) scale(${0.94 + 0.06 * s})`,
          maxWidth: 820,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {c.words.map((w, k) => {
          const active = t >= w.start - 0.04;
          const now = t >= w.start - 0.04 && t < w.end + 0.08;
          const key = KEY.test(w.text);
          return (
            <span
              key={k}
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 48,
                lineHeight: 1.2,
                color: key && active ? C.rose : C.ink,
                opacity: active ? 1 : 0.35,
                transform: now ? 'translateY(-3px)' : 'none',
                display: 'inline-block',
                padding: '0 6px',
                borderRadius: 12,
                background: now && key ? 'rgba(247,217,223,0.9)' : 'transparent',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
