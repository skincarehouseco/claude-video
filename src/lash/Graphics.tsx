import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {Heart, Sparkle} from '../Icons';
import {C, captionFont, roundFont, SAFE, serifFont} from '../theme';
import {BOTH, f2t, HOOK, JELLY, LASH_FPS, t2f, TONIC} from './timeline';

/* ---------------- shared styles + helpers ---------------- */
// soft butter yellow, regular weight, soft cocoa edge so it stays readable on bright footage
const butter: React.CSSProperties = {
  color: C.butter,
  fontWeight: 400,
  textShadow:
    '0 2px 0 rgba(91,70,54,0.85), 0 -1px 0 rgba(91,70,54,0.45), 1px 0 0 rgba(91,70,54,0.45), -1px 0 0 rgba(91,70,54,0.45), 0 4px 16px rgba(40,25,30,0.55)',
};
const frosted: React.CSSProperties = {
  background: 'rgba(62,44,74,0.40)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 14px 40px rgba(40,20,40,0.25), inset 0 0 0 3px rgba(255,240,166,0.22)',
};

const SOFT = {damping: 15, stiffness: 150, mass: 0.7};
const BOUNCY = {damping: 11, stiffness: 170, mass: 0.6};
/** spring that starts at absolute second `at` */
const useAt = (at: number, cfg = SOFT) => {
  const f = useCurrentFrame();
  return spring({frame: f - t2f(at), fps: LASH_FPS, config: cfg});
};
/** 1 -> 0 over the last `len` seconds before `to` */
const useOut = (to: number, len = 0.22) => {
  const t = f2t(useCurrentFrame());
  return interpolate(t, [to - len, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
};
const useFloat = (amp = 4, period = 64, phase = 0) => Math.sin((useCurrentFrame() + phase) / (period / (2 * Math.PI))) * amp;
const visible = (t: number, w: {from: number; to: number}) => t >= w.from - 0.05 && t < w.to;

/* ---------------- doodles ---------------- */
// hand-drawn squiggle underline that draws itself on
const Squiggle: React.FC<{at: number; width: number; color: string}> = ({at, width, color}) => {
  const t = f2t(useCurrentFrame());
  const p = Easing.out(Easing.cubic)(Math.min(1, Math.max(0, (t - at) / 0.4)));
  const d = `M4 14 ${Array.from({length: 8}, (_, i) => `Q ${((i + 0.5) * width) / 8} ${i % 2 ? 22 : 4} ${((i + 1) * width) / 8} 14`).join(' ')}`;
  return (
    <svg width={width + 8} height={28} style={{display: 'block', overflow: 'visible'}}>
      <path d={d} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

// little radiating "pop" lines (comic burst) around an element
const Burst: React.FC<{at: number; size?: number; color?: string; style?: React.CSSProperties}> = ({at, size = 70, color = C.butter, style}) => {
  const t = f2t(useCurrentFrame());
  const k = (t - at) / 0.45;
  if (k < 0 || k > 1) return null;
  const e = Easing.out(Easing.cubic)(k);
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{position: 'absolute', overflow: 'visible', ...style}}>
      {Array.from({length: 7}).map((_, i) => {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
        const r1 = 18 + 22 * e;
        const r2 = 28 + 26 * e;
        return (
          <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={1 - k} />
        );
      })}
    </svg>
  );
};

// mini product tubes (simple illustrations, not the real packaging)
export const Tube: React.FC<{kind: 'tonic' | 'jelly'; h?: number}> = ({kind, h = 120}) => {
  const id = `g-${kind}`;
  const [c1, c2, c3] = kind === 'tonic' ? ['#FBE3D6', '#E7B19E', '#C98C79'] : ['#F57D97', '#D63A62', '#A11F45'];
  return (
    <svg width={h * 0.36} height={h} viewBox="0 0 36 100" style={{overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(40,20,40,0.35))'}}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={c3} />
          <stop offset="0.35" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect x="4" y="2" width="28" height="34" rx="6" fill={`url(#${id})`} stroke="#fff" strokeWidth="3" />
      <rect x="4" y="38" width="28" height="60" rx="7" fill={`url(#${id})`} stroke="#fff" strokeWidth="3" />
      <rect x="10" y="44" width="4" height="46" rx="2" fill="#fff" opacity="0.55" />
    </svg>
  );
};

/* ---------------- HOOK: comment bubble + title ---------------- */
const CommentBubble: React.FC = () => {
  const p = useAt(0.08, BOUNCY);
  const out = useOut(HOOK.to + 0.05, 0.25);
  const fl = useFloat(3, 70);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        top: SAFE.top + 30,
        width: 520,
        transformOrigin: '10% 100%',
        transform: `translateY(${fl}px) scale(${(0.4 + 0.6 * p) * (0.85 + 0.15 * out)}) rotate(${-3 * p}deg)`,
        opacity: Math.min(1, p * 1.6) * out,
      }}
    >
      <div style={{background: '#fff', borderRadius: 30, padding: '18px 26px 22px', boxShadow: '0 12px 30px rgba(40,20,40,0.25)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
          <div style={{width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${C.pink}, ${C.lavender})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Heart size={22} color={C.rose} />
          </div>
          <div style={{fontFamily: roundFont, fontWeight: 400, fontSize: 26, color: '#8C7F8F'}}>Reply to comment</div>
        </div>
        <div style={{fontFamily: roundFont, fontWeight: 400, fontSize: 38, lineHeight: 1.18, color: C.plum}}>
          what's the difference between lash oil and lash tonic?
        </div>
      </div>
      {/* bubble tail */}
      <svg width="46" height="30" style={{position: 'absolute', left: 46, bottom: -24}}>
        <path d="M0 0 L46 0 L8 30 Z" fill="#fff" />
      </svg>
    </div>
  );
};

const HookTitle: React.FC = () => {
  const f = useCurrentFrame();
  const out = useOut(HOOK.to + 0.05, 0.25);
  const sub = useAt(0.6, BOUNCY);
  const word = (text: string, startAt: number, size: number, extra: React.CSSProperties) => (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      {text.split('').map((ch, i) => {
        const p = spring({frame: f - t2f(startAt) - i * 0.55, fps: LASH_FPS, config: BOUNCY});
        const bob = Math.sin((f + i * 5) / 13) * 2.5;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              fontSize: size,
              lineHeight: 1.05,
              transform: `translateY(${(1 - p) * 40 + bob}px) scale(${0.4 + 0.6 * p})`,
              opacity: Math.min(1, p * 1.6),
              ...extra,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: 480,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: out,
        transform: `scale(${0.9 + 0.1 * out})`,
      }}
    >
      <div style={{position: 'relative', padding: '14px 40px 20px', borderRadius: 40, ...frosted}}>
        {word('Lash Tonic vs Jelly Oil', 0.2, 60, {fontFamily: serifFont, fontStyle: 'italic', ...butter})}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 4,
            transform: `scale(${0.5 + 0.5 * sub}) rotate(${-2 * sub}deg)`,
            opacity: Math.min(1, sub * 1.5),
          }}
        >
          <span style={{fontFamily: captionFont, fontSize: 54, lineHeight: 1.1, color: '#FFD3DF', textShadow: butter.textShadow}}>Macam mana nak pilih?</span>
        </div>
        <Sparkle size={52} delay={0} style={{position: 'absolute', right: -22, top: -26}} />
        <Sparkle size={32} delay={11} speed={1.4} style={{position: 'absolute', left: -14, bottom: 6}} />
      </div>
    </div>
  );
};

/* ---------------- INFO CARD (Tonic / Jelly Oil) ---------------- */
type Bullet = {at: number; text: string};
type CardProps = {
  win: {from: number; to: number};
  title: string;
  pill: [string, string];
  tube: 'tonic' | 'jelly';
  bullets: Bullet[];
  cta: Bullet;
  ctaIcon: React.ReactNode;
};

const BulletRow: React.FC<{b: Bullet; i: number}> = ({b, i}) => {
  const p = useAt(b.at, SOFT);
  const s = useAt(b.at, BOUNCY);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 66,
        opacity: Math.min(1, p * 1.5),
        transform: `translateX(${(1 - p) * -34}px)`,
      }}
    >
      <div style={{width: 40, display: 'flex', justifyContent: 'center', transform: `scale(${s}) rotate(${(1 - s) * 180}deg)`}}>
        <Sparkle size={36} color={C.butter} delay={i * 7} />
      </div>
      <span style={{fontFamily: roundFont, fontSize: 53, lineHeight: 1.1, letterSpacing: 0.3, ...butter}}>{b.text}</span>
    </div>
  );
};

const InfoCard: React.FC<CardProps> = ({win, title, pill, tube, bullets, cta, ctaIcon}) => {
  const f = useCurrentFrame();
  const enter = useAt(win.from, {damping: 14, stiffness: 120, mass: 0.8});
  const head = useAt(win.from + 0.08, BOUNCY);
  const tubeP = useAt(win.from + 0.25, BOUNCY);
  const ctaP = useAt(cta.at, BOUNCY);
  const out = useOut(win.to, 0.2);
  const fl = useFloat(3, 80);
  const wiggle = Math.sin(f / 5) * 2 * Math.max(0, 1 - (f2t(f) - cta.at) / 0.9);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        top: SAFE.top + 40,
        width: 760,
        transformOrigin: '20% 0%',
        transform: `translateY(${(1 - enter) * -40 + fl}px) scale(${(0.82 + 0.18 * enter) * (0.9 + 0.1 * out)}) rotate(${(1 - enter) * -4}deg)`,
        opacity: Math.min(1, enter * 1.5) * out,
      }}
    >
      {/* heading sticker */}
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, marginLeft: 10, position: 'relative', zIndex: 2}}>
        <div
          style={{
            padding: '6px 34px 12px',
            borderRadius: 999,
            background: `linear-gradient(180deg, ${pill[0]}, ${pill[1]})`,
            border: '5px solid #fff',
            boxShadow: '0 10px 24px rgba(40,20,40,0.3)',
            fontFamily: serifFont,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 66,
            lineHeight: 1.05,
            color: '#fff',
            textShadow: '0 2px 6px rgba(80,30,50,0.35)',
            transform: `scale(${0.5 + 0.5 * head}) rotate(${-4 * head}deg)`,
            transformOrigin: '0% 100%',
          }}
        >
          {title}
        </div>
        <div style={{transform: `translateY(${(1 - tubeP) * 60}px) rotate(${12 * tubeP + Math.sin(f / 11) * 5}deg)`, opacity: Math.min(1, tubeP * 2)}}>
          <Tube kind={tube} h={92} />
        </div>
      </div>
      {/* body */}
      <div style={{marginTop: -18, padding: '34px 34px 22px 26px', borderRadius: 36, ...frosted}}>
        {bullets.map((b, i) => (
          <BulletRow key={i} b={b} i={i} />
        ))}
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            marginTop: 12,
            marginLeft: 6,
            transformOrigin: '0% 50%',
            transform: `scale(${0.4 + 0.6 * ctaP}) rotate(${wiggle}deg)`,
            opacity: Math.min(1, ctaP * 1.6),
          }}
        >
          {ctaIcon}
          <div>
            <span style={{fontFamily: roundFont, fontSize: 56, lineHeight: 1.05, ...butter}}>{cta.text}</span>
            <Squiggle at={cta.at + 0.15} width={cta.text.length * 25} color={C.pink} />
          </div>
          <Burst at={cta.at + 0.05} size={90} style={{right: -70, top: -40}} />
        </div>
      </div>
    </div>
  );
};

// "1x a day" badge for the tonic
const OnceBadge: React.FC = () => (
  <div style={{width: 64, height: 66, borderRadius: 32, background: C.butter, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: roundFont, fontWeight: 500, fontSize: 30, color: C.plum, boxShadow: '0 6px 14px rgba(40,20,40,0.3)'}}>
    1x
  </div>
);
// little clock for "anytime"
const ClockBadge: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" style={{filter: 'drop-shadow(0 6px 10px rgba(40,20,40,0.3))'}}>
      <circle cx="32" cy="32" r="28" fill={C.butter} stroke="#fff" strokeWidth="4" />
      <line x1="32" y1="32" x2="32" y2="15" stroke={C.plum} strokeWidth="4" strokeLinecap="round" transform={`rotate(${f * 6} 32 32)`} />
      <line x1="32" y1="32" x2="44" y2="32" stroke={C.plum} strokeWidth="4" strokeLinecap="round" transform={`rotate(${f * 0.6} 32 32)`} />
      <circle cx="32" cy="32" r="4" fill={C.rose} />
    </svg>
  );
};

/* ---------------- BOTH: "Guna both for faster result!" ---------------- */
const BothOutro: React.FC = () => {
  const f = useCurrentFrame();
  const a = useAt(BOTH.from, BOUNCY);
  const b = useAt(BOTH.from + 0.35, BOUNCY);
  const tubes = useAt(BOTH.from + 0.15, BOUNCY);
  const heart = useAt(BOTH.from + 0.6, {damping: 8, stiffness: 180, mass: 0.5});
  const out = useOut(BOTH.to - 0.05, 0.35);
  const fl = useFloat(4, 70);
  const beat = 1 + 0.04 * Math.max(0, Math.sin(f / 4.5)) * heart;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: 1180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: out,
        transform: `translateY(${fl}px)`,
      }}
    >
      <div style={{position: 'relative', padding: '16px 46px 22px', borderRadius: 40, ...frosted, transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a * 1.5)}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
          <div style={{transform: `translateX(${(1 - tubes) * -60}px) rotate(${-14 * tubes}deg)`, opacity: Math.min(1, tubes * 2)}}>
            <Tube kind="tonic" h={84} />
          </div>
          <span style={{fontFamily: roundFont, fontSize: 64, lineHeight: 1.1, ...butter}}>Guna both</span>
          <div style={{transform: `translateX(${(1 - tubes) * 60}px) rotate(${14 * tubes}deg)`, opacity: Math.min(1, tubes * 2)}}>
            <Tube kind="jelly" h={84} />
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', transform: `scale(${(0.5 + 0.5 * b) * beat})`, opacity: Math.min(1, b * 1.5)}}>
          <span style={{fontFamily: roundFont, fontSize: 64, lineHeight: 1.1, ...butter}}>for faster result!</span>
        </div>
        <div style={{position: 'absolute', right: -26, top: -34, transform: `scale(${heart}) rotate(${12 + Math.sin(f / 9) * 6}deg)`}}>
          <Heart size={64} color={C.rose} />
        </div>
        <Burst at={BOTH.from + 0.6} size={110} color={C.pink} style={{right: -50, top: -56}} />
        <Sparkle size={44} delay={5} style={{position: 'absolute', left: -20, top: -20}} />
      </div>
    </div>
  );
};

/* ---------------- stickers that ride on the footage (tracked to the camera) ---------------- */
const GooglyEye: React.FC<{x: number; y: number; r: number; at: number; phase: number}> = ({x, y, r, at, phase}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - t2f(at), fps: LASH_FPS, config: BOUNCY});
  const look = Math.sin((f + phase) / 6) * r * 0.28;
  const blink = (f + phase) % 26 < 3 ? 0.15 : 1;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${p})`}}>
      <svg width={r * 2} height={r * 2} viewBox="-50 -50 100 100" style={{overflow: 'visible', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))'}}>
        <ellipse cx="0" cy="0" rx="46" ry={46 * blink} fill="#fff" stroke="#3E2C4A" strokeWidth="5" />
        {blink > 0.5 && <circle cx={(look / r) * 50} cy="8" r="22" fill="#2A1E30" />}
        {blink > 0.5 && <circle cx={(look / r) * 50 - 7} cy="1" r="6" fill="#fff" />}
      </svg>
    </div>
  );
};

/** stickers placed in footage pixel space (rendered inside the camera transform) */
export const TrackedStickers: React.FC = () => {
  const t = f2t(useCurrentFrame());
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {t < HOOK.to && (
        <>
          {/* googly eyes on the two bottles in the opening product shot */}
          <GooglyEye x={448} y={790} r={17} at={0.55} phase={0} />
          <GooglyEye x={492} y={790} r={17} at={0.6} phase={3} />
          <GooglyEye x={600} y={760} r={15} at={0.7} phase={9} />
          <GooglyEye x={638} y={760} r={15} at={0.75} phase={12} />
        </>
      )}
      {t >= 10.0 && (
        // tiny twinkles along the freshly brushed lashes
        <>
          {[
            [560, 820, 0, 34],
            [760, 860, 0.25, 28],
            [930, 900, 0.5, 30],
            [470, 880, 0.8, 24],
          ].map(([x, y, d, s], i) => {
            const k = (t - 10.0 - d) / 1.6;
            const o = k < 0 || k > 1 ? 0 : Math.sin(k * Math.PI);
            return (
              <div key={i} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, opacity: o}}>
                <Sparkle size={s} delay={i * 6} />
              </div>
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- all screen-space graphics ---------------- */
export const Graphics: React.FC = () => {
  const t = f2t(useCurrentFrame());
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {visible(t, {from: 0, to: HOOK.to + 0.05}) && (
        <>
          <CommentBubble />
          <HookTitle />
        </>
      )}
      {visible(t, TONIC) && (
        <InfoCard
          win={TONIC}
          title="Tonic :"
          pill={['#F6CDBE', '#D99683']}
          tube="tonic"
          bullets={[
            {at: 2.0, text: 'Tumbuh bulu mata'},
            {at: 2.4, text: 'Bulu mata botak'},
            {at: 2.8, text: 'Sensitive eye approved'},
            {at: 3.2, text: 'Waterbased'},
          ]}
          cta={{at: 4.06, text: 'Use once a day !'}}
          ctaIcon={<OnceBadge />}
        />
      )}
      {visible(t, JELLY) && (
        <InfoCard
          win={JELLY}
          title="Jelly Oil :"
          pill={['#EE6A8A', '#B92650']}
          tube="jelly"
          bullets={[
            {at: 6.6, text: 'Panjangkan bulu mata'},
            {at: 6.95, text: 'Kurang bulu mata jatuh'},
            {at: 7.3, text: 'Hydrate eyelash'},
            {at: 7.65, text: 'Oil based ( but not oily )'},
          ]}
          cta={{at: 8.2, text: 'Use anytime a day !'}}
          ctaIcon={<ClockBadge />}
        />
      )}
      {visible(t, BOTH) && <BothOutro />}
    </AbsoluteFill>
  );
};
