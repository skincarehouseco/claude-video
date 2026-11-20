import React from 'react';
import {AbsoluteFill, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {CUT_SHELF, P, PHRASES, SAFE, SAFE_CX, SANS, sec, SERIF} from './data';
import {c01, HookSpark, HookTeaser, HookTitle, leave, sp, THUMBS, TINT, TitleWord} from './Hook';

/* Five alternative intro hooks (0 – 3.47 s). All use only the speaker's own words for the question;
   the extra on-screen facts come from the video itself (4 pairings, the 4 partner products, the jar label). */

export type HookId = 'A' | 'B' | 'C' | 'D' | 'E';
const hookWords = () => PHRASES.find((p) => p.id === 'hook')!.lines;
const HEART = 'M0 22 C-20 8 -32 -4 -28 -16 C-24 -30 -8 -30 0 -17 C8 -30 24 -30 28 -16 C32 -4 20 8 0 22Z';
const STAR = 'M0 -22 C3 -6 6 -3 22 0 C6 3 3 6 0 22 C-3 6 -6 3 -22 0 C-6 -3 -3 -6 0 -22Z';

/* ---------- B: "4 cara mix OTMS" — big serif 4 + numbered steps; question as the normal caption ---------- */
const HookFour: React.FC = () => {
  const f = useCurrentFrame();
  if (f > sec(CUT_SHELF)) return null;
  const k4 = sp(f, 0.03, 9, 220);
  const kt = sp(f, 0.25, 13);
  const words = hookWords().flat();
  return (
    <div style={{position: 'absolute', top: SAFE.top, left: SAFE.left, width: 810, opacity: leave(f), transform: `translateY(${(1 - leave(f)) * -20}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
        <div style={{position: 'relative', width: 220, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${k4}) rotate(${(1 - k4) * -25}deg)`}}>
          <svg width={230} height={230} style={{position: 'absolute'}} viewBox="-115 -115 230 230">
            <path d="M-80 -40 C-60 -110 70 -112 92 -30 C112 50 40 108 -30 96 C-100 84 -104 20 -80 -40Z" fill={P.butter} opacity={0.9} />
          </svg>
          <span style={{position: 'relative', fontFamily: SERIF, fontStyle: 'italic', fontSize: 250, lineHeight: 1, color: P.cocoa}}>4</span>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, color: P.cocoa, lineHeight: 1.05, opacity: kt, transform: `translateX(${(1 - kt) * 30}px)`, textShadow: '0 0 18px rgba(255,250,243,0.95), 0 0 4px rgba(255,250,243,1)'}}>
          <div style={{fontSize: 64}}>cara mix</div>
          <div style={{fontSize: 108, position: 'relative', display: 'inline-block', zIndex: 0}}>
            <span style={{position: 'absolute', left: -8, right: -8, top: '45%', bottom: '8%', background: P.blush, borderRadius: 14, transform: `scaleX(${Easing.out(Easing.cubic)(c01((f - sec(0.45)) / 8))})`, transformOrigin: '0 50%', zIndex: -1}} />
            OTMS
          </div>
        </div>
      </div>
      {/* 01..04 chips pop on the question words */}
      <div style={{display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18}}>
        {[0, 1, 2, 3].map((i) => {
          const k = sp(f, words[2 + i]?.s ?? 1.2, 9, 260);
          return (
            <div key={i} style={{width: 92, height: 56, borderRadius: 28, background: 'rgba(255,250,243,0.92)', boxShadow: `0 6px 16px rgba(90,64,44,0.2), inset 0 0 0 3px ${TINT[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: P.cocoa, transform: `scale(${k}) translateY(${Math.sin((f + i * 8) / 10) * 3}px)`}}>
              0{i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- C: sticky note with the question + hand-drawn arrow to the jar ---------- */
const HookNote: React.FC = () => {
  const f = useCurrentFrame();
  if (f > sec(CUT_SHELF)) return null;
  const [l1, l2] = hookWords();
  const k = sp(f, 0.0, 12, 170);
  const arrowK = Easing.inOut(Easing.cubic)(c01((f - sec(1.35)) / 12));
  const ul = Easing.out(Easing.cubic)(c01((f - sec(1.3)) / 9));
  return (
    <AbsoluteFill style={{opacity: leave(f)}}>
      <div style={{position: 'absolute', top: SAFE.top - 6, left: SAFE_CX - 330, width: 660, transform: `translateY(${(1 - k) * -60}px) rotate(${-3 + (1 - k) * -8}deg)`, opacity: Math.min(1, k * 1.5)}}>
        <div style={{background: '#FBEBB5', borderRadius: 10, padding: '34px 36px 30px', boxShadow: '0 18px 30px rgba(90,64,44,0.25), inset 0 -10px 18px rgba(200,160,80,0.12)', textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 14, fontFamily: SANS, fontWeight: 600, color: P.cocoa, lineHeight: 1.15}}>
            {l1.map((w, i) => (
              <TitleWord key={i} w={w} size={62} />
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'center', gap: 16, fontFamily: SANS, fontWeight: 600, color: P.cocoa, lineHeight: 1.15, marginTop: 2}}>
            {l2.map((w, i) => (
              <TitleWord key={i} w={w} size={78} />
            ))}
          </div>
          <svg width={560} height={22} style={{display: 'block', margin: '4px auto 0'}}>
            <path d="M10 12 C120 4 240 18 360 9 C440 4 500 14 550 8" fill="none" stroke={P.blushDeep} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ul} />
          </svg>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 28, color: P.cocoa, opacity: 0.75 * sp(f, 1.45, 14)}}>Oatmeal Turmeric Mask &amp; Scrub</div>
        </div>
        {/* washi tape */}
        <div style={{position: 'absolute', top: -18, left: '50%', width: 150, height: 38, marginLeft: -75, background: 'rgba(233,183,177,0.8)', transform: 'rotate(4deg)', borderRadius: 3}} />
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M770 560 C850 600 860 690 790 740" fill="none" stroke={P.cocoa} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - arrowK} />
        <path d="M812 724 L788 744 L782 712" fill="none" stroke={P.cocoa} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={arrowK > 0.95 ? 1 : 0} />
        {[
          [230, 600, 1.2, 1.5],
          [880, 520, 0.9, 1.7],
        ].map(([x, y, s, at], i) => (
          <path key={i} d={STAR} transform={`translate(${x} ${y}) scale(${s * sp(f, at, 9)}) rotate(${Math.sin(f / 15 + i) * 12})`} fill={i ? P.blush : P.butter} stroke={P.cocoa} strokeWidth={2} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- D: polaroid cards of the four partner products fanned around the jar ---------- */
const POLA = [
  {x: 70, y: 700, r: -9},
  {x: 110, y: 1010, r: 6},
  {x: 740, y: 690, r: 8},
  {x: 710, y: 1000, r: -6},
];
const HookPolaroids: React.FC = () => {
  const f = useCurrentFrame();
  if (f < sec(0.8) || f > sec(CUT_SHELF)) return null;
  const words = hookWords().flat();
  return (
    <AbsoluteFill style={{opacity: leave(f)}}>
      {POLA.map((p, i) => {
        const at = words[2 + i]?.s ?? 1.2;
        const k = sp(f, at, 10, 220);
        const q = sp(f, 1.25 + i * 0.05, 8, 260);
        return (
          <div key={i} style={{position: 'absolute', left: p.x, top: p.y, width: 190, background: P.warmWhite, padding: '12px 12px 0', borderRadius: 6, boxShadow: '0 14px 26px rgba(90,64,44,0.28)', transform: `translateY(${(1 - k) * 60 + Math.sin((f + i * 12) / 13) * 5}px) rotate(${p.r * k}deg) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.6)}}>
            <div style={{width: 166, height: 166, overflow: 'hidden', borderRadius: 3, background: P.cream}}>
              <Img src={staticFile(THUMBS[i])} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div style={{height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px'}}>
              <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: P.cocoa}}>mix 0{i + 1}</span>
              <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: P.blushDeep, display: 'inline-block', transform: `scale(${q})`}}>?</span>
            </div>
            <div style={{position: 'absolute', top: -12, left: 60, width: 70, height: 24, background: `${TINT[i]}`, opacity: 0.85, transform: 'rotate(-4deg)'}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- E: quiz equation OTMS + [shuffling products] = heart ---------- */
const HookQuiz: React.FC = () => {
  const f = useCurrentFrame();
  if (f < sec(0.8) || f > sec(CUT_SHELF)) return null;
  const k = sp(f, 0.82, 11, 220);
  const t = f / 30;
  const shuffling = t < 1.2;
  const idx = Math.floor((f - sec(0.82)) / 3) % 4;
  const land = sp(f, 1.2, 8, 260);
  const heartK = sp(f, 1.45, 8, 240);
  const size = 170;
  return (
    <div style={{position: 'absolute', top: SAFE.top + 330, left: SAFE.left, width: 810, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: leave(f) * Math.min(1, k * 1.5), transform: `scale(${0.8 + 0.2 * k})`}}>
      <div style={{background: P.blush, color: P.cocoa, fontFamily: SANS, fontWeight: 600, fontSize: 52, padding: '10px 24px 12px', borderRadius: 30, boxShadow: '0 8px 18px rgba(90,64,44,0.2)'}}>OTMS</div>
      <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 64, color: P.cocoa, textShadow: '0 0 12px rgba(255,250,243,1)'}}>+</span>
      <div style={{position: 'relative', width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: `7px solid ${P.warmWhite}`, boxShadow: `0 12px 26px rgba(90,64,44,0.28), 0 0 0 4px ${P.butter}`, background: shuffling ? P.cream : P.butter}}>
        {shuffling && <Img src={staticFile(THUMBS[idx])} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(1.5px)', transform: `translateY(${((f % 3) - 1) * 10}px)`}} />}
        {!shuffling && (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 110, color: P.cocoa, transform: `scale(${land})`}}>?</div>
        )}
      </div>
      <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 64, color: P.cocoa, textShadow: '0 0 12px rgba(255,250,243,1)'}}>=</span>
      <svg width={110} height={110} viewBox="-55 -55 110 110" style={{transform: `scale(${heartK}) rotate(${Math.sin(f / 8) * 8}deg)`}}>
        <path d={HEART} transform="scale(1.6)" fill={P.blush} stroke={P.cocoa} strokeWidth={2} />
      </svg>
    </div>
  );
};

/** which hook layers to draw, and where the spoken question goes */
export const HOOK_CAPTION_PLACE: Record<HookId, 'title' | 'low' | 'none'> = {A: 'title', B: 'low', C: 'none', D: 'title', E: 'title'};

export const HookLayer: React.FC<{id: HookId}> = ({id}) => {
  if (id === 'A')
    return (
      <>
        <HookTeaser />
        <HookTitle />
        <HookSpark />
      </>
    );
  if (id === 'B') return <HookFour />;
  if (id === 'C') return <HookNote />;
  if (id === 'D')
    return (
      <>
        <HookPolaroids />
        <HookTitle />
        <HookSpark />
      </>
    );
  return (
    <>
      <HookQuiz />
      <HookTitle />
    </>
  );
};
