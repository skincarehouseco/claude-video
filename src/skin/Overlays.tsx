import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {Bubbles, Calendar, Check, FaceGlow, FaceSpots, GelTube, HeavyCream, Star, SunMoon, Sunscreen} from './Art';
import {SECTION_CUTS} from './camera';
import {bob, C, captionFont, clamp01, displayFont, emojiFont, exitAt, FPS, italicFont, pop, SAFE, SAFE_CENTER_X, sec} from './theme';

/* All graphics live in the top band of the safe zone (y 160-560), above the speaker's head,
   except small emoji stickers beside the head and the follow card on the chest at the end. */

const TITLE_SHADOW = '0 2px 0 rgba(74,58,78,0.35), 0 6px 18px rgba(40,25,35,0.45)';

/** text revealed character by character (soft slide-up), like the reference titles */
const Typed: React.FC<{text: string; at: number; frame: number; cps?: number; style?: React.CSSProperties}> = ({text, at, frame, cps = 34, style}) => (
  <span style={{whiteSpace: 'pre', ...style}}>
    {text.split('').map((ch, i) => {
      const k = clamp01((frame - sec(at) - (i * FPS) / cps) / 5);
      return (
        <span key={i} style={{display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 14}px)`}}>
          {ch}
        </span>
      );
    })}
  </span>
);

const Show: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const f = useCurrentFrame();
  if (f < sec(from) || f > sec(to)) return null;
  return <>{children}</>;
};

/* ---------------- section header + tag ---------------- */
const Header: React.FC<{num: number; title: string; at: number; titleAt: number; end: number}> = ({num, title, at, titleAt, end}) => {
  const f = useCurrentFrame();
  const p = pop(f, at);
  const out = exitAt(f, end - 0.25, 0.25);
  return (
    <div
      style={{
        position: 'absolute',
        top: 168,
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        textAlign: 'center',
        color: '#fff',
        fontFamily: displayFont,
        fontSize: 66,
        lineHeight: 1.1,
        textShadow: TITLE_SHADOW,
        opacity: out,
        transform: `translateY(${(1 - out) * -16}px)`,
      }}
    >
      <span style={{display: 'inline-block', fontFamily: italicFont, fontStyle: 'italic', fontSize: 74, marginRight: 14, transform: `scale(${p}) rotate(${(1 - p) * -30}deg)`}}>{num}.</span>
      <Typed text={title} at={titleAt} frame={f} />
    </div>
  );
};

const Tag: React.FC<{text: string; at: number; end: number}> = ({text, at, end}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, FPS, 220, 11);
  const out = exitAt(f, end - 0.25, 0.25);
  return (
    <div style={{position: 'absolute', top: 254, left: SAFE_CENTER_X - 300, width: 600, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p) * out}}>
      <div
        style={{
          background: C.coral,
          color: '#fff',
          fontFamily: captionFont,
          fontWeight: 500,
          fontSize: 30,
          letterSpacing: 4,
          padding: '6px 22px 7px',
          borderRadius: 12,
          boxShadow: '0 5px 14px rgba(120,40,60,0.28), inset 0 -3px 0 rgba(0,0,0,0.08)',
          transform: `scale(${0.6 + 0.4 * p}) rotate(${-2 + Math.sin(f / 18) * 0.8}deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------------- comparison cards ---------------- */
const CARD = 184;
const CARD_TOP = 322;
const cardX = (side: 'L' | 'R') => (side === 'L' ? SAFE_CENTER_X - 52 - CARD : SAFE_CENTER_X + 52);

const Card: React.FC<{
  side: 'L' | 'R';
  at: number;
  end: number;
  good: boolean | null;
  label: string;
  sub?: string;
  subAt?: number;
  art: (t: number) => React.ReactNode;
}> = ({side, at, end, good, label, sub, subAt = 0, art}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, FPS, 160, 11);
  const out = exitAt(f, end - 0.25, 0.25);
  const tilt = side === 'L' ? -4 : 4;
  const t = f - sec(at);
  const subK = sub ? clamp01((f - sec(subAt)) / 8) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: cardX(side),
        top: CARD_TOP,
        width: CARD,
        opacity: Math.min(1, p * 1.4) * out,
        transform: `translateY(${(1 - p) * 40 + bob(f, 4, 80, side === 'L' ? 0 : 40)}px) scale(${(0.5 + 0.5 * p) * (0.85 + 0.15 * out)}) rotate(${tilt * p}deg)`,
        transformOrigin: '50% 100%',
      }}
    >
      <div style={{width: CARD, height: CARD, borderRadius: 26, background: '#fff', padding: 7, boxSizing: 'border-box', boxShadow: '0 10px 24px rgba(40,25,35,0.28)'}}>
        {art(t)}
      </div>
      {/* washi tape */}
      <div style={{position: 'absolute', top: -12, left: CARD / 2 - 34, width: 68, height: 22, background: good === false ? 'rgba(247,183,198,0.85)' : 'rgba(255,241,168,0.9)', transform: `rotate(${-tilt * 1.5}deg)`, borderRadius: 3}} />
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, width: 300, marginLeft: (CARD - 300) / 2}}>
        {good !== null && <div style={{flexShrink: 0, display: 'flex'}}><Check good={good} size={34} /></div>}
        <span style={{fontFamily: captionFont, fontWeight: 400, fontSize: 31, color: '#fff', textShadow: '0 2px 8px rgba(30,20,30,0.7)', whiteSpace: 'nowrap'}}>{label}</span>
      </div>
      {sub && (
        <div style={{width: 300, marginLeft: (CARD - 300) / 2, textAlign: 'center', fontFamily: italicFont, fontStyle: 'italic', fontSize: 30, color: C.butter, textShadow: '0 2px 8px rgba(30,20,30,0.7)', opacity: subK, transform: `translateY(${(1 - subK) * 10}px)`}}>
          {sub}
        </div>
      )}
    </div>
  );
};

/** dashed divider drawn top-down between the two cards */
const Divider: React.FC<{at: number; end: number}> = ({at, end}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [sec(at), sec(at) + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const out = exitAt(f, end - 0.25, 0.25);
  return (
    <svg style={{position: 'absolute', left: SAFE_CENTER_X - 4, top: CARD_TOP - 6, opacity: out}} width={8} height={CARD + 12}>
      <line x1={4} y1={4} x2={4} y2={4 + (CARD + 4) * k} stroke="#fff" strokeWidth={5} strokeDasharray="14 11" strokeLinecap="round" />
    </svg>
  );
};

/* ---------------- emoji sticker ---------------- */
const Sticker: React.FC<{e: string; at: number; dur: number; x: number; y: number; size?: number; rot?: number}> = ({e, at, dur, x, y, size = 86, rot = 0}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(at + dur)) return null;
  const p = pop(f, at, FPS, 240, 9);
  const out = exitAt(f, at + dur - 0.25, 0.25);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        fontSize: size,
        lineHeight: 1,
        fontFamily: emojiFont,
        transform: `scale(${p * out}) rotate(${rot + Math.sin(f / 9) * 6}deg) translateY(${bob(f, 5, 50)}px)`,
        filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))',
      }}
    >
      {e}
    </div>
  );
};

/* ---------------- hook: pakai vs faham ---------------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const shake = f > sec(2.74) && f < sec(3.8) ? Math.sin(f / 2.2) * 2.5 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `rotate(${shake * 0.3}deg)`}}>
      <Card side="L" at={0.35} end={3.85} good={null} label="pakai skincare" art={(t) => <FaceSpots t={t} />} />
      <Divider at={1.2} end={3.85} />
      <Card side="R" at={1.42} end={3.85} good={null} label="faham skincare" art={(t) => <FaceGlow t={t} />} />
    </div>
  );
};

const WhyDifferent: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 3.9);
  const out = exitAt(f, 5.85, 0.25);
  return (
    <div style={{position: 'absolute', top: 200, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center', opacity: out}}>
      <div style={{fontFamily: italicFont, fontStyle: 'italic', fontSize: 64, color: '#fff', textShadow: TITLE_SHADOW, transform: `scale(${0.7 + 0.3 * p})`}}>
        <Typed text="why so " at={3.9} frame={f} cps={26} />
      </div>
      <div style={{fontFamily: displayFont, fontSize: 104, lineHeight: 1, color: C.butter, textShadow: TITLE_SHADOW, transform: `scale(${0.7 + 0.3 * pop(f, 4.98)})`, opacity: clamp01((f - sec(4.98)) / 5)}}>
        different?
      </div>
      {[0, 1, 2].map((i) => {
        const k = pop(f, 5.3 + i * 0.12, FPS, 260, 8);
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: 30 + i * 40,
              left: [40, 700, 120][i],
              fontFamily: displayFont,
              fontSize: [70, 58, 46][i],
              color: [C.rose, C.lavender, C.butter][i],
              textShadow: TITLE_SHADOW,
              transform: `scale(${k}) rotate(${[-14, 12, 8][i] + Math.sin((f + i * 10) / 6) * 8}deg)`,
            }}
          >
            ?
          </span>
        );
      })}
    </div>
  );
};

const FourThings: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 6.75, FPS, 150, 10);
  const out = exitAt(f, 8.95, 0.25);
  return (
    <div style={{position: 'absolute', top: 172, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center', color: '#fff', textShadow: TITLE_SHADOW, opacity: out}}>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 18}}>
        <span style={{fontFamily: italicFont, fontStyle: 'italic', fontSize: 150, lineHeight: 1, color: C.butter, display: 'inline-block', transform: `scale(${p}) rotate(${(1 - p) * 40}deg)`}}>4</span>
        <span style={{fontFamily: displayFont, fontSize: 92, lineHeight: 1}}>
          <Typed text="perkara" at={7.3} frame={f} cps={22} />
        </span>
      </div>
      <div style={{fontFamily: italicFont, fontStyle: 'italic', fontSize: 46, marginTop: 6}}>
        <Typed text="yang korang kena tahu" at={7.7} frame={f} cps={30} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: -10}} width={SAFE.right - SAFE.left} height={260}>
        {f > sec(6.8) && (
          <>
            <Star x={120} y={40} s={2.2} t={f} color={C.butter} />
            <Star x={700} y={70} s={1.6} t={f} phase={25} />
            <Star x={660} y={210} s={1.2} t={f} color={C.rose} phase={50} />
            <Star x={160} y={200} s={1.3} t={f} phase={70} />
          </>
        )}
      </svg>
      {/* four little progress dots */}
      <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14}}>
        {[0, 1, 2, 3].map((i) => {
          const k = pop(f, 8.0 + i * 0.12, FPS, 260, 10);
          return <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: [C.rose, C.butter, C.mint, C.lavender][i], transform: `scale(${k})`, boxShadow: '0 2px 6px rgba(0,0,0,0.25)'}} />;
        })}
      </div>
    </div>
  );
};

/* ---------------- the four points ---------------- */
type Section = {
  num: number;
  title: string;
  at: number;
  titleAt: number;
  end: number;
  tag: string;
  tagAt: number;
  L: {at: number; label: string; art: (t: number) => React.ReactNode};
  R: {at: number; label: string; sub?: string; subAt?: number; art: (t: number) => React.ReactNode};
};
export const SECTIONS: Section[] = [
  {
    num: 1, title: 'Kulit Berjerawat', at: 9.05, titleAt: 9.7, end: 16.3, tag: 'EXFOLIATE', tagAt: 12.45,
    L: {at: 13.4, label: 'setiap hari', art: (t) => <Calendar t={t} n={7} good={false} />},
    R: {at: 14.82, label: '2x seminggu', art: (t) => <Calendar t={t} n={2} good />},
  },
  {
    num: 2, title: 'Kulit Kering', at: 16.42, titleAt: 17.34, end: 24.78, tag: 'CUCI MUKA', tagAt: 20.36,
    L: {at: 21.16, label: 'terlalu kerap', art: (t) => <Bubbles t={t} many />},
    R: {at: 22.56, label: '2x sehari', art: (t) => <SunMoon t={t} />},
  },
  {
    num: 3, title: 'Kulit Berminyak', at: 24.9, titleAt: 25.72, end: 33.1, tag: 'MOISTURIZER', tagAt: 29.06,
    L: {at: 31.16, label: 'tekstur berat', art: (t) => <HeavyCream t={t} />},
    R: {at: 29.72, label: 'gel', sub: 'lebih ringan', subAt: 32.0, art: (t) => <GelTube t={t} />},
  },
  {
    num: 4, title: 'Kulit Kusam', at: 33.25, titleAt: 34.44, end: 39.78, tag: 'SUNSCREEN', tagAt: 36.62,
    L: {at: 36.78, label: 'skip', art: (t) => <Sunscreen t={t} good={false} />},
    R: {at: 38.5, label: 'cukup banyak', art: (t) => <Sunscreen t={t} good />},
  },
];

const SectionView: React.FC<{s: Section}> = ({s}) => (
  <Show from={s.at} to={s.end}>
    <Header num={s.num} title={s.title} at={s.at} titleAt={s.titleAt} end={s.end} />
    <Tag text={s.tag} at={s.tagAt} end={s.end} />
    <Card side="L" at={s.L.at} end={s.end} good={false} label={s.L.label} art={s.L.art} />
    <Divider at={Math.min(s.L.at, s.R.at) + 0.1} end={s.end} />
    <Card side="R" at={s.R.at} end={s.end} good label={s.R.label} sub={s.R.sub} subAt={s.R.subAt} art={s.R.art} />
  </Show>
);

/* ---------------- follow CTA ---------------- */
const Follow: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 41.4, FPS, 170, 10);
  const subK = clamp01((f - sec(40.5)) / 8);
  const arrow = Math.sin(f / 5) * 8;
  return (
    <div style={{position: 'absolute', top: 1040, left: SAFE.left, width: SAFE.right - SAFE.left, height: 210}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontFamily: italicFont, fontStyle: 'italic', fontSize: 44, color: '#fff', textShadow: TITLE_SHADOW, opacity: subK, transform: `translateY(${(1 - subK) * 12}px)`}}>
        more skincare tips
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 66, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
        <div
          style={{
            background: C.coral,
            borderRadius: 50,
            padding: '10px 40px 14px',
            color: '#fff',
            fontFamily: displayFont,
            fontSize: 62,
            lineHeight: 1,
            boxShadow: '0 10px 26px rgba(120,40,60,0.35)',
            transform: `scale(${p * (1 + 0.03 * Math.sin(f / 6))}) rotate(-3deg)`,
          }}
        >
          + follow
        </div>
        <svg width={120} height={70} style={{opacity: clamp01(p), transform: `translateX(${arrow}px)`}}>
          <path d="M8 40 C40 10 70 60 102 32" fill="none" stroke={C.butter} strokeWidth={7} strokeLinecap="round" />
          <path d="M84 22 L104 31 L90 50" fill="none" stroke={C.butter} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

/* ---------------- sparkle-flash transition on section cuts ---------------- */
const Flash: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const k = f - sec(at) + 3;
  if (k < 0 || k > 22) return null;
  const glow = interpolate(k, [0, 3, 12], [0, 0.55, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(255,250,235,1) 0%, rgba(255,241,168,0.6) 35%, rgba(255,241,168,0) 70%)', opacity: glow}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 12}).map((_, i) => {
          const a = random(`a${at}${i}`) * Math.PI * 2;
          const d = 120 + random(`d${at}${i}`) * 320;
          const u = k / 22;
          const x = 540 + Math.cos(a) * d * (0.3 + u);
          const y = 760 + Math.sin(a) * d * (0.3 + u);
          return <Star key={i} x={x} y={y} s={(1.4 + random(`s${at}${i}`) * 1.4) * (1 - u)} t={f} color={i % 3 === 0 ? C.butter : '#fff'} phase={i * 9} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Overlays: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Show from={0} to={3.9}>
      <Hook />
    </Show>
    <Show from={3.85} to={6.15}>
      <WhyDifferent />
    </Show>
    <Show from={6.7} to={9.25}>
      <FourThings />
    </Show>
    {SECTIONS.map((s) => (
      <SectionView key={s.num} s={s} />
    ))}
    <Show from={40.4} to={43}>
      <Follow />
    </Show>

    {/* small emoji stickers beside the head (never on the face) */}
    <Sticker e="🤔" at={4.6} dur={1.55} x={850} y={700} rot={8} />
    <Sticker e="💡" at={6.05} dur={1.4} x={170} y={640} rot={-10} />
    <Sticker e="😣" at={11.5} dur={1.6} x={170} y={720} rot={-8} />
    <Sticker e="🫧" at={21.6} dur={1.5} x={850} y={760} rot={6} />
    <Sticker e="💦" at={26.3} dur={1.6} x={170} y={700} rot={-6} />
    <Sticker e="☀️" at={37.1} dur={1.5} x={850} y={680} rot={10} />
    <Sticker e="💖" at={41.6} dur={1.3} x={170} y={1000} size={74} rot={-12} />

    {SECTION_CUTS.map((c) => (
      <Flash key={c} at={c} />
    ))}
  </AbsoluteFill>
);
