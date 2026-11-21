import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from './captions.json';
import {C, F, SAFE_CX, sec} from './theme';

type Word = {text: string; start: number; end: number};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// Lower-middle of the frame (over the scarf), well inside TikTok's safe zone (bottom edge 1490).
const CENTER_Y = 1330;
const WIDTH = 800;

/** Clean, regular-weight (non-bold) captions in soft butter yellow, word-synced to the voice. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.05 && t < c.end);
  if (!chunk) return null;
  const local = frame - sec(chunk.start - 0.05);
  const enter = spring({frame: local, fps, config: {damping: 16, stiffness: 190, mass: 0.6}});
  const exit = interpolate(sec(chunk.end) - frame, [0, 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE_CX - WIDTH / 2,
          width: WIDTH,
          top: CENTER_Y - 50,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 15,
          opacity: Math.min(enter, exit),
          transform: `translateY(${(1 - enter) * 14}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 15,
            padding: '4px 28px 10px',
            borderRadius: 28,
            // soft frosted cocoa pill: keeps the light butter yellow readable over the pale scarf
            background: 'rgba(70,48,58,0.5)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 6px 20px rgba(40,25,30,0.22)',
          }}
        >
        {chunk.words.map((w, i) => {
          const said = t >= w.start - 0.04;
          const active = said && t < w.end + 0.05;
          const wp = said ? spring({frame: frame - sec(w.start - 0.04), fps, config: {damping: 12, stiffness: 240, mass: 0.4}}) : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: F.caption,
                fontWeight: 500,
                fontSize: 60,
                lineHeight: 1.2,
                letterSpacing: 0.3,
                color: C.butter,
                opacity: said ? 1 : 0.6,
                display: 'inline-block',
                transform: `translateY(${active ? -wp * 3 : 0}px) scale(${active ? 1 + wp * 0.04 : 1})`,
                // thin soft outline + shadow keeps the light yellow legible without looking bold
                textShadow:
                  '0 1px 2px rgba(50,30,40,0.7)',
              }}
            >
              {w.text}
            </span>
          );
        })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
