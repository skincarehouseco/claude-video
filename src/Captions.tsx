import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from './captions.json';
import {C, SAFE, SAFE_CX} from './theme';

type Word = {text: string; start: number; end: number};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// Lower-middle of the frame, fully inside TikTok's safe zone (bottom edge 1490px).
const CENTER_Y = 1395;
const WIDTH = 760;
const FONT_SIZE = 54; // "size 10": small, clean, readable

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.04 && t < c.end);
  if (!chunk) return null;

  const enter = spring({frame: frame - Math.round((chunk.start - 0.04) * fps), fps, config: {damping: 16, stiffness: 200, mass: 0.5}});
  const exit = interpolate((chunk.end - t) * fps, [0, 2], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE_CX - WIDTH / 2,
          width: WIDTH,
          top: CENTER_Y - 45,
          maxHeight: SAFE.bottom - (CENTER_Y - 45),
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 14,
          opacity: Math.min(enter, exit),
          transform: `translateY(${(1 - enter) * 14}px)`,
        }}
      >
        {chunk.words.map((w, i) => {
          const active = t >= w.start - 0.03 && t < w.end + 0.05;
          const said = t >= w.start - 0.03;
          const bump = active ? spring({frame: frame - Math.round((w.start - 0.03) * fps), fps, config: {damping: 10, stiffness: 260, mass: 0.4}}) : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: 'Cap',
                fontWeight: 500, // medium – deliberately not bold
                fontSize: FONT_SIZE,
                lineHeight: 1.2,
                color: C.butter,
                opacity: said ? 1 : 0.55,
                display: 'inline-block',
                transform: `translateY(${-bump * 4}px) scale(${1 + bump * 0.05})`,
                // thin soft outline + shadow keeps the light yellow readable on any background
                textShadow:
                  '0 0 2px rgba(60,40,30,0.9), 0 2px 3px rgba(60,40,30,0.75), 0 4px 14px rgba(30,20,20,0.55)',
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
