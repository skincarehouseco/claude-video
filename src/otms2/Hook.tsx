import React from 'react';
import {AbsoluteFill, Easing, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {CUT_SHELF, FPS, P, PHRASES, SAFE, SAFE_CX, SANS, sec, SERIF, Word} from './data';

/* Intro hook (0 – 3.47 s): the speaker's own question as a big, word-synced title,
   plus a teaser row of the four partner products that the video goes on to show. */

const c01 = (x: number) => Math.min(1, Math.max(0, x));
const sp = (f: number, at: number, damping = 12, stiffness = 200) => (f < sec(at) ? 0 : spring({frame: f - sec(at), fps: FPS, config: {damping, stiffness, mass: 0.6}}));
const leave = (f: number) => 1 - c01((f - sec(CUT_SHELF - 0.28)) / 7);

const MARK: Record<string, string> = {mix: P.butter, 'apa?': P.blush};

const TitleWord: React.FC<{w: Word; size: number}> = ({w, size}) => {
  const f = useCurrentFrame();
  if (f < sec(w.s)) return null; // appears only when spoken
  const k = sp(f, w.s, 10, 230);
  const mk = Easing.out(Easing.cubic)(c01((f - sec(w.s) - 2) / 8));
  const mark = MARK[w.t];
  return (
    <span style={{position: 'relative', display: 'inline-block', zIndex: 0, fontSize: size, transform: `translateY(${(1 - k) * 22}px) scale(${0.7 + 0.3 * k}) rotate(${(1 - k) * -6}deg)`, transformOrigin: '50% 85%', opacity: Math.min(1, k * 1.5)}}>
      {mark && <span style={{position: 'absolute', left: -10, right: -10, top: '40%', bottom: '6%', background: mark, borderRadius: '12px 18px 14px 20px', transform: `scaleX(${mk}) rotate(-1.5deg)`, transformOrigin: '0 50%', zIndex: -1}} />}
      {w.t}
    </span>
  );
};

export const HookTitle: React.FC = () => {
  const f = useCurrentFrame();
  if (f > sec(CUT_SHELF)) return null;
  const hook = PHRASES.find((p) => p.id === 'hook')!;
  const [l1, l2] = hook.lines;
  const card = sp(f, 0.0, 16, 160);
  const subK = sp(f, 1.45, 14);
  return (
    <div style={{position: 'absolute', top: SAFE.top - 10, left: SAFE_CX - 410, width: 820, display: 'flex', justifyContent: 'center', opacity: leave(f), transform: `translateY(${(1 - leave(f)) * -20}px)`}}>
      <div
        style={{
          background: 'rgba(255,250,243,0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: 44,
          padding: '18px 40px 22px',
          boxShadow: '0 16px 40px rgba(90,64,44,0.18), inset 0 0 0 2px rgba(255,255,255,0.8)',
          textAlign: 'center',
          transform: `scale(${0.9 + 0.1 * card}) rotate(${-1 + Math.sin(f / 30) * 0.6}deg)`,
          opacity: Math.min(1, card * 1.5),
          minWidth: 300,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'center', gap: 16, fontFamily: SANS, fontWeight: 600, color: P.cocoa, lineHeight: 1.15}}>
          {l1.map((w, i) => (
            <TitleWord key={i} w={w} size={i === 0 ? 70 : 62} />
          ))}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 18, fontFamily: SANS, fontWeight: 600, color: P.cocoa, lineHeight: 1.15, marginTop: 4}}>
          {l2.map((w, i) => (
            <TitleWord key={i} w={w} size={84} />
          ))}
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 30, color: P.cocoa, opacity: 0.75 * subK, marginTop: 6, transform: `translateY(${(1 - subK) * 8}px)`}}>
          Oatmeal Turmeric Mask &amp; Scrub
        </div>
      </div>
    </div>
  );
};

/* teaser: the four partner products (cropped from the shelf shots later in this video), each with a "?" */
const THUMBS = ['otms/thumbs/p1.png', 'otms/thumbs/p2.png', 'otms/thumbs/p3.png', 'otms/thumbs/p4.png'];
const TINT = [P.blush, P.butter, '#F2C9A8', P.sage];
export const HookTeaser: React.FC = () => {
  const f = useCurrentFrame();
  if (f < sec(0.8) || f > sec(CUT_SHELF)) return null;
  const out = leave(f);
  const size = 150;
  return (
    <div style={{position: 'absolute', top: SAFE.top + 330, left: SAFE_CX - 360, width: 720, display: 'flex', justifyContent: 'space-between', opacity: out}}>
      {THUMBS.map((src, i) => {
        const at = 0.82 + i * 0.12; // pops in on "mix dengan apa?"
        const k = sp(f, at, 10, 240);
        const q = sp(f, 1.22 + i * 0.05, 8, 260); // "?" on "apa?"
        const bobY = Math.sin((f + i * 9) / 11) * 5;
        return (
          <div key={i} style={{position: 'relative', width: size, height: size, transform: `translateY(${(1 - k) * 40 + bobY}px) scale(${k}) rotate(${(i % 2 ? 5 : -5) * k}deg)`}}>
            <div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: `6px solid ${P.warmWhite}`, boxShadow: `0 10px 22px rgba(90,64,44,0.25), 0 0 0 3px ${TINT[i]}`, background: P.cream}}>
              <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div style={{position: 'absolute', right: -8, top: -10, width: 46, height: 46, borderRadius: 23, background: P.cocoa, color: P.warmWhite, fontFamily: SANS, fontWeight: 600, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${q}) rotate(${Math.sin(f / 6 + i) * 10}deg)`, boxShadow: '0 4px 10px rgba(60,40,30,0.3)'}}>
              ?
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: -34, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: P.cocoa, opacity: k, textShadow: '0 0 8px rgba(255,250,243,1), 0 0 3px rgba(255,250,243,1)'}}>0{i + 1}</div>
          </div>
        );
      })}
    </div>
  );
};

/* little sparkle burst on "apa?" */
export const HookSpark: React.FC = () => {
  const f = useCurrentFrame();
  const k = f - sec(1.2);
  if (k < 0 || k > 16) return null;
  const u = k / 16;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 1 - u}}>
        {Array.from({length: 8}).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const d = 60 + u * 110;
          return <path key={i} transform={`translate(${720 + Math.cos(a) * d} ${330 + Math.sin(a) * d * 0.6}) scale(${1 - u * 0.5})`} d="M0 -14 C2 -4 4 -2 14 0 C4 2 2 4 0 14 C-2 4 -4 2 -14 0 C-4 -2 -2 -4 0 -14Z" fill={i % 2 ? P.butter : P.blush} stroke={P.cocoa} strokeWidth={1.5} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
