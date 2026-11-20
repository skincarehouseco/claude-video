import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CUT_SHELF, P, PHRASES, SANS, sec, SERIF, Word} from './data';
import {leave, sp} from './Hook';

/* Hook F — "editing-in-progress" look (from the user's reference): each line is its own colourful tag that gets
   dragged in by a mouse cursor with a blue selection box, little stickers pop around it, then a typewriter line.
   Words still only appear when spoken. */

const BLUE = '#4EA3F0';
const INK = '#2B2320';
type Line = {words: Word[]; x: number; y: number; style: React.CSSProperties; rot: number};

const hook = () => PHRASES.find((p) => p.id === 'hook')!.lines;
const jom = () => PHRASES.find((p) => p.id === 'jom')!.lines[0];

const Cursor: React.FC<{x: number; y: number; o: number; press: number}> = ({x, y, o, press}) => (
  <svg width={70} height={80} viewBox="0 0 70 80" style={{position: 'absolute', left: x, top: y, opacity: o, transform: `scale(${1 - press * 0.12})`, transformOrigin: '0 0', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))'}}>
    <path d="M6 4 L6 60 L20 47 L30 72 L41 67 L31 43 L50 43 Z" fill="#fff" stroke="#111" strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

const Selection: React.FC<{w: number; h: number; o: number}> = ({w, h, o}) => {
  const hs = 14;
  const pts = [
    [0, 0], [w / 2, 0], [w, 0],
    [0, h / 2], [w, h / 2],
    [0, h], [w / 2, h], [w, h],
  ];
  return (
    <svg width={w + 40} height={h + 40} style={{position: 'absolute', left: -20, top: -20, opacity: o, overflow: 'visible'}}>
      <rect x={20} y={20} width={w} height={h} fill="none" stroke={BLUE} strokeWidth={3} />
      {pts.map(([px, py], i) => (
        <rect key={i} x={20 + px - hs / 2} y={20 + py - hs / 2} width={hs} height={hs} fill="#fff" stroke={BLUE} strokeWidth={3} />
      ))}
      <circle cx={20 + w / 2} cy={-6} r={8} fill="#fff" stroke={BLUE} strokeWidth={3} />
    </svg>
  );
};

/** one dragged-in tag line */
const Tag: React.FC<{line: Line; w: number; h: number}> = ({line, w, h}) => {
  const f = useCurrentFrame();
  const at = line.words[0].s;
  if (f < sec(at)) return null;
  const k = f - sec(at);
  const drag = Easing.out(Easing.cubic)(Math.min(1, k / 9)); // dragged in over ~0.3 s
  const offX = (1 - drag) * 300;
  const selO = interpolate(k, [0, 2, 16, 22], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const curO = interpolate(k, [0, 2, 14, 20], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const curDrift = Easing.in(Easing.cubic)(Math.min(1, Math.max(0, (k - 12) / 10))) * 60;
  return (
    <div style={{position: 'absolute', left: line.x + offX, top: line.y, transform: `rotate(${line.rot}deg)`, transformOrigin: '0 50%'}}>
      <div style={{position: 'relative', display: 'inline-flex', gap: 14, whiteSpace: 'nowrap', ...line.style}}>
        <Selection w={w} h={h} o={selO} />
        {line.words.map((wd, i) => (f >= sec(wd.s) ? <span key={i}>{wd.t}</span> : null))}
      </div>
      <Cursor x={w * 0.55 + curDrift} y={h * 0.45 + curDrift * 0.3} o={curO} press={k < 9 ? 1 : 0} />
    </div>
  );
};

const DAISY: React.FC<{x: number; y: number; s: number; at: number}> = ({x, y, s, at}) => {
  const f = useCurrentFrame();
  const k = sp(f, at, 8, 260);
  if (k <= 0) return null;
  return (
    <svg width={80} height={80} viewBox="-40 -40 80 80" style={{position: 'absolute', left: x - 40, top: y - 40, transform: `scale(${s * k}) rotate(${f * 1.5})`}}>
      {Array.from({length: 8}).map((_, i) => (
        <ellipse key={i} cx={0} cy={-17} rx={8} ry={15} fill="#fff" stroke="#E6D9C4" strokeWidth={1.5} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={10} fill="#F6C343" />
    </svg>
  );
};
const Dot: React.FC<{x: number; y: number; r: number; c: string; at: number}> = ({x, y, r, c, at}) => {
  const f = useCurrentFrame();
  const k = sp(f, at, 8, 280);
  return <div style={{position: 'absolute', left: x - r, top: y - r + Math.sin(f / 9 + x) * 4, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle at 35% 35%, #fff 0%, ${c} 45%)`, transform: `scale(${k})`, boxShadow: '0 3px 6px rgba(0,0,0,0.2)'}} />;
};
const Star4: React.FC<{x: number; y: number; s: number; at: number; c: string}> = ({x, y, s, at, c}) => {
  const f = useCurrentFrame();
  const k = sp(f, at, 8, 260);
  return (
    <svg width={60} height={60} viewBox="-30 -30 60 60" style={{position: 'absolute', left: x - 30, top: y - 30, transform: `scale(${s * k * (0.85 + 0.15 * Math.sin(f / 5))}) rotate(${Math.sin(f / 12) * 15}deg)`}}>
      <path d="M0 -26 C3 -8 8 -3 26 0 C8 3 3 8 0 26 C-3 8 -8 3 -26 0 C-8 -3 -3 -8 0 -26Z" fill={c} stroke="#fff" strokeWidth={3} />
    </svg>
  );
};

/** typewriter line "Jom kita tengok!" with blinking caret (chars typed across each word's spoken duration) */
const TypeLine: React.FC = () => {
  const f = useCurrentFrame();
  const words = jom();
  if (f < sec(words[0].s)) return null;
  const t = f / 30;
  let text = '';
  words.forEach((w, i) => {
    if (t < w.s) return;
    const dur = Math.max(0.12, (words[i + 1]?.s ?? w.e) - w.s);
    const n = Math.min(w.t.length, Math.ceil(((t - w.s) / dur) * w.t.length));
    text += (i ? ' ' : '') + w.t.slice(0, n);
  });
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 140, top: 650, fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color: INK, whiteSpace: 'nowrap', background: 'rgba(255,253,248,0.92)', padding: '2px 18px 8px', borderRadius: 8, boxShadow: '0 6px 14px rgba(0,0,0,0.15)', transform: 'rotate(-2deg)'}}>
      {text}
      <span style={{display: 'inline-block', width: 4, height: 54, marginLeft: 4, background: INK, verticalAlign: '-8px', opacity: caret ? 1 : 0}} />
    </div>
  );
};

export const HookCanva: React.FC = () => {
  const f = useCurrentFrame();
  if (f > sec(CUT_SHELF)) return null;
  const [l1, l2] = hook();
  const lines: (Line & {w: number; h: number})[] = [
    {words: l1, x: 100, y: 280, rot: -3, w: 600, h: 104, style: {fontFamily: SANS, fontWeight: 600, fontSize: 78, color: INK, background: '#CFE6F7', padding: '2px 20px 6px', borderRadius: 6, boxShadow: '0 6px 14px rgba(0,0,0,0.15)'}},
    {words: l2.slice(0, 2), x: 225, y: 392, rot: -3, w: 520, h: 108, style: {fontFamily: SANS, fontWeight: 600, fontSize: 90, color: '#F26B3A', WebkitTextStroke: '7px #fff', paintOrder: 'stroke fill', filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.2))'}},
    {words: l2.slice(2), x: 370, y: 515, rot: -3, w: 245, h: 108, style: {fontFamily: SANS, fontWeight: 600, fontSize: 86, color: INK, background: '#FFE680', padding: '2px 22px 6px', borderRadius: 6, boxShadow: '0 6px 14px rgba(0,0,0,0.15)'}},
  ];
  return (
    <AbsoluteFill style={{opacity: leave(f), pointerEvents: 'none'}}>
      {lines.map((l, i) => (
        <Tag key={i} line={l} w={l.w} h={l.h} />
      ))}
      <DAISY x={735} y={282} s={1.15} at={0.5} />
      <Star4 x={95} y={430} s={1.1} at={0.9} c="#F6C343" />
      <Dot x={640} y={590} r={14} c="#3D5BD9" at={1.35} />
      <Dot x={250} y={610} r={11} c="#F08BB0" at={1.45} />
      <Star4 x={790} y={470} s={0.8} at={1.3} c="#F08BB0" />
      <TypeLine />
    </AbsoluteFill>
  );
};
