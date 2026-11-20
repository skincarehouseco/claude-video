import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CUT_SHELF, DISPLAY, P, PHRASES, ROUND, SAFE, SAFE_CX, SANS, sec, SERIF, Word} from './data';
import {c01, HookSpark, HookTitle, leave, sp} from './Hook';
import {HookCanva} from './HookCanva';

/* Five typographic treatments of the same spoken hook "OTMS ni boleh mix dengan apa?".
   Every word still appears only when it is spoken; only the font / layout / animation style changes. */

export type HookId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
const lines = () => PHRASES.find((p) => p.id === 'hook')!.lines;
const STAR = 'M0 -22 C3 -6 6 -3 22 0 C6 3 3 6 0 22 C-3 6 -6 3 -22 0 C-6 -3 -3 -6 0 -22Z';
const GLOW = '0 0 22px rgba(255,250,243,0.95), 0 0 8px rgba(255,250,243,0.95), 0 0 2px rgba(255,250,243,1)';
const shown = (f: number, w: Word) => f >= sec(w.s);
const Wrap: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = SAFE.top - 6}) => {
  const f = useCurrentFrame();
  if (f > sec(CUT_SHELF)) return null;
  return <div style={{position: 'absolute', top, left: SAFE_CX - 420, width: 840, textAlign: 'center', opacity: leave(f), transform: `translateY(${(1 - leave(f)) * -20}px)`}}>{children}</div>;
};

/* ---------- B: editorial — elegant serif italic + bold caps (magazine / "After Marriage" look) ---------- */
const HookEditorial: React.FC = () => {
  const f = useCurrentFrame();
  const [l1, l2] = lines();
  const ul = Easing.inOut(Easing.cubic)(c01((f - sec(1.4)) / 12));
  return (
    <Wrap>
      <div style={{position: 'absolute', inset: '-40px -20px', background: 'radial-gradient(ellipse at 50% 50%, rgba(255,250,243,0.85) 0%, rgba(255,250,243,0.55) 45%, rgba(255,250,243,0) 72%)'}} />
      <div style={{position: 'relative', display: 'flex', justifyContent: 'center', gap: 18}}>
        {l1.map((w, i) => {
          if (!shown(f, w)) return null;
          const k = Easing.out(Easing.cubic)(c01((f - sec(w.s)) / 9));
          return (
            <span key={i} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: P.cocoa, textShadow: GLOW, opacity: k, transform: `translateY(${(1 - k) * 24}px)`, display: 'inline-block'}}>
              {w.t}
            </span>
          );
        })}
      </div>
      <div style={{position: 'relative', display: 'flex', justifyContent: 'center', gap: 20, marginTop: -6}}>
        {l2.map((w, i) => {
          if (!shown(f, w)) return null;
          const k = sp(f, w.s, 14, 220);
          return (
            <span key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 98, letterSpacing: 2, textTransform: 'uppercase', color: w.t === 'apa?' ? P.blushDeep : P.cocoa, textShadow: GLOW, display: 'inline-block', transform: `translateY(${(1 - k) * -30}px) scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 1.5)}}>
              {w.t}
            </span>
          );
        })}
      </div>
      <svg width={760} height={30} style={{position: 'relative', display: 'block', margin: '0 auto'}}>
        <path d="M20 16 C200 6 420 24 600 12 C660 8 710 14 740 12" fill="none" stroke={P.cocoa} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ul} />
      </svg>
      <svg width={840} height={320} style={{position: 'absolute', left: 0, top: -30, pointerEvents: 'none'}}>
        {[
          [70, 60, 1.6, 0.5],
          [790, 40, 1.2, 0.8],
          [770, 250, 1.0, 1.3],
        ].map(([x, y, s, at], i) => (
          <path key={i} d={STAR} transform={`translate(${x} ${y}) scale(${s * sp(f, at, 9)}) rotate(${Math.sin(f / 14 + i) * 14})`} fill={i === 1 ? P.blush : '#fff'} stroke={P.cocoa} strokeWidth={1.6} />
        ))}
      </svg>
    </Wrap>
  );
};

/* ---------- C: bubbly — rounded letters, white outline, pastel fills, letter-by-letter bounce ---------- */
const BUBBLE_FILL = [P.blushDeep, '#E8A06A', '#86A877', '#9C8CD0', '#D98F88', '#C9A04A'];
const HookBubbly: React.FC = () => {
  const f = useCurrentFrame();
  const [l1, l2] = lines();
  const line = (ws: Word[], off: number, size: number) => (
    <div style={{display: 'flex', justifyContent: 'center', gap: size * 0.22}}>
      {ws.map((w, wi) => {
        if (!shown(f, w)) return null;
        return (
          <span key={wi} style={{display: 'inline-flex'}}>
            {w.t.split('').map((ch, ci) => {
              const at = w.s + ci * 0.025;
              const k = sp(f, at, 8, 280);
              const kk = f - sec(at);
              const st = kk > 0 ? 0.2 * Math.sin(kk * 0.8) * Math.exp(-kk * 0.15) : 0;
              return (
                <span
                  key={ci}
                  style={{
                    display: 'inline-block',
                    fontFamily: ROUND,
                    fontWeight: 600,
                    fontSize: size,
                    lineHeight: 1.05,
                    color: BUBBLE_FILL[(wi + off) % BUBBLE_FILL.length],
                    WebkitTextStroke: `${size * 0.1}px #fff`,
                    paintOrder: 'stroke fill',
                    filter: 'drop-shadow(0 6px 8px rgba(90,64,44,0.25))',
                    transform: `translateY(${(1 - k) * 40 + Math.sin((f - (ci + wi * 3) * 3) / 6) * 4}px) scale(${k * (1 + st)}, ${k * (1 - st)})`,
                    transformOrigin: '50% 90%',
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
  return (
    <Wrap>
      <div style={{transform: `rotate(-3deg)`}}>
        {line(l1, 0, 100)}
        {line(l2, 3, 118)}
      </div>
    </Wrap>
  );
};

/* ---------- D: highlight boxes — each word in its own box, the word being spoken lights up ---------- */
const HookBoxes: React.FC = () => {
  const f = useCurrentFrame();
  const [l1, l2] = lines();
  const all = [...l1, ...l2];
  const t = f / 30;
  const activeIdx = all.reduce((acc, w, i) => (t >= w.s ? i : acc), -1);
  const box = (w: Word, i: number, size: number) => {
    if (!shown(f, w)) return null;
    const k = sp(f, w.s, 11, 260);
    const active = i === activeIdx && t < 1.75;
    const isApa = w.t === 'apa?';
    const bg = active ? (isApa ? P.blush : P.butter) : isApa ? P.blush : 'rgba(255,250,243,0.95)';
    return (
      <span key={i} style={{display: 'inline-block', fontFamily: SANS, fontWeight: 600, fontSize: size, color: P.cocoa, background: bg, padding: '2px 18px 6px', borderRadius: 12, boxShadow: '0 8px 18px rgba(90,64,44,0.2)', transform: `scale(${(0.7 + 0.3 * k) * (active ? 1.06 : 1)}) rotate(${active ? -2 : 0}deg)`, opacity: Math.min(1, k * 1.6)}}>
        {w.t}
      </span>
    );
  };
  return (
    <Wrap>
      <div style={{display: 'flex', justifyContent: 'center', gap: 12}}>{l1.map((w, i) => box(w, i, 70))}</div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14}}>{l2.map((w, i) => box(w, i + l1.length, 82))}</div>
    </Wrap>
  );
};

/* ---------- E: kinetic — one big word at a time with a punch, then the full line settles in ---------- */
const KSTYLE: Record<string, React.CSSProperties> = {
  OTMS: {fontFamily: SANS, fontWeight: 600, fontSize: 200, letterSpacing: 4},
  ni: {fontFamily: SERIF, fontStyle: 'italic', fontSize: 200},
  boleh: {fontFamily: SANS, fontWeight: 600, fontSize: 170},
  mix: {fontFamily: DISPLAY, fontSize: 210},
  dengan: {fontFamily: SERIF, fontStyle: 'italic', fontSize: 170},
  'apa?': {fontFamily: ROUND, fontWeight: 600, fontSize: 210, color: P.blushDeep, WebkitTextStroke: '16px #fff', paintOrder: 'stroke fill'},
};
const HookKinetic: React.FC = () => {
  const f = useCurrentFrame();
  const [l1, l2] = lines();
  const all = [...l1, ...l2];
  const t = f / 30;
  const settleAt = 1.75;
  if (t < settleAt) {
    const i = all.reduce((acc, w, j) => (t >= w.s ? j : acc), -1);
    if (i < 0) return null;
    const w = all[i];
    const k = f - sec(w.s);
    const punch = interpolate(k, [0, 3, 8], [1.35, 0.96, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    return (
      <Wrap top={SAFE.top + 40}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260}}>
          <span style={{color: P.cocoa, textShadow: GLOW, display: 'inline-block', transform: `scale(${punch}) rotate(${(i % 2 ? 1 : -1) * 2}deg)`, ...KSTYLE[w.t]}}>{w.t}</span>
        </div>
      </Wrap>
    );
  }
  const k = sp(f, settleAt, 14, 200);
  return (
    <Wrap>
      <div style={{transform: `scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 1.5)}}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 16, color: P.cocoa, textShadow: GLOW}}>
          <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 80}}>OTMS</span>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 76}}>ni boleh</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 16, color: P.cocoa, textShadow: GLOW, marginTop: -4}}>
          <span style={{fontFamily: DISPLAY, fontSize: 96, background: P.butter, padding: '0 14px', borderRadius: 14, textShadow: 'none'}}>mix</span>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 80}}>dengan</span>
          <span style={{fontFamily: ROUND, fontWeight: 600, fontSize: 104, color: P.blushDeep, WebkitTextStroke: '9px #fff', paintOrder: 'stroke fill', textShadow: 'none'}}>apa?</span>
        </div>
      </div>
    </Wrap>
  );
};

/** where the spoken question is shown: always as the hook title in these variants */
export const HOOK_CAPTION_PLACE: Record<HookId, 'title' | 'low' | 'none'> = {A: 'title', B: 'title', C: 'title', D: 'title', E: 'title', F: 'title'};

export const HookLayer: React.FC<{id: HookId}> = ({id}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {id === 'A' && <HookTitle />}
    {id === 'B' && <HookEditorial />}
    {id === 'C' && <HookBubbly />}
    {id === 'D' && <HookBoxes />}
    {id === 'E' && <HookKinetic />}
    {id === 'F' && <HookCanva />}
    {id !== 'F' && <HookSpark />}
  </AbsoluteFill>
);
