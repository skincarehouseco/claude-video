import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {DURATION_IN_FRAMES, f, W} from './timeline';
import {P, SAFE, TEXT_SHADOW} from './style';

/* ------------------------------------------------------------------------------------------------
 * Word-synced captions styled like the reference edit: every spoken word appears exactly when it is
 * said, mixing a small clean sans with handwritten script / elegant serif for the key words.
 * All caption text is soft butter yellow and regular weight (no bold fonts).
 * ---------------------------------------------------------------------------------------------- */
type Style = 'sans' | 'script' | 'serif' | 'serifIt' | 'pop';
type Line = [first: number, last: number, style: Style, size?: number];
type Phrase = {lines: Line[]; x: number; y: number; align?: 'left' | 'center'; rot?: number; until?: number};

const SIZE: Record<Style, number> = {sans: 52, script: 100, serif: 112, serifIt: 84, pop: 96};
const FAMILY: Record<Style, React.CSSProperties> = {
  sans: {fontFamily: 'PSans', fontWeight: 400, letterSpacing: 0.3},
  script: {fontFamily: 'PScript', fontWeight: 400},
  serif: {fontFamily: 'PSerif', fontWeight: 400, letterSpacing: -1},
  serifIt: {fontFamily: 'PSerifIt', fontWeight: 400, fontStyle: 'italic'},
  pop: {fontFamily: 'PRound', fontWeight: 400, letterSpacing: 1},
};
const LINE_H: Record<Style, number> = {sans: 1.15, script: 1.0, serif: 1.0, serifIt: 1.05, pop: 1.0};

const L = SAFE.left + 30; // left-aligned text column (x = 110)

// Positions were chosen per shot so text sits beside / below the face, never over the eyes,
// and always inside the TikTok safe zone.
export const PHRASES: Phrase[] = [
  {lines: [[0, 2, 'sans'], [3, 5, 'script', 78]], x: L, y: 1150, rot: -3},
  {lines: [[6, 9, 'sans'], [10, 11, 'script', 110]], x: L, y: 300, rot: -3},
  {lines: [[12, 12, 'sans'], [13, 15, 'script'], [16, 16, 'sans']], x: L, y: 300, rot: -3},
  {lines: [[17, 21, 'sans'], [22, 23, 'pop', 120]], x: L, y: 860},
  {lines: [[24, 25, 'sans'], [26, 26, 'script', 130], [27, 30, 'sans']], x: L, y: 1060, rot: -2},
  {lines: [[31, 33, 'script', 104], [34, 34, 'sans']], x: L, y: 1060, rot: -3},
  {lines: [[35, 36, 'sans'], [37, 38, 'pop', 92], [39, 42, 'script', 84]], x: L, y: 1030},
  {lines: [[43, 49, 'sans'], [50, 53, 'script', 96]], x: L, y: 1110, rot: -4},
  {lines: [[54, 59, 'sans'], [60, 60, 'serif', 130], [61, 63, 'sans'], [64, 66, 'serifIt', 82]], x: L, y: 1000},
  {lines: [[67, 71, 'sans'], [72, 73, 'script', 104]], x: L, y: 290, rot: -2},
  {lines: [[74, 76, 'script', 118]], x: L, y: 300, rot: -5},
  {lines: [[77, 80, 'sans'], [81, 81, 'script', 120], [82, 83, 'sans'], [84, 85, 'script', 96]], x: L, y: 880, rot: -3},
  {lines: [[86, 90, 'sans', 54]], x: L, y: 1060},
  {lines: [[91, 94, 'sans'], [95, 96, 'script', 120]], x: L, y: 1080, rot: -3},
  {lines: [[97, 99, 'sans'], [100, 101, 'script', 124]], x: L, y: 300, rot: -4},
  {lines: [[102, 106, 'sans'], [107, 108, 'script', 110]], x: L, y: 280, rot: -2},
  {lines: [[109, 111, 'pop', 116]], x: 495, y: 1040, align: 'center', rot: -4},
  {lines: [[112, 112, 'sans'], [113, 116, 'pop', 84]], x: L, y: 260},
  {lines: [[117, 119, 'sans'], [120, 120, 'script', 116]], x: L, y: 1100, rot: -3},
  {lines: [[121, 121, 'sans'], [122, 126, 'script', 100]], x: L, y: 980, rot: -4},
  {lines: [[127, 131, 'sans', 56]], x: 495, y: 250, align: 'center'},
  {lines: [[132, 135, 'sans'], [136, 137, 'sans'], [138, 138, 'script', 116]], x: 495, y: 1010, align: 'center', rot: -2, until: DURATION_IN_FRAMES},
];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const WordSpan: React.FC<{i: number; style: Style; size: number}> = ({i, style, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const w = W(i);
  const at = f(w.start) - 2; // appear a hair before the syllable lands
  const local = frame - at;
  if (local < 0) {
    // keep layout stable: reserve the space, invisible
    return <span style={{...FAMILY[style], fontSize: size, opacity: 0, display: 'inline-block'}}>{w.text}</span>;
  }
  const isScript = style === 'script' || style === 'serifIt';
  const sp = spring({frame: local, fps, config: {damping: style === 'pop' ? 8 : 13, stiffness: 200, mass: 0.5}});
  // handwritten words "write on" left->right across their spoken duration (min 8, max 16 frames)
  const writeDur = Math.max(8, Math.min(16, f(w.end - w.start) + 2));
  const wipe = isScript ? interpolate(local, [0, writeDur], [0, 110], {...clamp, easing: Easing.out(Easing.quad)}) : 110;
  const spoken = frame >= at && frame <= f(w.end) + 1;
  return (
    <span
      style={{
        ...FAMILY[style],
        fontSize: size,
        lineHeight: LINE_H[style],
        color: P.butter,
        display: 'inline-block',
        textShadow: TEXT_SHADOW,
        opacity: isScript ? 1 : Math.min(1, sp * 1.6),
        transform: isScript
          ? `translateY(${(1 - sp) * 6}px)`
          : `translateY(${(1 - sp) * 22}px) scale(${style === 'pop' ? 0.6 + sp * 0.4 + (spoken ? 0.03 : 0) : 0.9 + sp * 0.1})`,
        clipPath: isScript ? `inset(-30% ${110 - wipe}% -30% -10%)` : undefined,
        paddingRight: isScript ? 6 : 0,
        WebkitTextStroke: style === 'pop' ? `1.5px rgba(75,48,54,0.55)` : undefined,
      }}
    >
      {w.text}
    </span>
  );
};

const PhraseView: React.FC<{p: Phrase; until: number}> = ({p, until}) => {
  const frame = useCurrentFrame();
  const start = f(W(p.lines[0][0]).start) - 3;
  if (frame < start || frame >= until) return null;
  const out = interpolate(frame, [until - 6, until], [0, 1], clamp);
  const drift = Math.sin(frame / 18) * 3; // tiny idle float so text feels alive
  return (
    <div
      style={{
        position: 'absolute',
        left: p.align === 'center' ? p.x - 400 : p.x,
        top: p.y,
        width: p.align === 'center' ? 800 : SAFE.right - p.x,
        display: 'flex',
        flexDirection: 'column',
        alignItems: p.align === 'center' ? 'center' : 'flex-start',
        textAlign: p.align ?? 'left',
        transform: `translateY(${drift - out * 14}px) rotate(${p.rot ?? 0}deg)`,
        transformOrigin: 'left center',
        opacity: 1 - out,
        filter: out > 0 ? `blur(${out * 6}px)` : undefined,
        isolation: 'isolate',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-70px -90px -70px -110px',
          background: 'radial-gradient(ellipse at 45% 50%, rgba(48,22,32,0.3) 0%, rgba(48,22,32,0.17) 45%, rgba(48,22,32,0) 72%)',
          filter: 'blur(6px)',
          opacity: interpolate(frame, [start, start + 8], [0, 1], clamp),
          zIndex: -1,
        }}
      />
      {p.lines.map(([a, b, style, size], li) => (
        <div
          key={li}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: p.align === 'center' ? 'center' : 'flex-start',
            columnGap: style === 'sans' ? 13 : style === 'pop' ? 22 : 18,
            marginTop: li === 0 ? 0 : style === 'sans' ? 4 : -6,
            marginLeft: style === 'script' || style === 'serifIt' ? 22 : 0,
          }}
        >
          {Array.from({length: b - a + 1}).map((_, k) => (
            <WordSpan key={a + k} i={a + k} style={style} size={size ?? SIZE[style]} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const Captions: React.FC = () => (
  <>
    {PHRASES.map((p, k) => {
      const next = PHRASES[k + 1];
      const until = p.until ?? (next ? f(W(next.lines[0][0]).start) - 3 : DURATION_IN_FRAMES);
      // a phrase never lingers more than 0.9 s after its last word
      const last = f(W(p.lines[p.lines.length - 1][1]).end) + 27;
      return <PhraseView key={k} p={p} until={p.until ?? Math.min(until, last)} />;
    })}
  </>
);
