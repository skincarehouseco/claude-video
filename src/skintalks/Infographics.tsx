import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import {c01, FPS, HOSTS, HOSTS_IMG, P, ROUND, SANS, SANS_MED, SAFE, sec, SERIF} from './theme';

/* Reusable educational infographic templates (cream editorial cards, cocoa line art, soft accent colours). */

const pop = (f: number, at: number, d = 12) => (f < sec(at) ? 0 : spring({frame: f - sec(at), fps: FPS, config: {damping: d, stiffness: 190, mass: 0.6}}));
const ink = P.cocoa;

/* ---------- skin cross-section (generic, parameterised) ---------- */
export type SkinState = {plug: number; oil: number; bacteria: number; inflame: number; bump: number};
export const SkinSection: React.FC<{w: number; h: number; s: SkinState; f: number; seed?: string}> = ({w, h, s, f, seed = 'a'}) => {
  const surf = h * 0.3; // skin surface y
  const fx = w / 2; // follicle x
  const bumpH = s.bump * h * 0.12;
  const surfacePath = `M0 ${surf} L${fx - w * 0.22} ${surf} C${fx - w * 0.12} ${surf} ${fx - w * 0.1} ${surf - bumpH} ${fx} ${surf - bumpH} C${fx + w * 0.1} ${surf - bumpH} ${fx + w * 0.12} ${surf} ${fx + w * 0.22} ${surf} L${w} ${surf}`;
  const folTop = surf - bumpH * 0.6;
  const folBot = h * 0.82;
  const folW = w * 0.13;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <radialGradient id={`inf${seed}`} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor={P.red} stopOpacity={0.55 * s.inflame} />
          <stop offset="100%" stopColor={P.red} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* dermis + epidermis */}
      <path d={`${surfacePath} L${w} ${h} L0 ${h} Z`} fill={P.skinDeep} />
      <path d={`${surfacePath} L${w} ${surf + h * 0.1} L0 ${surf + h * 0.1} Z`} fill={P.skin} opacity={0.9} />
      <path d={surfacePath} fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      {/* inflammation glow */}
      <ellipse cx={fx} cy={h * 0.58} rx={w * 0.34} ry={h * 0.32} fill={`url(#inf${seed})`} />
      {/* follicle */}
      <path d={`M${fx - folW / 2} ${folTop} C${fx - folW * 0.7} ${h * 0.5} ${fx - folW * 1.4} ${h * 0.7} ${fx - folW * 0.9} ${folBot} Q${fx} ${folBot + 18} ${fx + folW * 0.9} ${folBot} C${fx + folW * 1.4} ${h * 0.7} ${fx + folW * 0.7} ${h * 0.5} ${fx + folW / 2} ${folTop}`} fill={P.warmWhite} stroke={ink} strokeWidth={3.5} />
      {/* sebaceous gland */}
      <ellipse cx={fx + folW * 1.6} cy={h * 0.62} rx={w * 0.06} ry={h * 0.07} fill={P.butter} stroke={ink} strokeWidth={3} />
      {/* oil filling the follicle */}
      <path d={`M${fx - folW * 0.95} ${folBot - (folBot - h * 0.42) * s.oil} L${fx + folW * 0.95} ${folBot - (folBot - h * 0.42) * s.oil} L${fx + folW * 0.85} ${folBot} Q${fx} ${folBot + 14} ${fx - folW * 0.85} ${folBot} Z`} fill={P.butter} opacity={0.9 * c01(s.oil * 3)} />
      {/* dead-skin plug at the opening */}
      {Array.from({length: 7}).map((_, i) => (
        <ellipse key={i} cx={fx + (random(`p${seed}${i}`) - 0.5) * folW * 0.9} cy={folTop + 14 + i * 9 * (0.6 + s.plug)} rx={folW * 0.42} ry={6} fill="#CDBBA6" stroke={ink} strokeWidth={1.5} opacity={c01(s.plug * 7 - i)} transform={`rotate(${(random(`r${seed}${i}`) - 0.5) * 30} ${fx} ${folTop + 14 + i * 9})`} />
      ))}
      {/* bacteria */}
      {Array.from({length: 14}).map((_, i) => {
        const on = c01(s.bacteria * 14 - i);
        const x = fx + (random(`bx${seed}${i}`) - 0.5) * folW * 1.4;
        const y = h * 0.5 + random(`by${seed}${i}`) * (folBot - h * 0.55);
        return <ellipse key={i} cx={x + Math.sin(f / 9 + i) * 2} cy={y} rx={7 * on} ry={4 * on} fill={P.sageDeep} stroke={ink} strokeWidth={1.2} transform={`rotate(${i * 40} ${x} ${y})`} />;
      })}
      {/* visible pimple head */}
      {s.bump > 0.5 && <circle cx={fx} cy={surf - bumpH + 6} r={10 * (s.bump - 0.5) * 2} fill="#F7EBD3" stroke={ink} strokeWidth={2} />}
    </svg>
  );
};

/* ---------- full-screen cutaway shell ---------- */
const Cutaway: React.FC<{start: number; end: number; children: React.ReactNode}> = ({start, end, children}) => {
  const f = useCurrentFrame();
  if (f < sec(start) - 2 || f > sec(end) + 6) return null;
  const inK = Easing.out(Easing.cubic)(c01((f - sec(start) + 2) / 9));
  const outK = 1 - Easing.in(Easing.cubic)(c01((f - sec(end)) / 6));
  const r = 1300 * inK;
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}px at 50% 52%)`, opacity: outK}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, ${P.warmWhite} 0%, ${P.cream} 55%, #F4E9DA 100%)`}} />
      {children}
    </AbsoluteFill>
  );
};

const Heading: React.FC<{kicker: string; title: string; f: number; at: number}> = ({kicker, title, f, at}) => {
  const k = pop(f, at, 14);
  return (
    <div style={{position: 'absolute', top: SAFE.top + 10, left: SAFE.left + 10, width: 620, textAlign: 'left', opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
      <div style={{fontFamily: SANS_MED, fontSize: 26, letterSpacing: 5, color: ink, opacity: 0.6}}>{kicker}</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 66, color: ink, lineHeight: 1.1, marginTop: 6}}>{title}</div>
    </div>
  );
};

/** small circular picture-in-picture of the speaking host during a cutaway */
const HostPip: React.FC<{host: 'maya' | 'nadia'; f: number; energy: number}> = ({host, f, energy}) => {
  const h = HOSTS[host];
  const size = 170;
  const scale = 0.62; // whole face + hijab inside the circle
  return (
    <div style={{position: 'absolute', left: SAFE.right - size - 4, top: SAFE.top - 6, width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: `6px solid ${P.warmWhite}`, boxShadow: `0 0 0 ${4 + energy * 8}px ${h.tint}, 0 12px 26px rgba(90,64,44,0.25)`}}>
      <Img src={staticFile(HOSTS_IMG)} style={{position: 'absolute', width: 1536 * scale, height: 1024 * scale, left: -(h.face.x * scale - size / 2), top: -(h.face.y * scale - size / 2) + 4}} />
      <div style={{position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontSize: 20, color: ink, textShadow: '0 0 8px #fff'}}>{h.name}</div>
    </div>
  );
};

/* ---------- 1. acne timeline: under the skin -> visible (up to ~90 days) ---------- */
export const AcneTimeline: React.FC<{start: number; end: number; energy: (f: number) => number}> = ({start, end, energy}) => {
  const f = useCurrentFrame();
  const span = end - start;
  const stages: {label: string; s: SkinState}[] = [
    {label: 'Bawah kulit', s: {plug: 0.35, oil: 0.25, bacteria: 0, inflame: 0, bump: 0}},
    {label: 'Makin membesar', s: {plug: 0.75, oil: 0.6, bacteria: 0.3, inflame: 0.2, bump: 0.15}},
    {label: 'Baru nampak', s: {plug: 1, oil: 0.85, bacteria: 0.8, inflame: 0.9, bump: 1}},
  ];
  const bar = Easing.inOut(Easing.cubic)(c01((f - sec(start + 0.3)) / (span * FPS * 0.8)));
  return (
    <Cutaway start={start} end={end}>
      <Heading kicker="SKIN TALKS · FAKTA" title="Jerawat terbentuk perlahan-lahan" f={f} at={start + 0.1} />
      <div style={{position: 'absolute', top: 640, left: 70, width: 940, display: 'flex', justifyContent: 'space-between'}}>
        {stages.map((st, i) => {
          const k = pop(f, start + 0.3 + i * (span * 0.25), 12);
          return (
            <div key={i} style={{width: 290, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${0.9 + 0.1 * k})`}}>
              <div style={{borderRadius: 28, overflow: 'hidden', background: P.warmWhite, boxShadow: '0 14px 30px rgba(90,64,44,0.16)', border: `4px solid ${[P.butter, P.blush, P.sage][i]}`}}>
                <SkinSection w={282} h={300} s={st.s} f={f} seed={`t${i}`} />
              </div>
              <div style={{fontFamily: ROUND, fontWeight: 600, fontSize: 40, color: ink, marginTop: 14}}>{st.label}</div>
            </div>
          );
        })}
      </div>
      {/* progress bar: Hari 0 -> ~90 hari */}
      <div style={{position: 'absolute', top: 1140, left: 140, width: 800}}>
        <div style={{height: 22, borderRadius: 11, background: P.beige, overflow: 'hidden'}}>
          <div style={{width: `${bar * 100}%`, height: '100%', borderRadius: 11, background: `linear-gradient(90deg, ${P.butter}, ${P.blushDeep})`}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: SANS, fontSize: 34, color: ink}}>
          <span>Hari 0</span>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 44}}>sampai ±90 hari</span>
        </div>
      </div>
      <HostPip host="nadia" f={f} energy={energy(f)} />
    </Cutaway>
  );
};

/* ---------- 2. clogged pore, 4 steps synced to the spoken words ---------- */
export const PoreSteps: React.FC<{start: number; end: number; stepTimes: number[]; energy: (f: number) => number}> = ({start, end, stepTimes, energy}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = (i: number) => Easing.inOut(Easing.cubic)(c01((t - stepTimes[i]) / 0.6));
  const s: SkinState = {oil: g(0), plug: g(1), bacteria: g(2), inflame: g(3), bump: g(3)};
  const steps = [
    {label: 'Minyak berlebihan', color: P.butter},
    {label: 'Sel kulit mati', color: '#E2D3C1'},
    {label: 'Bakteria membiak', color: P.sage},
    {label: 'Kulit meradang', color: P.blush},
  ];
  return (
    <Cutaway start={start} end={end}>
      <Heading kicker="SKIN TALKS · MACAM MANA JERAWAT JADI" title="Pori yang tersumbat" f={f} at={start + 0.1} />
      <div style={{position: 'absolute', top: 470, left: 140, width: 800, borderRadius: 40, overflow: 'hidden', background: P.warmWhite, boxShadow: '0 18px 40px rgba(90,64,44,0.16)'}}>
        <SkinSection w={800} h={560} s={s} f={f} seed="pore" />
      </div>
      <div style={{position: 'absolute', top: 1065, left: 120, width: 840, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center'}}>
        {steps.map((st, i) => {
          const k = pop(f, stepTimes[i], 10);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, background: P.warmWhite, borderRadius: 30, padding: '10px 22px 12px 12px', boxShadow: '0 8px 18px rgba(90,64,44,0.14)', transform: `scale(${k})`, opacity: k}}>
              <span style={{width: 46, height: 46, borderRadius: 23, background: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 24, color: ink}}>{i + 1}</span>
              <span style={{fontFamily: ROUND, fontWeight: 600, fontSize: 36, color: ink}}>{st.label}</span>
            </div>
          );
        })}
      </div>
      <HostPip host="nadia" f={f} energy={energy(f)} />
    </Cutaway>
  );
};

/* ---------- 3. tip card (picture-in-picture over the speaker) ---------- */
export const TipCard: React.FC<{start: number; end: number; title: string; items: {text: string; at: number}[]}> = ({start, end, title, items}) => {
  const f = useCurrentFrame();
  if (f < sec(start) || f > sec(end) + 8) return null;
  const k = pop(f, start + 0.1, 13);
  const out = 1 - c01((f - sec(end)) / 8);
  return (
    <div style={{position: 'absolute', top: SAFE.top + 20, left: SAFE.left + 10, width: 560, opacity: k * out, transform: `translateY(${(1 - k) * -30}px) rotate(-2deg)`}}>
      <div style={{background: 'rgba(255,253,248,0.95)', borderRadius: 34, padding: '24px 28px 26px', boxShadow: '0 18px 40px rgba(90,64,44,0.22)', border: `4px solid ${P.sage}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          {/* ice cube wrapped in a cloth */}
          <svg width={120} height={110} viewBox="0 0 120 110">
            <path d="M14 58 C10 30 40 18 60 22 C84 18 112 30 106 58 C112 84 82 100 60 96 C36 100 8 86 14 58Z" fill="#F5EDE2" stroke={ink} strokeWidth={3.5} />
            <path d="M24 44 C40 50 80 50 96 44 M22 70 C44 76 78 76 98 70" fill="none" stroke={P.sand} strokeWidth={3} />
            <g transform={`translate(42 34) rotate(${Math.sin(f / 10) * 4} 18 18)`}>
              <rect x={0} y={0} width={36} height={36} rx={7} fill="#DCEEF7" stroke={ink} strokeWidth={3} />
              <path d="M7 9 l8 0 M7 15 l4 0" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
            </g>
          </svg>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: ink, lineHeight: 1.05}}>{title}</div>
        </div>
        <div style={{marginTop: 12}}>
          {items.map((it, i) => {
            const ik = pop(f, it.at, 12);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, opacity: ik, transform: `translateX(${(1 - ik) * 20}px)`}}>
                <svg width={38} height={38} viewBox="0 0 38 38">
                  <circle cx={19} cy={19} r={17} fill={P.sage} />
                  <path d="M10 19.5 l6 6 l12 -13" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c01((f - sec(it.at)) / 8)} />
                </svg>
                <span style={{fontFamily: ROUND, fontWeight: 600, fontSize: 36, color: ink}}>{it.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const interpolateClamp = (x: number, a: number[], b: number[]) => interpolate(x, a, b, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
