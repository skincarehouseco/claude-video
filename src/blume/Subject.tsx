import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {frameAt} from './layout';
import {C, FPS} from './theme';

/** Cut-out speaker (per-frame RGBA PNGs from scripts/blume/make_subject.py) placed with the current framing. */
export const Subject: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const f = frameAt(t);
  const n = String(Math.min(frame + 1, 949)).padStart(4, '0');
  const card = f.ca;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {card > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: f.cx - 10,
            top: f.cy - 10,
            width: f.cw + 20,
            height: f.ch + 20,
            borderRadius: `${f.cr + 10}px ${f.cr + 10}px ${46 * card}px ${46 * card}px`,
            border: `3px solid ${C.rose}`,
            opacity: 0.55 * card,
            transform: 'translate(14px, 14px)',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: f.cx,
          top: f.cy,
          width: f.cw,
          height: f.ch,
          overflow: 'hidden',
          borderRadius: `${f.cr}px ${f.cr}px ${36 * card}px ${36 * card}px`,
          background: card > 0.01 ? `linear-gradient(180deg, rgba(255,249,243,${card}) 0%, rgba(246,201,213,${card}) 100%)` : 'transparent',
          boxShadow: card > 0.01 ? `0 0 0 ${10 * card}px rgba(255,255,255,${card}), 0 ${30 * card}px ${70 * card}px rgba(120,60,80,${0.28 * card})` : 'none',
        }}
      >
        {card > 0.01 && (
          // soft halo behind the head inside the card
          <div
            style={{
              position: 'absolute',
              left: f.cw / 2 - 170,
              top: f.ch * 0.36 - 200,
              width: 340,
              height: 340,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,255,255,${0.9 * card}) 0%, rgba(255,255,255,0) 70%)`,
            }}
          />
        )}
        <Img
          src={staticFile(`blume/subject/s_${n}.webp`)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            transformOrigin: '0 0',
            transform: `translate(${f.ix}px, ${f.iy}px) scale(${f.is})`,
            // natural, gentle clean-up only (no reshaping / smoothing)
            filter: `brightness(1.03) contrast(1.03) saturate(1.04) drop-shadow(0 ${24 * (1 - card)}px ${40 * (1 - card)}px rgba(110,50,75,${0.22 * (1 - card)}))`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
