import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from './captions.json';
import {C, captionFont, clamp, easeIO, SAFE, SAFE_CX, sec, serifFont} from './theme';

type Word = {text: string; start: number; end: number; accent: boolean};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// Caption block centred on the chest, well inside TikTok's safe zone (bottom edge 1490).
const CAPTION_Y = 1340;
const CAPTION_W = 780;
export const CAPTION_SIZE = 52; // small & clean, like the reference edits

// gentle dark halo so light butter yellow stays readable on the cream top / wall without a box
const shadow =
  '0 0 2px rgba(45,28,28,0.85), 0 1px 3px rgba(45,28,28,0.75), 0 2px 8px rgba(45,28,28,0.55), 0 0 22px rgba(45,28,28,0.35)';

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.08 && t < c.end);
  if (!chunk) return null;

  const local = frame - sec(chunk.start - 0.08);
  const enter = spring({frame: local, fps, config: {damping: 18, stiffness: 160, mass: 0.7}});
  const exit = interpolate(sec(chunk.end) - frame, [0, 4], [0, 1], clamp);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE_CX - CAPTION_W / 2,
          width: CAPTION_W,
          top: CAPTION_Y - 50,
          maxHeight: SAFE.bottom - (CAPTION_Y - 50),
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          columnGap: 13,
          opacity: exit,
          transform: `translateY(${(1 - enter) * 10 + (1 - exit) * -6}px)`,
        }}
      >
        {chunk.words.map((w, i) => {
          // each word floats in softly right as it is spoken
          const wf = frame - sec(w.start - 0.1);
          const p = interpolate(wf, [0, 5], [0, 1], {...clamp, easing: easeIO});
          const active = t >= w.start - 0.05 && t < w.end + 0.05;
          const bump = active ? spring({frame: wf, fps, config: {damping: 12, stiffness: 220, mass: 0.5}}) : 0;
          // highlight lifts while spoken, then eases back down (no snapping)
          const sinceEnd = frame - sec(w.end + 0.05);
          const settle = active ? bump : sinceEnd >= 0 ? interpolate(sinceEnd, [0, 6], [1, 0], {...clamp, easing: easeIO}) : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: w.accent ? serifFont : captionFont,
                fontStyle: w.accent ? 'italic' : 'normal',
                fontWeight: w.accent ? 400 : 500,
                fontSize: w.accent ? CAPTION_SIZE * 1.12 : CAPTION_SIZE,
                lineHeight: 1.25,
                letterSpacing: w.accent ? 0.3 : 0.6,
                textTransform: 'lowercase',
                color: C.butter,
                textShadow: shadow,
                display: 'inline-block',
                opacity: p,
                filter: p < 1 ? `blur(${((1 - p) * 4).toFixed(2)}px)` : undefined,
                transform: `translateY(${(1 - p) * 12 - settle * 3}px) scale(${1 + settle * 0.05})`,
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
