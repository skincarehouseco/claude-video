import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from './captions.json';
import {C, CX, F, FPS} from './theme';

type Word = {text: string; start: number; end: number};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// Lower-middle of the frame: below her hands/face, well above TikTok's bottom UI (safe bottom = 1490)
const CENTER_Y = 1335;
const MAX_W = 830;
const LEAD = 0.06; // show each phrase a hair before the first word is heard

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / FPS;
  const chunk = CHUNKS.find((c) => t >= c.start - LEAD && t < c.end);
  if (!chunk) return null;
  const local = frame - Math.round((chunk.start - LEAD) * FPS);
  const enter = interpolate(local, [0, 6], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const exit = interpolate((chunk.end - t) * FPS, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  const o = Math.min(enter, exit);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: CX - MAX_W / 2,
          width: MAX_W,
          top: CENTER_Y - 50,
          display: 'flex',
          justifyContent: 'center',
          opacity: o,
          transform: `translateY(${(1 - enter) * 14}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 13,
            padding: '8px 26px 10px',
            borderRadius: 26,
            // soft frosted backing: her blouse is white, so the butter yellow needs a gentle dark base
            background: 'rgba(58,40,50,0.46)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {chunk.words.map((w, i) => {
            const said = t >= w.start - 0.03;
            const active = said && t < w.end + 0.05;
            const bump = said ? spring({frame: frame - Math.round((w.start - 0.03) * FPS), fps, config: {damping: 12, stiffness: 240, mass: 0.4}}) : 0;
            return (
              <span
                key={i}
                style={{
                  fontFamily: F.caption,
                  fontWeight: 300,
                  fontSize: 54,
                  lineHeight: 1.25,
                  letterSpacing: 0.4,
                  color: C.butter,
                  opacity: said ? 1 : 0.62,
                  display: 'inline-block',
                  transform: `translateY(${(1 - bump) * 6 * (said ? 1 : 0)}px) scale(${active ? 1.04 : 1})`,
                  textShadow: '0 2px 6px rgba(30,18,26,0.55)',
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
