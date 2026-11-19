import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from './captions.json';
import {C, captionFont, SAFE, SAFE_CENTER_X} from './theme';

type Word = {text: string; start: number; end: number};
type Chunk = {start: number; end: number; words: Word[]};
const CHUNKS = captions as Chunk[];

// Caption box sits on the lower-middle of the frame, inside TikTok's safe zone.
const CAPTION_CENTER_Y = 1330;
const CAPTION_WIDTH = 820;

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.05 && t < c.end);
  if (!chunk) return null;

  const local = frame - Math.round((chunk.start - 0.05) * fps);
  const enter = spring({frame: local, fps, config: {damping: 14, stiffness: 180, mass: 0.6}});
  const outFrames = Math.round((chunk.end - t) * fps);
  const exit = interpolate(outFrames, [0, 3], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE_CENTER_X - CAPTION_WIDTH / 2,
          width: CAPTION_WIDTH,
          top: CAPTION_CENTER_Y - 60,
          minHeight: 120,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: 16,
          rowGap: 0,
          opacity: Math.min(enter, exit),
          transform: `translateY(${(1 - enter) * 18}px) scale(${0.94 + enter * 0.06})`,
          maxHeight: SAFE.bottom - (CAPTION_CENTER_Y - 60),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 16,
            padding: '6px 30px 12px',
            borderRadius: 30,
            // soft frosted cocoa pill so the light butter yellow stays readable on bright clothing
            background: 'rgba(72,50,56,0.52)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 6px 22px rgba(40,25,30,0.25), inset 0 0 0 2px rgba(255,240,166,0.18)',
          }}
        >
        {chunk.words.map((w, i) => {
          const active = t >= w.start - 0.04 && t < w.end + 0.06;
          const said = t >= w.start - 0.04;
          const wf = frame - Math.round((w.start - 0.04) * fps);
          const bump = active ? spring({frame: wf, fps, config: {damping: 10, stiffness: 260, mass: 0.4}}) : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: captionFont,
                fontWeight: 400,
                fontSize: 70,
                lineHeight: 1.15,
                letterSpacing: 0.5,
                color: active ? C.cream : C.butter,
                opacity: said ? 1 : 0.82,
                display: 'inline-block',
                transform: `translateY(${-bump * 4}px) scale(${1 + bump * 0.06})`,
                // soft cocoa shadow keeps the light yellow readable without looking bold
                textShadow:
                  '0 2px 0 rgba(91,70,54,0.85), 0 -1px 0 rgba(91,70,54,0.5), 1px 0 0 rgba(91,70,54,0.5), -1px 0 0 rgba(91,70,54,0.5), 0 4px 14px rgba(40,25,30,0.55)',
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
