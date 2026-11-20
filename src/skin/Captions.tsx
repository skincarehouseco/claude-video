import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from './captions.json';
import {C, captionFont, FPS, SAFE_CENTER_X, sec} from './theme';

type Word = {text: string; start: number; end: number};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// Lower-middle of the frame, inside TikTok's safe zone (bottom 430px kept clear)
const CAPTION_TOP = 1290;
const CAPTION_WIDTH = 760;
export const CAPTION_SIZE = 54; // small, clean "size 10" look from the style references

const SHADOW = '0 1px 0 rgba(60,45,40,0.55), 0 2px 3px rgba(40,28,30,0.55), 0 4px 16px rgba(30,20,25,0.5)';

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / FPS;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.05 && t < c.end);
  if (!chunk) return null;

  const local = frame - sec(chunk.start - 0.05);
  const enter = spring({frame: local, fps, config: {damping: 16, stiffness: 200, mass: 0.6}});
  const exit = interpolate(sec(chunk.end) - frame, [0, 3], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE_CENTER_X - CAPTION_WIDTH / 2,
          width: CAPTION_WIDTH,
          top: CAPTION_TOP,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 14,
          opacity: Math.min(enter, exit),
          transform: `translateY(${(1 - enter) * 14}px)`,
        }}
      >
        {chunk.words.map((w, i) => {
          const said = t >= w.start - 0.04;
          const active = said && t < w.end + 0.08;
          const bump = said ? spring({frame: frame - sec(w.start - 0.04), fps, config: {damping: 11, stiffness: 260, mass: 0.4}}) : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: captionFont,
                fontWeight: 400,
                fontSize: CAPTION_SIZE,
                lineHeight: 1.25,
                letterSpacing: 0.3,
                color: C.butter,
                opacity: said ? 1 : 0.55,
                display: 'inline-block',
                transform: `translateY(${(1 - bump) * 6 - (active ? 2 : 0)}px) scale(${active ? 1.04 : 1})`,
                textShadow: active ? `${SHADOW}, 0 0 18px rgba(255,241,168,0.45)` : SHADOW,
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
