import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from './captions.json';
import {C, F, FPS, SAFE, SAFE_CX, sec} from './theme';

type Word = {text: string; start: number; end: number; emph: boolean};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// Lower-middle of the frame, well inside TikTok's safe zone (above the caption/UI band).
const CENTER_Y = 1335;
const WIDTH = 760;
// "Font size 10" on a phone editor ≈ a small, light caption; 54px on the 1080-wide canvas.
const SIZE = 54;

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / FPS;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.06 && t < c.end);
  if (!chunk) return null;

  const enter = spring({frame: frame - sec(chunk.start - 0.06), fps, config: {damping: 15, stiffness: 190, mass: 0.6}});
  const exit = interpolate((chunk.end - t) * FPS, [0, 3], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE_CX - WIDTH / 2,
          width: WIDTH,
          top: CENTER_Y - 50,
          maxHeight: SAFE.bottom - (CENTER_Y - 50),
          display: 'flex',
          justifyContent: 'center',
          opacity: Math.min(enter, exit),
          transform: `translateY(${(1 - enter) * 14}px) scale(${0.96 + enter * 0.04})`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'baseline',
            columnGap: 13,
            padding: '8px 28px 12px',
            borderRadius: 28,
            // soft frosted cocoa pill keeps butter yellow readable over the light shirt
            background: 'rgba(58,42,48,0.46)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 6px 20px rgba(30,20,26,0.22), inset 0 0 0 1.5px rgba(255,240,166,0.22)',
          }}
        >
          {chunk.words.map((w, i) => {
            const said = t >= w.start - 0.05;
            const active = said && t < w.end + 0.05;
            const bump = said ? spring({frame: frame - sec(w.start - 0.05), fps, config: {damping: 11, stiffness: 240, mass: 0.4}}) : 0;
            return (
              <span
                key={i}
                style={{
                  fontFamily: w.emph ? F.serifItalic : F.caption,
                  fontWeight: 500,
                  fontSize: w.emph ? SIZE * 1.18 : SIZE,
                  lineHeight: 1.25,
                  letterSpacing: w.emph ? 0.3 : 0.4,
                  color: C.butter,
                  opacity: said ? 1 : 0.55,
                  display: 'inline-block',
                  transform: `translateY(${(active ? -3 : 0) + (1 - bump) * 4}px)`,
                  textShadow: '0 2px 4px rgba(30,20,26,0.45)',
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
