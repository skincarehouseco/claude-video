import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {FPS, P, Phrase, PHRASES, SAFE_CX, SANS, sec, Word} from './data';

/* Word-synced captions: a word is drawn only from the frame it is spoken; phrases leave shortly after
   the speaker finishes. Layout is reserved for the whole phrase so nothing jumps as words arrive. */

const POS = {low: 1255, shelf: 470}; // top of the caption block (px) — lower-middle on hand shots, clear wall on the shelf
const HL = {brand: P.blush, product: P.butter, benefit: P.sage};

const Highlight: React.FC<{w: Word; k: number}> = ({w, k}) => {
  if (!w.key) return null;
  const col = HL[w.key];
  if (w.key === 'benefit') {
    // hand-drawn squiggle underline
    return (
      <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{position: 'absolute', left: '-4%', bottom: -6, width: '108%', height: 14, overflow: 'visible'}}>
        <path d="M2 7 C14 2 22 11 34 6 C46 1 54 11 66 6 C78 1 86 10 98 5" fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
  // marker swash behind the word, swept left -> right
  return (
    <span
      style={{
        position: 'absolute',
        left: -8,
        right: -8,
        top: '38%',
        bottom: '4%',
        background: col,
        opacity: 0.75,
        borderRadius: '10px 16px 12px 18px',
        transform: `scaleX(${k}) rotate(-1.2deg)`,
        transformOrigin: '0% 50%',
        zIndex: -1,
      }}
    />
  );
};

const CapWord: React.FC<{w: Word}> = ({w}) => {
  const f = useCurrentFrame();
  const shown = f >= sec(w.s);
  if (!shown) return null; // not spoken yet: no space reserved, the pill grows word by word
  const sp = shown ? spring({frame: f - sec(w.s), fps: FPS, config: {damping: w.key ? 11 : 16, stiffness: 210, mass: 0.6}}) : 0;
  const hk = shown ? Easing.out(Easing.cubic)(Math.min(1, (f - sec(w.s) - 2) / 8)) : 0;
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        zIndex: 0,
        opacity: shown ? Math.min(1, sp * 1.6) : 0,
        transform: `translateY(${(1 - sp) * 12}px) scale(${0.86 + 0.14 * sp})`,
        transformOrigin: '50% 80%',
        color: w.t === '+' ? P.blushDeep : P.cocoa,
      }}
    >
      {shown && <Highlight w={w} k={Math.max(0, hk)} />}
      {w.t}
    </span>
  );
};

const PhraseView: React.FC<{p: Phrase}> = ({p}) => {
  const f = useCurrentFrame();
  if (f < sec(p.start) || f > sec(p.end)) return null;
  const inK = spring({frame: f - sec(p.start), fps: FPS, config: {damping: 18, stiffness: 160, mass: 0.7}});
  const out = interpolate(f, [sec(p.end) - 6, sec(p.end)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top: POS[p.place],
        left: SAFE_CX - 420,
        width: 840,
        display: 'flex',
        justifyContent: 'center',
        opacity: Math.min(inK * 1.4, out),
        transform: `translateY(${(1 - inK) * 16 - (1 - out) * 10}px)`,
      }}
    >
      <div
        style={{
          background: 'rgba(255,251,244,0.86)',
          backdropFilter: 'blur(6px)',
          borderRadius: 34,
          padding: '12px 34px 16px',
          boxShadow: '0 10px 28px rgba(110,84,60,0.16), inset 0 0 0 2px rgba(255,255,255,0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {p.lines.map((line, li) => (
          <div key={li} style={{display: 'flex', gap: 16, fontFamily: SANS, fontWeight: 600, fontSize: 58, lineHeight: 1.25, letterSpacing: 0.2, whiteSpace: 'nowrap'}}>
            {line.map((w, wi) => (
              <CapWord key={wi} w={w} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Captions: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {PHRASES.map((p) => (
      <PhraseView key={p.id} p={p} />
    ))}
  </AbsoluteFill>
);
