import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import captions from './captions.json';
import {C, FPS, prog, SAFE, SANS, useVariant} from './theme';

type Word = {text: string; start: number; end: number; hl: boolean};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// The CTA headline already shows "Grab yours now!" word-for-word in sync, so the caption steps aside there.
const HIDE_FROM = 30.1;
const CENTER_Y = 1395;

/** CapCut-style explainer captions (used by both versions): bold white words that pop in one by one; keywords sit on a butter-yellow highlight. */
const CaptionsB: React.FC<{t: number; chunk: Chunk}> = ({t, chunk}) => {
  const exit = 1 - prog(t, chunk.end - 0.06, chunk.end);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 1330, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22, rowGap: 6, opacity: exit}}>
        {chunk.words.map((w, i) => {
          const p = spring({frame: (t - w.start + 0.05) * FPS, fps: FPS, config: {damping: 11, stiffness: 240, mass: 0.5}});
          if (t < w.start - 0.05) return null;
          const active = t < w.end + 0.05;
          return (
            <span
              key={i}
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 64,
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                display: 'inline-block',
                padding: w.hl ? '0 14px 4px' : 0,
                borderRadius: 14,
                background: w.hl ? C.butterDeep : 'transparent',
                color: w.hl ? C.ink : '#FFFFFF',
                textShadow: w.hl ? 'none' : `0 0 2px ${C.ink}, 0 3px 0 ${C.ink}, 2px 0 0 ${C.ink}, -2px 0 0 ${C.ink}, 0 -2px 0 ${C.ink}, 0 8px 18px rgba(60,20,40,0.45)`,
                boxShadow: w.hl ? `0 4px 0 ${C.ink}, 0 8px 18px rgba(60,20,40,0.3)` : 'none',
                transform: `scale(${(0.5 + 0.5 * p) * (active ? 1.06 : 1)}) rotate(${w.hl ? -2 : 0}deg)`,
                opacity: Math.min(1, p * 1.6),
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

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const variant = useVariant();
  if (t >= HIDE_FROM) return null;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.04 && t < c.end);
  if (!chunk) return null;
  if (variant === 'B' || variant === 'A') return <CaptionsB t={t} chunk={chunk} />;
  const enter = spring({frame: (t - chunk.start + 0.04) * FPS, fps: FPS, config: {damping: 15, stiffness: 200, mass: 0.6}});
  const exit = 1 - prog(t, chunk.end - 0.08, chunk.end);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          top: CENTER_Y - 58,
          display: 'flex',
          justifyContent: 'center',
          opacity: Math.min(enter, exit),
          transform: `translateY(${(1 - enter) * 16}px) scale(${0.95 + 0.05 * enter})`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 14,
            padding: '12px 30px 14px',
            borderRadius: 34,
            background: 'rgba(255,250,247,0.9)',
            boxShadow: '0 12px 34px rgba(20,22,30,0.22), inset 0 0 0 2px rgba(255,255,255,0.95)',
            maxWidth: SAFE.right - SAFE.left,
          }}
        >
          {chunk.words.map((w, i) => {
            const said = t >= w.start - 0.04;
            const active = said && t < w.end + 0.05;
            const b = active ? spring({frame: (t - w.start + 0.04) * FPS, fps: FPS, config: {damping: 10, stiffness: 260, mass: 0.4}}) : 0;
            const hp = w.hl ? prog(t, w.start - 0.04, w.start + 0.14) : 0;
            return (
              <span
                key={i}
                style={{
                  position: 'relative',
                  fontFamily: SANS,
                  fontWeight: w.hl ? 750 : 600,
                  fontSize: 56,
                  lineHeight: 1.18,
                  color: w.hl && said ? C.cherry : C.ink,
                  opacity: said ? 1 : 0.45,
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  transform: `translateY(${-b * 3}px) scale(${1 + b * 0.05})`,
                }}
              >
                {w.hl && (
                  // soft marker swipe behind keywords
                  <span
                    style={{
                      position: 'absolute',
                      left: -6,
                      right: -6,
                      bottom: 6,
                      height: 20,
                      borderRadius: 10,
                      background: C.blushDeep,
                      transformOrigin: 'left center',
                      transform: `scaleX(${hp})`,
                      zIndex: -1,
                    }}
                  />
                )}
                <span style={{position: 'relative'}}>{w.text}</span>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
