import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AquaWater, BlushRays, BlushStudio, CreamEditorial, LavenderDream, LavenderSilk, PeachGlow, PeachPodium, SkyGlass, SunlitLinen} from './Backgrounds';
import {BottleIcon, Burst, Check, Feather, Glass, Kicker, Rise, SkinDisc, SkinLayers, Sparkle, Swipe, Words} from './Bits';
import {BODY, C, clampI, easeOut, FPS, H, inOut, pop, prog, SANS, SERIF, sec, W, win} from './theme';

const pad = (n: number) => String(n).padStart(4, '0');
const abs: React.CSSProperties = {position: 'absolute'};

/* =============== BACKGROUND TIMELINE (with circular reveal swaps) =============== */
type BgSeg = {from: number; to: number; ox: number; oy: number; wipe: boolean; C: React.FC<{f: number}>};
const PeachWithLeaves: React.FC<{f: number}> = ({f}) => <PeachGlow f={f} leaves={prog(f, 13.1, 30)} />;
const BGS: BgSeg[] = [
  {from: 0, to: 110, ox: 540, oy: 900, wipe: false, C: BlushStudio},
  {from: 234, to: 300, ox: 540, oy: 900, wipe: false, C: LavenderSilk},
  {from: 300, to: 444, ox: 250, oy: 450, wipe: true, C: PeachWithLeaves},
  {from: 444, to: 622, ox: 300, oy: 300, wipe: true, C: SkyGlass},
  {from: 622, to: 690, ox: 540, oy: 700, wipe: true, C: BlushRays},
  {from: 838, to: 953, ox: 540, oy: 900, wipe: false, C: SunlitLinen},
  {from: 953, to: 1102, ox: 540, oy: 900, wipe: false, C: LavenderDream},
  {from: 1102, to: 1300, ox: 540, oy: 300, wipe: true, C: PeachPodium},
];
const WIPE = 14;
export const BackgroundLayer: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {BGS.map((b, i) => {
        if (f < b.from || f >= b.to + WIPE) return null;
        const r = b.wipe ? interpolate(f - b.from, [0, WIPE], [0, 2400], {extrapolateRight: 'clamp', easing: easeOut}) : 3000;
        return (
          <AbsoluteFill key={i} style={{clipPath: `circle(${r}px at ${b.ox}px ${b.oy}px)`}}>
            <b.C f={f} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* =============== TEXT BEHIND THE SPEAKER (depth / magazine-cover layering) =============== */
export const BehindLayer: React.FC = () => {
  const f = useCurrentFrame();
  const best = win(f, 21.94, 22.57, 8, 6);
  const bp = pop(f, 21.94, 12, 140);
  return (
    <AbsoluteFill>
      {best > 0 && (
        <div style={{...abs, top: 190, width: W, textAlign: 'center', opacity: best, transform: `scale(${0.7 + 0.3 * bp})`}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 300, lineHeight: 0.88, letterSpacing: '-0.05em', color: C.rose, textShadow: '0 20px 60px rgba(217,138,156,0.45), 0 0 0 #fff'}}>
            BEST
            <br />
            PART
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* =============== FULL-SCREEN B-ROLL SCENES (above the speaker) =============== */
/** footage frame shown in a designed frame. srcFrame maps composition -> source frame */
const BFrame: React.FC<{src: number; style: React.CSSProperties; radius: number | string; objPos?: string; zoom?: number}> = ({src, style, radius, objPos = '50% 45%', zoom = 1}) => (
  <div style={{...abs, overflow: 'hidden', borderRadius: radius, border: '12px solid #fff', boxShadow: '0 40px 90px rgba(90,50,70,0.25)', ...style}}>
    <Img src={staticFile(`glow/broll/b_${pad(src)}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: objPos, transform: `scale(${zoom})`}} />
  </div>
);
/** entry: circle reveal (footage frozen on its first frame), exit: card zooms away revealing next scene */
const brollWrap = (f: number, cutIn: number, cutOut: number) => {
  const pre = 10;
  const post = 12;
  if (f < cutIn - pre || f >= cutOut + post) return null;
  const r = interpolate(f, [cutIn - pre, cutIn], [0, 2300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
  const e = interpolate(f, [cutOut, cutOut + post], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: inOut});
  return {r, e};
};

const FermentScene: React.FC<{f: number}> = ({f}) => {
  const w = brollWrap(f, 110, 234);
  if (!w) return null;
  const src = Math.max(110, Math.min(233, f));
  const t = f / FPS;
  const pores = clampI(f, [sec(5.6), sec(7.4)], [1, 0.15]);
  return (
    <AbsoluteFill style={{clipPath: `circle(${w.r}px at 540px 820px)`, transform: `translateY(${-w.e * 1950}px) scale(${1 - w.e * 0.12})`, borderRadius: w.e * 80, overflow: 'hidden'}}>
      <CreamEditorial f={f} />
      <div style={{...abs, top: 170, width: W, textAlign: 'center'}}>
        <Rise f={f} at={3.5}>
          <Kicker>Ingredient 01</Kicker>
        </Rise>
        <Rise f={f} at={3.92} style={{fontFamily: SERIF, fontSize: 132, color: C.ink, lineHeight: 1.05, marginTop: 16, letterSpacing: '-0.01em'}}>
          <span style={{fontStyle: 'italic'}}>Galactomyces</span>
        </Rise>
        <Rise f={f} at={4.3} style={{fontFamily: BODY, fontSize: 34, letterSpacing: '0.3em', color: C.inkSoft, textTransform: 'uppercase', fontWeight: 500}}>
          ferment filtrate
        </Rise>
      </div>
      {/* footage in a tilted arch frame, slow push */}
      <BFrame
        src={src}
        radius="300px 300px 40px 40px"
        zoom={1.05 + (t - 3.67) * 0.02}
        objPos="50% 42%"
        style={{left: 210, top: 560, width: 600, height: 760, transform: `rotate(${-3 + Math.sin(f / 40)}deg) translateY(${(1 - prog(f, 3.6, 20)) * 80}px)`}}
      />
      {/* pores infographic */}
      <div style={{...abs, left: 700, top: 1000, opacity: win(f, 5.1, 99, 10), transform: `scale(${pop(f, 5.1)})`, transformOrigin: '150px 150px'}}>
        <div style={{width: 300, height: 300, borderRadius: '50%', background: '#fff', padding: 12, boxShadow: '0 30px 60px rgba(90,50,70,0.22)'}}>
          <SkinDisc d={276} pores={pores} rough={pores * 0.8} glow={1 - pores} />
        </div>
        <div style={{...abs, left: -10, top: 300, width: 330, textAlign: 'center', opacity: win(f, 7.04, 99)}}>
          <Kicker bg={C.ink} color="#fff" style={{fontSize: 24, padding: '12px 22px'}}>
            pores ↓ refined
          </Kicker>
        </div>
      </div>
      <div style={{...abs, left: 60, top: 1080, opacity: win(f, 5.3, 99), transform: `rotate(-4deg) scale(${pop(f, 5.3)})`}}>
        <Glass style={{padding: '18px 26px', borderRadius: 28}}>
          <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 30, color: C.ink}}>yeast ferment</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: C.rose}}>from rice</div>
        </Glass>
      </div>
      <Sparkle f={f} at={3.95} x={900} y={260} size={70} color={C.peachMid} />
      <Sparkle f={f} at={4.1} x={160} y={420} size={46} color={C.blushMid} />
      <Burst f={f} at={7.1} x={850} y={1150} r={190} color="#fff" />
    </AbsoluteFill>
  );
};

/** speed-ramp + freeze-frame mapping for the texture B-roll (source frames 677..837) */
const FREEZE_AT = 696; // "texture."
const FREEZE_LEN = 18;
const textureSrc = (f: number) => {
  if (f < FREEZE_AT) return Math.max(677, f);
  if (f < FREEZE_AT + FREEZE_LEN) return FREEZE_AT;
  const p = Math.min(1, (f - FREEZE_AT - FREEZE_LEN) / (837 - FREEZE_AT - FREEZE_LEN));
  return Math.round(FREEZE_AT + (837 - FREEZE_AT) * (0.5 - 0.5 * Math.cos(Math.PI * p))); // slow -> fast -> slow
};
const Pill: React.FC<{f: number; at: number; x: number; y: number; text: string; rot?: number}> = ({f, at, x, y, text, rot = 0}) => (
  <div style={{...abs, left: x, top: y, opacity: win(f, at, 99, 6), transform: `rotate(${rot}deg) scale(${pop(f, at, 11, 190)})`}}>
    <Glass style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 30px 18px 20px', borderRadius: 999}}>
      <svg width="40" height="52" viewBox="0 0 100 132">
        <path d="M50 2 C50 2 92 58 92 84 A42 42 0 0 1 8 84 C8 58 50 2 50 2Z" fill={C.skyDeep} />
        <ellipse cx="34" cy="80" rx="9" ry="16" fill="#fff" opacity="0.9" />
      </svg>
      <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 42, color: C.ink}}>{text}</span>
    </Glass>
  </div>
);
const TextureScene: React.FC<{f: number}> = ({f}) => {
  const w = brollWrap(f, 677, 838);
  if (!w) return null;
  const src = Math.min(837, textureSrc(f));
  const flash = interpolate(f, [FREEZE_AT, FREEZE_AT + 8], [0.75, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const frozen = f >= FREEZE_AT && f < FREEZE_AT + FREEZE_LEN;
  const bump = frozen ? 1 + 0.03 * Math.sin(((f - FREEZE_AT) / FREEZE_LEN) * Math.PI) : 1;
  return (
    <AbsoluteFill style={{clipPath: `circle(${w.r}px at 540px 760px)`, transform: `translateY(${-w.e * 1950}px) scale(${1 - w.e * 0.12})`, overflow: 'hidden'}}>
      <AquaWater f={f} />
      <div style={{...abs, top: 165, width: W, textAlign: 'center'}}>
        <Rise f={f} at={22.3} style={{fontFamily: BODY, fontSize: 34, letterSpacing: '0.3em', color: C.inkSoft, textTransform: 'uppercase', fontWeight: 600}}>
          the best part
        </Rise>
        <Rise f={f} at={23.2} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 140, color: C.ink, lineHeight: 1}}>
          the texture
        </Rise>
      </div>
      <BFrame
        src={src}
        radius={56}
        objPos="50% 40%"
        zoom={1.08}
        style={{left: 150, top: 430, width: 780, height: 880, transform: `rotate(${frozen ? -2 : 0}deg) scale(${bump})`}}
      />
      {/* freeze-frame flash + "texture check" stamp */}
      <div style={{...abs, inset: 0, background: '#fff', opacity: flash}} />
      <div style={{...abs, left: 640, top: 400, opacity: win(f, FREEZE_AT / FPS, 24.3, 4, 8), transform: `rotate(10deg) scale(${pop(f, FREEZE_AT / FPS, 10, 220)})`}}>
        <Kicker bg={C.ink} color="#fff">✦ texture check</Kicker>
      </div>
      <Pill f={f} at={24.92} x={560} y={560} text="lightweight" rot={3} />
      <Pill f={f} at={25.9} x={70} y={800} text="watery" rot={-4} />
      <Pill f={f} at={26.7} x={510} y={1040} text="absorbs fast" rot={2} />
      {/* absorption cross-section */}
      <div style={{...abs, left: 70, top: 1010, opacity: win(f, 26.55, 99, 8), transform: `scale(${pop(f, 26.55)})`, transformOrigin: '0 100%'}}>
        <Glass style={{padding: '8px 22px 18px', borderRadius: 32}}>
          <SkinLayers w={380} f={f} at={26.6} />
          <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 24, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.inkSoft, textAlign: 'center'}}>sinks into skin</div>
        </Glass>
      </div>
      <Burst f={f} at={23.2} x={540} y={300} r={330} color="#fff" n={8} />
    </AbsoluteFill>
  );
};

export const BrollLayer: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <FermentScene f={f} />
      <TextureScene f={f} />
    </AbsoluteFill>
  );
};

/* =============== FRONT GRAPHICS over the speaker =============== */
const Left: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => <div style={{...abs, left: 70, ...style}}>{children}</div>;

const Hook: React.FC<{f: number}> = ({f}) => {
  if (f > 112) return null;
  return (
    <>
      <div style={{...abs, top: 170, width: W, textAlign: 'center'}}>
        <Rise f={f} at={0.15}>
          <Kicker>✦ treatment essence ✦</Kicker>
        </Rise>
        <Words f={f} words={[['one', 1.32], ['of', 1.5], ['our', 1.64]]} style={{justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: C.ink, marginTop: 18, lineHeight: 1}} />
        <div style={{transform: `scale(${0.6 + 0.4 * pop(f, 1.9, 11, 150)})`, opacity: prog(f, 1.9, 6)}}>
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 128,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              background: `linear-gradient(90deg, ${C.rose}, ${C.peachDeep})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 10px 24px rgba(217,138,156,0.35))',
            }}
          >
            best-selling
          </span>
        </div>
        <Rise f={f} at={2.34} style={{fontFamily: SERIF, fontSize: 84, color: C.ink, lineHeight: 1}}>
          <span style={{fontStyle: 'italic'}}>products</span> <span style={{fontFamily: BODY, fontSize: 40, color: C.rose, letterSpacing: '0.12em', verticalAlign: 'middle'}}>★★★★★</span>
        </Rise>
      </div>
      <Burst f={f} at={1.95} x={540} y={420} r={360} color="#fff" n={7} />
      {/* "First," chapter chip */}
      <div style={{...abs, left: 70, top: 1080, opacity: win(f, 2.78, 99, 6), transform: `scale(${pop(f, 2.78)}) rotate(-6deg)`}}>
        <Glass style={{width: 170, height: 170, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
          <div style={{fontFamily: BODY, fontSize: 22, letterSpacing: '0.2em', color: C.inkSoft, fontWeight: 600}}>FIRST</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: C.rose, lineHeight: 0.9}}>01</div>
        </Glass>
      </div>
    </>
  );
};

const Smoother: React.FC<{f: number}> = ({f}) => {
  if (f < 234 || f > 306) return null;
  const o = win(f, 7.8, 10.15, 1, 9);
  const wipe = clampI(f, [sec(8.7), sec(9.5)], [0, 1]);
  return (
    <div style={{...abs, inset: 0, opacity: o}}>
      <Left style={{top: 200}}>
        <Rise f={f} at={8.18} style={{fontFamily: BODY, fontWeight: 600, fontSize: 32, letterSpacing: '0.25em', color: C.lavDeep, textTransform: 'uppercase'}}>
          skin texture
        </Rise>
        <Rise f={f} at={9.2} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, color: C.ink, lineHeight: 1}}>
          <Swipe f={f} at={9.4} color="rgba(255,255,255,0.85)">
            smoother
          </Swipe>
        </Rise>
      </Left>
      {/* before / after slider */}
      <div style={{...abs, left: 70, top: 600, opacity: prog(f, 7.9, 10), transform: `translateY(${(1 - prog(f, 7.9, 16)) * 60}px) rotate(-3deg)`}}>
        <Glass style={{padding: 16, borderRadius: 44}}>
          <div style={{position: 'relative', width: 380, height: 380, borderRadius: 32, overflow: 'hidden'}}>
            <div style={{...abs, inset: 0}}>
              <SkinDisc d={380} pores={1} rough={1} />
            </div>
            <div style={{...abs, inset: 0, clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)`}}>
              <SkinDisc d={380} pores={0.1} rough={0} glow={1} />
            </div>
            <div style={{...abs, top: 0, bottom: 0, left: `${(1 - wipe) * 100}%`, width: 5, marginLeft: -2.5, background: '#fff', boxShadow: '0 0 12px rgba(0,0,0,0.15)'}} />
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: BODY, fontWeight: 600, fontSize: 26, letterSpacing: '0.18em', color: C.inkSoft, padding: '14px 14px 2px'}}>
            <span>BEFORE</span>
            <span style={{color: C.lavDeep}}>AFTER</span>
          </div>
        </Glass>
      </div>
      <Sparkle f={f} at={9.5} x={420} y={640} size={60} />
      <Sparkle f={f} at={9.6} x={120} y={920} size={40} />
    </div>
  );
};

const Actives: React.FC<{f: number}> = ({f}) => {
  if (f < 296 || f > 450) return null;
  const o = win(f, 10.0, 14.75, 10, 9);
  const pct = Math.round(clampI(f, [sec(11.3), sec(11.75)], [0, 5], easeOut));
  return (
    <div style={{...abs, inset: 0, opacity: o}}>
      <Left style={{top: 180}}>
        <Rise f={f} at={10.1}>
          <Kicker style={{fontSize: 24}}>Ingredients 02 + 03</Kicker>
        </Rise>
      </Left>
      <Left style={{top: 270}}>
        <div style={{opacity: prog(f, 11.3, 6), transform: `scale(${0.5 + 0.5 * pop(f, 11.3, 12, 140)})`, transformOrigin: 'left center'}}>
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 300,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              background: `linear-gradient(180deg, ${C.peachDeep}, ${C.rose})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 14px 30px rgba(233,150,116,0.35))',
            }}
          >
            {pct}%
          </span>
        </div>
        <Rise f={f} at={12.06} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 104, color: C.ink, lineHeight: 0.9, marginTop: -10}}>
          Niacinamide
        </Rise>
      </Left>
      <Left style={{top: 720}}>
        <div style={{opacity: win(f, 12.96, 99, 8), transform: `scale(${pop(f, 12.96)})`, width: 84, height: 84, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 60, color: C.sageDeep, boxShadow: '0 10px 30px rgba(90,50,70,0.15)'}}>
          +
        </div>
        <Rise f={f} at={13.2} style={{fontFamily: SERIF, fontSize: 96, color: C.ink, lineHeight: 0.95, marginTop: 14}}>
          <span style={{fontStyle: 'italic'}}>Centella</span>
          <br />
          <span style={{fontStyle: 'italic', color: C.sageDeep}}>Asiatica</span>
        </Rise>
        <Rise f={f} at={13.9} style={{fontFamily: BODY, fontSize: 28, letterSpacing: '0.2em', color: C.inkSoft, fontWeight: 600, marginTop: 10}}>
          “CICA” · TIGER GRASS
        </Rise>
      </Left>
      <Burst f={f} at={11.4} x={250} y={430} r={240} color="#fff" n={7} />
    </div>
  );
};

const BENEFITS: {at: number; textAt: number; top: string; main: string; disc: (f: number) => React.ReactNode}[] = [
  {at: 15.3, textAt: 15.3, top: 'soothes', main: 'the skin', disc: (f) => <SkinDisc d={112} red={0.35} glow={prog(f, 15.4, 20)} />},
  {at: 16.5, textAt: 16.56, top: 'calms', main: 'redness', disc: (f) => <SkinDisc d={112} red={clampI(f, [sec(16.9), sec(17.9)], [1, 0.05])} />},
  {at: 18.2, textAt: 19.86, top: 'improves', main: 'acne scars', disc: (f) => <SkinDisc d={112} marks={clampI(f, [sec(19.9), sec(20.6)], [1, 0.15])} />},
];
const Benefits: React.FC<{f: number}> = ({f}) => {
  if (f < 440 || f > 630) return null;
  const o = win(f, 14.7, 20.7, 8, 9);
  return (
    <div style={{...abs, inset: 0, opacity: o}}>
      <Left style={{top: 190}}>
        <Rise f={f} at={14.6} style={{fontFamily: BODY, fontWeight: 600, fontSize: 30, letterSpacing: '0.25em', color: C.skyDeep, textTransform: 'uppercase'}}>
          what it does
        </Rise>
        <Rise f={f} at={14.75} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 112, color: C.ink, lineHeight: 1}}>
          skin benefits
        </Rise>
      </Left>
      {BENEFITS.map((b, i) => (
        <div key={i} style={{...abs, left: 60, top: 440 + i * 210, opacity: prog(f, b.at, 8), transform: `translateX(${(1 - pop(f, b.at, 14, 150)) * -120}px)`}}>
          <Glass style={{display: 'flex', alignItems: 'center', gap: 24, padding: '20px 34px 20px 20px', borderRadius: 999, width: 520}}>
            {b.disc(f)}
            <div>
              <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 26, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.inkSoft}}>{b.top}</div>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 62, color: C.ink, lineHeight: 1, opacity: prog(f, b.textAt, 8)}}>{b.main}</div>
            </div>
          </Glass>
        </div>
      ))}
      <Sparkle f={f} at={17.6} x={180} y={690} size={50} />
      <Sparkle f={f} at={20.4} x={180} y={900} size={50} />
    </div>
  );
};

const BestPart: React.FC<{f: number}> = ({f}) => {
  if (f < 615 || f > 690) return null;
  return (
    <>
      <div style={{...abs, top: 170, width: W, textAlign: 'center'}}>
        <Rise f={f} at={20.8} end={21.95} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: C.ink}}>
          and honestly…
        </Rise>
      </div>
      <Burst f={f} at={21.95} x={540} y={560} r={420} color="#fff" n={9} />
    </>
  );
};

const Layering: React.FC<{f: number}> = ({f}) => {
  if (f < 838 || f > 960) return null;
  const featherO = win(f, 27.95, 29.5, 8, 9);
  const steps: {k: 'toner' | 'essence' | 'serum' | 'cream'; label: string}[] = [
    {k: 'toner', label: 'toner'},
    {k: 'essence', label: 'essence'},
    {k: 'serum', label: 'serum'},
    {k: 'cream', label: 'moisturiser'},
  ];
  return (
    <>
      {/* weightless */}
      <div style={{...abs, inset: 0, opacity: featherO}}>
        <div style={{...abs, top: 190, width: W, textAlign: 'center'}}>
          <Rise f={f} at={28.06} style={{fontFamily: BODY, fontWeight: 600, fontSize: 32, letterSpacing: '0.25em', color: C.inkSoft, textTransform: 'uppercase'}}>
            doesn&apos;t feel heavy
          </Rise>
          <Rise f={f} at={28.4} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 140, color: C.ink, lineHeight: 1}}>
            weightless
          </Rise>
        </div>
        <div style={{...abs, left: 780 + Math.sin(f / 14) * 30, top: 380 + ((f - 838) * 0.9) + Math.cos(f / 10) * 8, transform: `rotate(${-30 + Math.sin(f / 12) * 18}deg)`}}>
          <Feather size={110} />
        </div>
        <div style={{...abs, left: 140 + Math.cos(f / 16) * 24, top: 420 + ((f - 838) * 0.6), transform: `rotate(${40 + Math.sin(f / 14) * 14}deg)`, opacity: 0.8}}>
          <Feather size={70} />
        </div>
      </div>
      {/* layers with your routine */}
      <div style={{...abs, inset: 0, opacity: win(f, 29.44, 31.85, 8, 8)}}>
        <div style={{...abs, top: 180, width: W, textAlign: 'center'}}>
          <Rise f={f} at={29.44} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: C.ink, lineHeight: 1}}>
            easy to layer
          </Rise>
          <Rise f={f} at={29.6} style={{fontFamily: BODY, fontWeight: 600, fontSize: 28, letterSpacing: '0.22em', color: C.inkSoft, textTransform: 'uppercase', marginTop: 8}}>
            with your other skincare
          </Rise>
        </div>
        <div style={{...abs, top: 350, width: W, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
          {steps.map((s, i) => {
            const at = 30.0 + i * 0.28;
            const hl = s.k === 'essence';
            return (
              <React.Fragment key={s.k}>
                {i > 0 && <div style={{fontFamily: SANS, fontSize: 34, color: C.sand, opacity: prog(f, at, 6)}}>→</div>}
                <div style={{opacity: prog(f, at, 6), transform: `translateY(${(1 - pop(f, at, 12, 180)) * 50}px) scale(${hl ? 1.12 : 1})`, textAlign: 'center'}}>
                  <div style={{width: 160, height: 160, borderRadius: '50%', background: hl ? `linear-gradient(160deg, #fff, ${C.peach})` : 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hl ? `0 0 0 5px ${C.peachMid}, 0 20px 40px rgba(233,150,116,0.3)` : '0 14px 30px rgba(120,90,70,0.12)'}}>
                    <BottleIcon kind={s.k} size={92} color={hl ? C.peachDeep : C.sand} />
                  </div>
                  <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 24, color: hl ? C.peachDeep : C.inkSoft, marginTop: 10, letterSpacing: '0.06em'}}>{s.label}</div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <Sparkle f={f} at={30.4} x={420} y={400} size={50} color={C.peachMid} />
      </div>
    </>
  );
};

const CHECKS: [string, number][] = [
  ['comfortable', 33.42],
  ['easy to apply', 34.86],
  ['fits your routine', 36.36],
];
const Checklist: React.FC<{f: number}> = ({f}) => {
  if (f < 953 || f > 1112) return null;
  return (
    <div style={{...abs, inset: 0, opacity: win(f, 31.77, 36.95, 6, 9)}}>
      <Left style={{top: 190, width: 560}}>
        <Rise f={f} at={32.08} style={{fontFamily: BODY, fontWeight: 600, fontSize: 30, letterSpacing: '0.25em', color: C.lavDeep, textTransform: 'uppercase'}}>
          if you like an
        </Rise>
        <Rise f={f} at={32.78} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: C.ink, lineHeight: 0.95}}>
          essence that&apos;s…
        </Rise>
      </Left>
      <Left style={{top: 520}}>
        <Glass style={{padding: '30px 36px', width: 560, opacity: prog(f, 33.2, 10), transform: `translateY(${(1 - prog(f, 33.2, 16)) * 50}px)`}}>
          {CHECKS.map(([t, at], i) => (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '16px 0', borderTop: i ? `2px solid rgba(201,187,235,0.45)` : undefined}}>
              <Check f={f} at={at} size={62} color={i === 1 ? C.lavDeep : C.rose} />
              <span style={{fontFamily: SANS, fontWeight: 500, fontSize: 42, whiteSpace: 'nowrap', color: C.ink, opacity: 0.25 + 0.75 * prog(f, at, 8)}}>{t}</span>
            </div>
          ))}
        </Glass>
      </Left>
      {CHECKS.map(([, at], i) => (
        <Sparkle key={i} f={f} at={at + 0.1} x={110} y={640 + i * 115} size={44} />
      ))}
    </div>
  );
};

const EndCard: React.FC<{f: number}> = ({f}) => {
  if (f < 1100) return null;
  return (
    <>
      <div style={{...abs, top: 170, width: W, textAlign: 'center'}}>
        <Words f={f} words={[['you', 36.76], ['have', 37.12], ['to', 37.28]]} style={{justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 100, color: C.ink, lineHeight: 1}} />
        <div style={{opacity: prog(f, 37.46, 6), transform: `scale(${0.5 + 0.5 * pop(f, 37.46, 11, 150)})`}}>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 150, letterSpacing: '-0.04em', lineHeight: 1, background: `linear-gradient(90deg, ${C.rose}, ${C.peachDeep})`, WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 12px 26px rgba(217,138,156,0.35))'}}>
            try this
          </span>
        </div>
      </div>
      {/* product title card */}
      <div style={{...abs, left: 0, width: W, top: 1100, display: 'flex', justifyContent: 'center', opacity: prog(f, 38.6, 10), transform: `translateY(${(1 - pop(f, 38.6, 14, 140)) * 80}px)`}}>
        <Glass style={{padding: '22px 46px', borderRadius: 999, textAlign: 'center'}}>
          <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 26, letterSpacing: '0.35em', color: C.peachDeep}}>✦ TREATMENT ESSENCE ✦</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: C.ink, lineHeight: 1.1}}>galactomyces · niacinamide · cica</div>
        </Glass>
      </div>
      <Burst f={f} at={37.5} x={540} y={330} r={380} color="#fff" n={9} />
      <Burst f={f} at={38.7} x={540} y={1150} r={420} color={C.peachMid} n={7} />
      {Array.from({length: 6}).map((_, i) => (
        <Sparkle key={i} f={f} at={39.2 + i * 0.12} x={150 + ((i * 173) % 800)} y={500 + ((i * 263) % 700)} size={36 + (i % 3) * 14} />
      ))}
    </>
  );
};

export const FrontLayer: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Hook f={f} />
      <Smoother f={f} />
      <Actives f={f} />
      <Benefits f={f} />
      <BestPart f={f} />
      <Layering f={f} />
      <Checklist f={f} />
      <EndCard f={f} />
    </AbsoluteFill>
  );
};

