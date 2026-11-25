import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';

export const SOFIA = 'Sofia';

/* ---------------------------------------------------------------- the ONE shared script (all five versions)
   Wording is built from the creator's own explanations in the Drive clips:
   clean skin first (1MTe), mix with plain / filtered water (1RYy), 10-15 min only — don't sleep in it (1H0r),
   big pimples: dab on the spot only and it can stay overnight (1HU1). */
export type Slot = {from: number; to: number; lines: string[]; kind?: 'hook' | 'step' | 'tip'};
export const SCRIPT: Slot[] = [
  {from: 0, to: 3.3, kind: 'hook', lines: ['ni step by step dia :down:']},
  {from: 3.3, to: 6.4, kind: 'step', lines: ['1. cuci muka dulu', 'pakai atas kulit yang bersih tau :sparkles:']},
  {from: 6.4, to: 9.5, kind: 'step', lines: ['2. campur OTMS dengan air', 'air filter lagi bagus :drop:']},
  {from: 9.5, to: 12.6, kind: 'step', lines: ['3. kacau sampai jadi paste,', 'sapu rata satu muka']},
  {from: 12.6, to: 15.9, kind: 'step', lines: ['4. biar 10-15 minit je', 'jangan bawa tidur! :clock:']},
  {from: 15.9, to: 18.8, kind: 'step', lines: ['5. bilas bersih dengan air', 'and done :heart:']},
  {from: 18.8, to: 22.5, kind: 'tip', lines: ['tips: ada jerawat besar?', 'dab dekat area jerawat je,', 'boleh pakai overnight :shh:']},
];
export const OTMS_DURATION = 22.5;
export const HOOK_QUESTION = 'Nk pakai OTMS as mask mcm mana urutannya?';

const EMOJI: Record<string, string> = {
  down: '1f447',
  sparkles: '2728',
  drop: '1f4a7',
  clock: '23f0',
  heart: '1f9e1',
  shh: '1f92b',
  plead: '1f97a',
};

/** renders text with :name: emoji tokens as inline Twemoji images */
export const Rich: React.FC<{text: string; size: number}> = ({text, size}) => (
  <>
    {text.split(/(:[a-z]+:)/).map((part, i) => {
      const m = part.match(/^:([a-z]+):$/);
      if (m && EMOJI[m[1]])
        return <Img key={i} src={staticFile(`emoji/${EMOJI[m[1]]}.svg`)} style={{width: size * 0.95, height: size * 0.95, verticalAlign: '-0.14em', marginLeft: 6, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.35))'}} />;
      return <React.Fragment key={i}>{part}</React.Fragment>;
    })}
  </>
);

/** TikTok-native look: white text, thin dark edge + soft shadow (like the reference's in-app text) */
export const nativeText = (size: number, weight = 800): React.CSSProperties => ({
  fontFamily: SOFIA,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 1.18,
  color: '#fff',
  textAlign: 'center',
  WebkitTextStroke: `${Math.max(3, size / 14)}px rgba(0,0,0,0.9)`,
  paintOrder: 'stroke fill',
  textShadow: '0 3px 8px rgba(0,0,0,0.5)',
  letterSpacing: 0.2,
});

/** TikTok "reply to comment" sticker (reference cover) */
export const ReplyBubble: React.FC<{scale?: number; style?: React.CSSProperties}> = ({scale = 1, style}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 22 * scale,
      padding: `${16 * scale}px ${22 * scale}px`,
      width: 600 * scale,
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
      fontFamily: SOFIA,
      ...style,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
      <div style={{width: 34 * scale, height: 34 * scale, borderRadius: '50%', background: 'linear-gradient(135deg,#F7B733,#FC8A2C)'}} />
      <div style={{fontSize: 24 * scale, color: '#8A8B91', fontWeight: 600}}>Reply to comment</div>
    </div>
    <div style={{fontSize: 34 * scale, color: '#161823', fontWeight: 800, marginTop: 8 * scale, lineHeight: 1.2}}>
      {HOOK_QUESTION} <Rich text=":plead:" size={34 * scale} />
    </div>
  </div>
);

export type TextLayout = {
  /** centre Y of the caption block */
  y: number;
  /** text size of the first line */
  size: number;
  /** entrance style */
  enter: 'pop' | 'rise' | 'type' | 'fade';
  /** where the reply sticker sits on the hook */
  bubble: {x: number; y: number; rotate: number};
  /** optional soft backdrop behind the text (for busy shots) */
  plate?: boolean;
};

export const OtmsText: React.FC<{layout: TextLayout}> = ({layout}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const slot = SCRIPT.find((s) => t >= s.from && t < s.to);
  if (!slot) return null;
  const lt = (t - slot.from) * FPS;
  const sp = spring({frame: lt, fps: FPS, config: {damping: 14, stiffness: 200, mass: 0.6}});
  const out = Math.min(1, Math.max(0, (slot.to - t) * FPS / 5)); // 5-frame fade out
  const enterStyle = (k: number): React.CSSProperties => {
    const s2 = spring({frame: lt - k * 4, fps: FPS, config: {damping: 15, stiffness: 210, mass: 0.6}});
    switch (layout.enter) {
      case 'rise':
        return {opacity: s2, transform: `translateY(${(1 - s2) * 30}px)`};
      case 'fade':
        return {opacity: Math.min(1, lt / 8 - k * 0.4)};
      case 'type':
        return {opacity: Math.min(1, Math.max(0, lt / 3 - k * 2))};
      default:
        return {opacity: Math.min(1, s2 * 2), transform: `scale(${0.85 + 0.15 * s2})`};
    }
  };
  return (
    <AbsoluteFill style={{opacity: out}}>
      {slot.kind === 'hook' && (
        <div
          style={{
            position: 'absolute',
            left: layout.bubble.x,
            top: layout.bubble.y,
            transform: `rotate(${layout.bubble.rotate}deg) scale(${0.9 + 0.1 * sp})`,
            opacity: sp,
            transformOrigin: 'left top',
          }}
        >
          <ReplyBubble scale={1.3} />
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: 70,
          width: 850,
          top: layout.y,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {layout.plate && <div style={{position: 'absolute', inset: '-24px -20px', background: 'rgba(0,0,0,0.18)', borderRadius: 30, filter: 'blur(14px)'}} />}
        {slot.lines.map((line, i) => (
          <div key={i} style={{...nativeText(i === 0 ? layout.size : layout.size * 0.82, i === 0 ? 800 : 700), position: 'relative', ...enterStyle(i)}}>
            <Rich text={line} size={i === 0 ? layout.size : layout.size * 0.82} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
