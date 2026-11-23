import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {A, C, CX, DURATION, ease, easeOut, f, FPS, hand, sans, sansLight, serif, serifItalic, softShadow} from './theme';

/* ---------------- helpers ---------------- */
const SOFT = {damping: 15, stiffness: 150, mass: 0.7};
const usePop = (delay = 0) => {
  const k = useCurrentFrame();
  return spring({frame: k - delay, fps: FPS, config: SOFT});
};
/** 0->1 over the first `inF` frames, 1->0 over the last `outF` frames of the parent Sequence */
const useLife = (inF = 9, outF = 9) => {
  const k = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const i = interpolate(k, [0, inF], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
  const o = interpolate(k, [d - outF, d], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return Math.min(i, o);
};
const useFloat = (amp = 4, period = 80, phase = 0) => Math.sin((useCurrentFrame() + phase) / (period / (2 * Math.PI))) * amp;
/** stroke "draw-on" progress */
const useDraw = (delay = 0, len = 14) =>
  interpolate(useCurrentFrame() - delay, [0, len], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

const At: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <Sequence from={f(from)} durationInFrames={Math.max(1, f(to) - f(from))} layout="none">
    <AbsoluteFill style={{pointerEvents: 'none'}}>{children}</AbsoluteFill>
  </Sequence>
);

/* ---------------- doodles ---------------- */
const Sparkle: React.FC<{x: number; y: number; size?: number; color?: string; delay?: number}> = ({x, y, size = 34, color = C.cream, delay = 0}) => {
  const k = useCurrentFrame();
  const p = usePop(delay);
  const tw = 0.7 + 0.3 * Math.sin((k + delay * 7) / 8);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${p * tw}) rotate(${Math.sin(k / 25) * 15}deg)`, filter: 'drop-shadow(0 0 6px rgba(255,248,215,0.9))'}}
    >
      <path d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z" fill={color} />
    </svg>
  );
};

/** hand-drawn arrow that draws itself from (x1,y1) to (x2,y2) with a gentle curve */
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; bend?: number; delay?: number; color?: string}> = ({
  x1, y1, x2, y2, bend = 60, delay = 4, color = C.white,
}) => {
  const p = useDraw(delay, 14);
  const mx = (x1 + x2) / 2 + bend;
  const my = (y1 + y2) / 2 - bend * 0.3;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const h = 26;
  const head = `M ${x2 - h * Math.cos(ang - 0.5)} ${y2 - h * Math.sin(ang - 0.5)} L ${x2} ${y2} L ${x2 - h * Math.cos(ang + 0.5)} ${y2 - h * Math.sin(ang + 0.5)}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 2px 3px rgba(30,20,25,0.55))'}}>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={head} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={p > 0.92 ? 1 : 0} />
    </svg>
  );
};

/** handwritten label (Caveat) */
const Hand: React.FC<{x: number; y: number; text: string; size?: number; rot?: number; color?: string; align?: 'left' | 'center'; width?: number}> = ({
  x, y, text, size = 64, rot = -4, color = C.white, align = 'left', width = 520,
}) => {
  const life = useLife(8, 8);
  const fl = useFloat(3, 90, x);
  return (
    <div
      style={{
        position: 'absolute', left: align === 'center' ? x - width / 2 : x, top: y, width, textAlign: align,
        fontFamily: hand, fontWeight: 500, fontSize: size, lineHeight: 1.0, color,
        textShadow: softShadow, opacity: life,
        transform: `translateY(${(1 - life) * 14 + fl}px) rotate(${rot}deg) scale(${0.92 + 0.08 * life})`,
      }}
    >
      {text}
    </div>
  );
};

const Chip: React.FC<{text: string; icon?: React.ReactNode; delay?: number}> = ({text, icon, delay = 0}) => {
  const p = usePop(delay);
  const fl = useFloat(2.5, 85, delay * 5);
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 26px 10px 16px', borderRadius: 999,
        background: 'rgba(255,251,240,0.93)', boxShadow: '0 8px 24px rgba(40,20,30,0.22)',
        fontFamily: sans, fontWeight: 400, fontSize: 34, color: C.cocoa, letterSpacing: 0.3,
        opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 20 + fl}px) scale(${0.8 + 0.2 * p})`, transformOrigin: 'left center',
      }}
    >
      {icon}
      {text}
    </div>
  );
};

const Cross = () => (
  <svg width={38} height={38} viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={C.rose} /><path d="M13 13 L27 27 M27 13 L13 27" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" /></svg>
);
const Tick = () => (
  <svg width={38} height={38} viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#8ACFA6" /><path d="M11 21 L18 27 L29 14" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Shield = () => (
  <svg width={38} height={38} viewBox="0 0 40 40"><path d="M20 3 L34 9 C34 22 29 31 20 37 C11 31 6 22 6 9 Z" fill={C.lilac} /><path d="M13 20 L18 25 L27 15" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Leaf = () => (
  <svg width={38} height={38} viewBox="0 0 40 40"><path d="M6 34 C6 14 18 5 35 5 C35 24 25 34 6 34 Z" fill="#9AD9B4" /><path d="M8 32 C16 22 22 16 30 10" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" /></svg>
);

/* ---------------- reference-style pieces ---------------- */
/** "Tutorial Apply Pestana Tinted Lash Serum" label pill (reference opening) */
const IntroPill: React.FC = () => {
  const p = usePop(3);
  const life = useLife(1, 10);
  return (
    <>
      <div style={{position: 'absolute', left: CX - 420, width: 840, top: 1168, display: 'flex', justifyContent: 'center', opacity: Math.min(life, p * 1.3)}}>
        <div
          style={{
            padding: '12px 34px', borderRadius: 18, background: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 30px rgba(30,20,25,0.25)',
            fontFamily: sans, fontWeight: 400, fontSize: 33, color: C.ink, letterSpacing: 0.1, whiteSpace: 'nowrap',
            transform: `translateY(${(1 - p) * 26}px) scale(${0.86 + 0.14 * p})`,
          }}
        >
          Tutorial Apply <span style={{fontFamily: serifItalic, fontStyle: 'italic', fontSize: 42, color: '#B4677F'}}>Pestana</span> Tinted Lash Serum
        </div>
      </div>
      <Sparkle x={170} y={1150} size={38} delay={10} />
      <Sparkle x={830} y={1250} size={30} delay={16} />
      <Sparkle x={880} y={1140} size={20} delay={22} color={C.butter} />
    </>
  );
};

/** step title like the reference: "3. Apply in a *zigzag motion*" (serif + italic serif, white, never bold) */
const StepTitle: React.FC<{n: number; plain: string; italic: string; y?: number}> = ({n, plain, italic, y = 1170}) => {
  const k = useCurrentFrame();
  const life = useLife(1, 10);
  const words = [`${n}.`, ...plain.split(' '), ...italic.split(' ').map((w) => `*${w}`)];
  const line = useDraw(10, 16);
  return (
    <div style={{position: 'absolute', left: CX - 410, width: 820, top: y, opacity: life, textAlign: 'center'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 14}}>
        {words.map((w, i) => {
          const p = spring({frame: k - 2 - i * 2.5, fps: FPS, config: SOFT});
          const it = w.startsWith('*');
          return (
            <span
              key={i}
              style={{
                fontFamily: it ? serifItalic : serif, fontStyle: it ? 'italic' : 'normal', fontWeight: 400,
                fontSize: it ? 68 : 62, color: C.cream, textShadow: softShadow, display: 'inline-block',
                opacity: Math.min(1, p * 1.3), transform: `translateY(${(1 - p) * 22}px)`, filter: `blur(${(1 - Math.min(1, p)) * 6}px)`,
              }}
            >
              {it ? w.slice(1) : w}
            </span>
          );
        })}
      </div>
      <svg width={420} height={20} style={{marginTop: 2}}>
        <path d="M6 12 C 90 4, 180 18, 260 9 S 380 6, 414 11" fill="none" stroke={C.butter} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} opacity={0.9} />
      </svg>
    </div>
  );
};

/** zigzag stroke drawn over the lashes: root -> tip */
const ZigzagDoodle: React.FC = () => {
  const p = useDraw(2, 26);
  const life = useLife(1, 10);
  const pts: string[] = [];
  for (let i = 0; i <= 8; i++) pts.push(`${600 + i * 32} ${i % 2 ? 470 : 432}`);
  return (
    <AbsoluteFill style={{opacity: life}}>
      <svg width={1080} height={1920} style={{position: 'absolute', filter: 'drop-shadow(0 0 6px rgba(255,241,168,0.8))'}}>
        <path d={`M ${pts.join(' L ')}`} fill="none" stroke={C.butter} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
      <Hand x={600} y={350} text="root → tip" size={50} rot={-3} width={300} />
      <Sparkle x={880} y={448} size={28} delay={26} color={C.butter} />
    </AbsoluteFill>
  );
};

const NotMascaraCard: React.FC = () => {
  const p = usePop(2);
  const life = useLife(1, 10);
  const fl = useFloat(3, 90);
  return (
    <div style={{position: 'absolute', left: CX - 300, width: 600, top: 230, opacity: life, transform: `translateY(${(1 - p) * 30 + fl}px) scale(${0.85 + 0.15 * p})`}}>
      <div style={{background: 'rgba(255,248,240,0.9)', borderRadius: 34, padding: '22px 30px 26px', textAlign: 'center', boxShadow: '0 14px 40px rgba(40,20,30,0.25)'}}>
        <div style={{fontFamily: serif, fontSize: 50, color: C.cocoa, lineHeight: 1.1}}>tinted lash serum</div>
        <div style={{fontFamily: serif, fontSize: 64, color: C.rose, lineHeight: 1.0, transform: `scale(${spring({frame: useCurrentFrame() - 10, fps: FPS, config: {damping: 8, stiffness: 200}})})`}}>≠</div>
        <div style={{fontFamily: serifItalic, fontStyle: 'italic', fontSize: 60, color: C.cocoa, lineHeight: 1.05}}>mascara</div>
      </div>
      <Sparkle x={590} y={10} size={36} delay={14} />
      <Sparkle x={10} y={250} size={26} delay={20} color={C.butter} />
    </div>
  );
};

/** small note like the reference ("Tinted lash serum tak 100% akan sama macam mascara") */
const Note: React.FC<{lines: string[]; y: number}> = ({lines, y}) => {
  const life = useLife(10, 10);
  return (
    <div style={{position: 'absolute', left: CX - 330, width: 660, top: y, textAlign: 'center', opacity: life, transform: `translateY(${(1 - life) * 10}px)`}}>
      {lines.map((l, i) => (
        <div key={i} style={{display: 'inline-block', margin: '3px 0', padding: '2px 18px', borderRadius: 12, background: 'rgba(45,30,38,0.42)', fontFamily: sansLight, fontWeight: 300, fontSize: 38, lineHeight: 1.3, color: C.white, textShadow: softShadow}}>{l}</div>
      ))}
    </div>
  );
};

const Polaroid: React.FC<{x: number; y: number; rot: number; clipIn: number; rate: number; label: string; w?: number}> = ({x, y, rot, clipIn, rate, label, w = 380}) => {
  const p = usePop(0);
  const life = useLife(1, 12);
  const fl = useFloat(4, 100, x);
  const h = w * 1.22;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, padding: '18px 18px 0', background: '#FFFDF8', borderRadius: 8,
        boxShadow: '0 18px 46px rgba(30,15,20,0.35)', opacity: life,
        transform: `translateY(${(1 - p) * 60 + fl}px) rotate(${rot * p}deg) scale(${0.7 + 0.3 * p})`,
      }}
    >
      <div style={{width: w - 36, height: h - 36, overflow: 'hidden', borderRadius: 3, background: '#000'}}>
        <OffthreadVideo src={staticFile('lash/footage.mp4')} startFrom={Math.round(clipIn * FPS)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5)', transformOrigin: '50% 30%'}} />
      </div>
      <div style={{fontFamily: hand, fontWeight: 500, fontSize: 46, color: C.cocoa, textAlign: 'center', padding: '8px 0 14px'}}>{label}</div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const p = usePop(2);
  const life = useLife(1, 1);
  const k = useCurrentFrame();
  const line = useDraw(16, 18);
  return (
    <div style={{position: 'absolute', left: CX - 400, width: 800, top: 1040, textAlign: 'center', opacity: life}}>
      <div style={{fontFamily: hand, fontSize: 58, color: C.butter, textShadow: softShadow, transform: `rotate(-4deg) translateY(${(1 - p) * 16}px)`, opacity: p}}>try it ♡</div>
      <div style={{fontFamily: serif, fontSize: 76, color: C.cream, textShadow: softShadow, lineHeight: 1.05, opacity: spring({frame: k - 6, fps: FPS, config: SOFT}), transform: `translateY(${(1 - spring({frame: k - 6, fps: FPS, config: SOFT})) * 20}px)`}}>
        Pestana
      </div>
      <div style={{fontFamily: serifItalic, fontStyle: 'italic', fontSize: 60, color: C.cream, textShadow: softShadow, lineHeight: 1.15, opacity: spring({frame: k - 11, fps: FPS, config: SOFT})}}>
        tinted lash serum
      </div>
      <svg width={360} height={20}>
        <path d="M6 12 C 80 4, 160 18, 230 9 S 330 6, 354 11" fill="none" stroke={C.butter} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
      </svg>
      <Sparkle x={110} y={110} size={40} delay={14} />
      <Sparkle x={700} y={70} size={32} delay={20} color={C.butter} />
      <Sparkle x={730} y={210} size={22} delay={26} />
    </div>
  );
};

/* ---------------- timeline ---------------- */
const UPPER = 250; // notes live in the upper part of the safe zone (over the hijab / forehead)

export const Graphics: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {/* intro: reference label pill + handwritten "Mascara-like effect" arrow on the close-up */}
    <At from={0.1} to={2.95}><IntroPill /></At>
    <At from={A.mascaraLike - 0.1} to={5.25}>
      <Hand x={150} y={900} text="Mascara-like effect" size={66} rot={-5} />
      <Arrow x1={320} y1={885} x2={505} y2={700} bend={-70} />
    </At>

    {/* 1. curl */}
    <At from={A.step1} to={7.4}><StepTitle n={1} plain="Curl your" italic="lashes" /></At>
    <At from={A.lifted - 0.1} to={9.95}>
      <Hand x={500} y={880} text="lifted & lentik" size={62} rot={-4} width={420} />
      <Arrow x1={560} y1={870} x2={470} y2={690} bend={-50} />
    </At>

    {/* 2. pump + wipe */}
    <At from={A.step2} to={14.4}><StepTitle n={2} plain="Pump &" italic="wipe off the excess" /></At>
    <At from={A.notTooMuch - 0.05} to={17.6}>
      <Hand x={CX} y={UPPER} text="not too much ya!" size={66} rot={-3} align="center" width={640} />
      <Sparkle x={CX + 260} y={UPPER + 10} size={30} delay={8} color={C.butter} />
    </At>

    {/* 3. zigzag — the most important step */}
    <At from={A.important - 0.05} to={A.step3 - 0.1}>
      <Hand x={CX} y={UPPER} text="★ most important step ★" size={66} rot={-2} align="center" width={760} color={C.butter} />
      <Sparkle x={150} y={UPPER + 120} size={34} delay={6} />
      <Sparkle x={850} y={UPPER - 20} size={28} delay={10} />
    </At>
    <At from={A.step3} to={A.whyZigzag - 0.1}><StepTitle n={3} plain="Apply in a" italic="zigzag motion" /></At>
    <At from={A.zigzagWord - 0.15} to={A.whyZigzag - 0.1}><ZigzagDoodle /></At>
    <At from={A.whyZigzag - 0.05} to={A.noWax - 0.1}>
      <Hand x={CX} y={UPPER} text="why zigzag?" size={72} rot={-4} align="center" width={600} />
    </At>
    <At from={A.noWax - 0.05} to={A.even - 0.1}>
      <div style={{position: 'absolute', left: CX - 260, top: UPPER, display: 'flex', gap: 18}}>
        <Chip text="no wax" icon={<Cross />} delay={0} />
        <Chip text="no fiber" icon={<Cross />} delay={12} />
      </div>
    </At>
    <At from={A.even - 0.05} to={34.95}>
      <div style={{position: 'absolute', left: 0, width: 990, top: UPPER, display: 'flex', justifyContent: 'center'}}>
        <Chip text="even, smooth coat" icon={<Tick />} />
      </div>
    </At>

    {/* 4. roll the brush */}
    <At from={A.step4 - 0.6} to={A.step4 + 3.6}><StepTitle n={4} plain="Roll the" italic="brush" /></At>
    <At from={A.separate - 0.05} to={43.1}>
      <Hand x={CX} y={UPPER} text="nicely separated, no clumps ✓" size={60} rot={-3} align="center" width={820} />
    </At>

    {/* compare */}
    <At from={A.compare - 0.6} to={46.3}>
      <Hand x={CX} y={UPPER + 20} text="compare the result" size={64} rot={-3} align="center" width={700} />
      <Sparkle x={CX + 300} y={UPPER + 10} size={30} delay={8} />
    </At>

    {/* 5. repeat */}
    <At from={A.step5} to={53.75}><StepTitle n={5} plain="Repeat as needed to" italic="build up the tint" y={1095} /></At>

    {/* not mascara */}
    <At from={A.notMascara} to={57.6}><NotMascaraCard /></At>
    <At from={A.mascaraLike2 - 0.1} to={A.hundred - 0.1}>
      <Hand x={500} y={880} text="Mascara-like effect" size={62} rot={-4} width={420} />
      <Arrow x1={560} y1={870} x2={470} y2={690} bend={-50} />
    </At>
    <At from={A.hundred - 0.1} to={64.1}>
      <Note lines={['Tinted lash serum tak 100%', 'akan sama macam mascara']} y={930} />
    </At>

    {/* why: formulated to care for lashes */}
    <At from={A.formulated - 0.2} to={75.45}>
      <div style={{position: 'absolute', left: 110, top: UPPER - 20, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
        <Chip text="protects your lashes" icon={<Shield />} delay={0} />
        <Chip text="supports lash growth" icon={<Leaf />} delay={f(A.growth - A.formulated + 0.2)} />
        <Chip text="no wax · no fiber" icon={<Cross />} delay={f(A.withoutWax - A.formulated + 0.2)} />
      </div>
    </At>

    {/* recap polaroids: care + mascara-like effect */}
    <At from={A.recap - 0.15} to={A.tryIt - 0.05}>
      <Polaroid x={110} y={250} rot={-5} clipIn={3.02} rate={0.3} label="care for lashes ♡" />
    </At>
    <At from={A.sameTime - 0.1} to={A.tryIt - 0.05}>
      <Polaroid x={480} y={560} rot={5} clipIn={56.2} rate={0.5} label="mascara-like ✨" />
    </At>

    {/* end card */}
    <At from={A.tryIt - 0.05} to={DURATION}><EndCard /></At>
  </AbsoluteFill>
);

/* ---------------- sound effects: [edit seconds, file, volume] (kept low so the voice stays clear) ---------------- */
type Sfx = [number, string, number];
const stepSfx = (t: number): Sfx[] => [[t - 0.2, 'whoosh', 0.09], [t + 0.05, 'pop', 0.12]];
export const SFX: Sfx[] = [
  [0.1, 'sparkle', 0.14],
  [0.25, 'pop', 0.12],
  [A.mascaraLike, 'pop', 0.12],
  ...stepSfx(A.step1),
  [A.lifted, 'pop', 0.11],
  ...stepSfx(A.step2),
  [A.notTooMuch, 'oops', 0.12],
  [A.important, 'sparkle', 0.15],
  ...stepSfx(A.step3),
  [A.zigzagWord, 'whoosh', 0.08],
  [A.whyZigzag, 'boing', 0.11],
  [A.noWax, 'pop', 0.12],
  [A.noWax + 0.4, 'pop', 0.11],
  [A.even, 'ding', 0.1],
  ...stepSfx(A.step4 - 0.6),
  [A.separate, 'ding', 0.09],
  [A.compare - 0.6, 'pop', 0.11],
  ...stepSfx(A.step5),
  [A.notMascara, 'pop', 0.12],
  [A.notMascara + 0.33, 'boing', 0.09],
  [A.mascaraLike2, 'pop', 0.1],
  [A.formulated - 0.2, 'pop', 0.11],
  [A.growth, 'pop', 0.1],
  [A.withoutWax, 'pop', 0.1],
  [A.recap - 0.3, 'whoosh', 0.09],
  [A.recap - 0.1, 'pop', 0.11],
  [A.sameTime - 0.1, 'pop', 0.11],
  [A.tryIt - 0.05, 'sparkle', 0.14],
  [A.tryIt + 0.2, 'ding', 0.1],
];
