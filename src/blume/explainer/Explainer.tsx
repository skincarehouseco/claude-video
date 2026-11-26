import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import captions from '../captions.json';
import {FPS, pop, prog, rnd} from '../theme';
import {frameAt, inRoom, toScreen} from './frame';

/* ============================================================================================
 * Blumé Bright Toner Mist — TikTok explainer edit (reference: real-asset explainer + kinetic meme editing)
 * ========================================================================================== */

/* ---------------- fonts ---------------- */
const XSERIF = 'XSerif';
const XSERIF_I = 'XSerifIt';
const XSANS = 'XSans';
const XSANS_I = 'XSansIt';
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const h = delayRender('explainer fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(
    (
      [
        [XSERIF, 'fonts/PlayfairDisplay.ttf', {weight: '400 900'}],
        [XSERIF_I, 'fonts/PlayfairDisplay-Italic.ttf', {weight: '400', style: 'italic'}],
        [XSANS, 'fonts/Montserrat.ttf', {weight: '100 900'}],
        [XSANS_I, 'fonts/Montserrat-Italic.ttf', {weight: '100 900', style: 'italic'}],
      ] as [string, string, FontFaceDescriptors][]
    ).map(([f, file, d]) => new FontFace(f, `url(${staticFile(file)})`, d).load().then((x) => document.fonts.add(x))),
  )
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
}

/* ---------------- palette (chosen per scene) ---------------- */
const X = {
  coral: '#FF5A3C',
  coralDeep: '#E0402A',
  studioA: '#F8908A',
  studioB: '#EC6B66',
  yellow: '#FFD60A',
  serumA: '#FFE680',
  serumB: '#FFC23A',
  ink: '#111111',
  white: '#FFFFFF',
  blue: '#1E7BE0',
  skyA: '#CFE8FF',
  skyB: '#F5FAFF',
  lab: '#F2F3F5',
};

const abs = (x: number, y: number, s: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...s});
const stroke = (w: number, c = X.ink): React.CSSProperties => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill'});
const emoji = (code: string) => staticFile(`blume/emoji/${code}.svg`);
const img = (f: string) => staticFile(`blume/img/${f}`);
const slam = (t: number, at: number) => pop(t, at, {damping: 9, stiffness: 320, mass: 0.5});
const useT = () => useCurrentFrame() / FPS;

const Emoji: React.FC<{code: string; t: number; at: number; x: number; y: number; size: number; until?: number; rot?: number; bob?: number}> = ({code, t, at, x, y, size, until = 99, rot = 0, bob = 6}) => {
  if (t < at - 0.02 || t > until + 0.25) return null;
  const p = pop(t, at, {damping: 10, stiffness: 260, mass: 0.5});
  const o = 1 - prog(t, until, until + 0.2);
  return (
    <Img
      src={emoji(code)}
      style={abs(x, y + Math.sin((t - at) * 6) * bob, {width: size, height: size, opacity: o, transform: `scale(${p * (1 - 0.3 * (1 - o))}) rotate(${rot + (1 - p) * -30}deg)`, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.25))'})}
    />
  );
};

/* =============================== SPEAKER (cut-out + optional real room) =============================== */
const LOOK = 'brightness(1.03) contrast(1.04) saturate(1.05)';

const RoomFootage: React.FC = () => {
  const t = useT();
  if (!inRoom(t)) return null;
  const f = frameAt(t);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${f.ix}px, ${f.iy}px) scale(${f.is})`}}>
        <OffthreadVideo src={staticFile('blume/main.mp4')} muted style={{width: 1080, height: 1920, filter: LOOK}} />
      </div>
    </AbsoluteFill>
  );
};

const Speaker: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const f = frameAt(t);
  const room = inRoom(t);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Img
        src={staticFile(`blume/subject/s_${String(Math.min(frame + 1, 949)).padStart(4, '0')}.webp`)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transformOrigin: '0 0',
          transform: `translate(${f.ix}px, ${f.iy}px) scale(${f.is})`,
          filter: room ? LOOK : `${LOOK} drop-shadow(0 22px 34px rgba(0,0,0,0.28))`,
        }}
      />
    </AbsoluteFill>
  );
};

/* =============================== BACKDROPS (contextual replacements) =============================== */

/** coral studio = the toner's own product-photo world (colours sampled from the official packshot) */
const StudioBg: React.FC<{t: number; packshot?: 'left' | 'right' | 'none'; enterAt?: number; exitAt?: number}> = ({t, packshot = 'none', enterAt = 0, exitAt = 99}) => {
  const p = pop(t, enterAt, {damping: 16, stiffness: 120, mass: 0.9});
  const out = prog(t, exitAt, exitAt + 0.35);
  const right = packshot === 'right';
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${X.studioA} 0%, ${X.studioB} 62%, #F3A19B 62.2%, #F7B7B1 100%)`}}>
      {/* soft key light */}
      <div style={abs(-200, 200, {width: 1500, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)'})} />
      {packshot !== 'none' && (
        <div
          style={abs(right ? 600 : 10, right ? 520 : 560, {
            width: 380,
            height: 860,
            transform: `translateX(${(1 - p) * (right ? 600 : -600) + out * (right ? 700 : -700)}px) rotate(${(1 - p) * (right ? 10 : -10)}deg)`,
          })}
        >
          <Img src={staticFile('blume/pack_toner.png')} style={{position: 'absolute', left: 60, top: 0, height: 700, filter: 'drop-shadow(0 30px 30px rgba(120,20,20,0.35))'}} />
          {/* floor reflection */}
          <Img src={staticFile('blume/pack_toner.png')} style={{position: 'absolute', left: 60, top: 700, height: 700, transform: 'scaleY(-1)', transformOrigin: 'top', opacity: 0.18, maskImage: 'linear-gradient(180deg, rgba(0,0,0,1), rgba(0,0,0,0) 30%)', WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,1), rgba(0,0,0,0) 30%)'}} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/** manga speed lines radiating from her face — the "2 CARA!" reveal */
const SpeedBg: React.FC<{t: number}> = ({t}) => {
  const c = toScreen(t, 540, 520);
  const k = Math.floor(t * 15);
  return (
    <AbsoluteFill style={{background: '#FFFFFF', overflow: 'hidden'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 90}).map((_, i) => {
          const a = (i / 90) * Math.PI * 2 + rnd(i + k) * 0.03;
          const r0 = 260 + rnd(i * 3 + k) * 220;
          const w = 3 + rnd(i * 7 + k) * 11;
          const x1 = c.x + Math.cos(a) * r0;
          const y1 = c.y + Math.sin(a) * r0;
          const x2 = c.x + Math.cos(a) * 2200;
          const y2 = c.y + Math.sin(a) * 2200;
          const nx = -Math.sin(a) * w;
          const ny = Math.cos(a) * w;
          return <path key={i} d={`M${x1} ${y1} L${x2 + nx} ${y2 + ny} L${x2 - nx} ${y2 - ny} Z`} fill={X.ink} opacity={0.85} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** fresh, cool mist environment for "spray direct onto your skin" */
const MistBg: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 70% 30%, ${X.skyB} 0%, ${X.skyA} 55%, #A9D3FA 100%)`, overflow: 'hidden'}}>
    {Array.from({length: 70}).map((_, i) => {
      const r = 3 + rnd(i) * 9;
      const x = (rnd(i * 3) * 1200 - t * (30 + rnd(i) * 40)) % 1200;
      const y = rnd(i * 5) * 1900 + Math.sin(t + i) * 12;
      return <div key={i} style={abs(x < 0 ? x + 1200 : x, y, {width: r * 2, height: r * 2, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', filter: 'blur(1px)'})} />;
    })}
    <div style={abs(-300, 900, {width: 1700, height: 900, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', filter: 'blur(60px)'})} />
  </AbsoluteFill>
);

/** clean lab backdrop under the skin-diagram split */
const LabBg: React.FC = () => (
  <AbsoluteFill style={{background: X.lab}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(17,17,17,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(17,17,17,0.05) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
  </AbsoluteFill>
);

/** "first 50" race: finish-line energy for the promo */
const RaceBg: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: X.yellow, overflow: 'hidden'}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(17,17,17,0.13) 3px, transparent 3.5px)', backgroundSize: '28px 28px'}} />
    {/* checkered finish line */}
    <div style={abs(-100, 470, {width: 1300, height: 70, transform: 'rotate(-4deg)', backgroundImage: `repeating-conic-gradient(${X.ink} 0 25%, #fff 0 50%)`, backgroundSize: '70px 70px', boxShadow: '0 10px 0 rgba(0,0,0,0.15)'})} />
    {/* speed streaks */}
    {Array.from({length: 14}).map((_, i) => {
      const y = 620 + i * 90;
      const x = ((t * 900 + rnd(i) * 1600) % 1700) - 400;
      return <div key={i} style={abs(1080 - x, y, {width: 260 + rnd(i * 3) * 300, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.7)'})} />;
    })}
  </AbsoluteFill>
);

/** Snowmeric world: the serum's own yellow */
const SerumBg: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 75% 25%, #FFF6C8 0%, ${X.serumA} 40%, ${X.serumB} 100%)`, overflow: 'hidden'}}>
    <div style={abs(540 - 1100, 500 - 1100, {width: 2200, height: 2200, transform: `rotate(${t * 12}deg)`, background: 'repeating-conic-gradient(rgba(255,255,255,0.22) 0deg 9deg, rgba(255,255,255,0) 9deg 18deg)'})} />
  </AbsoluteFill>
);

/** CTA: both products, split coral / serum-yellow */
const CtaBg: React.FC<{t: number}> = ({t}) => {
  const p = pop(t, 30.15, {damping: 14, stiffness: 140, mass: 0.8});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `linear-gradient(115deg, ${X.studioB} 0 50%, ${X.serumB} 50% 100%)`}} />
      <Img src={staticFile('blume/pack_toner.png')} style={abs(-10, 560, {height: 640, transform: `translateX(${(1 - p) * -400}px) rotate(-6deg)`, filter: 'drop-shadow(0 26px 26px rgba(0,0,0,0.3))'})} />
      <Img src={staticFile('blume/pack_serum.png')} style={abs(880, 600, {height: 560, transform: `translateX(${(1 - p) * 400}px) rotate(6deg)`, filter: 'drop-shadow(0 26px 26px rgba(0,0,0,0.3))'})} />
    </AbsoluteFill>
  );
};

/** hook: the coral product world with the real toner standing behind her */
const HookBg: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{transform: `scale(${1.08 - 0.06 * prog(t, 0, 1.9)})`}}>
    <StudioBg t={t} packshot="left" enterAt={-1} />
  </AbsoluteFill>
);

type Scene = {a: number; b: number; Bg: React.FC<{t: number}>; tr: 'cut' | 'wipe' | 'circle' | 'zoom'; origin?: [number, number]};
const SCENES: Scene[] = [
  {a: 0, b: 1.93, Bg: HookBg, tr: 'cut'},
  {a: 1.93, b: 10.84, Bg: () => null, tr: 'wipe'}, // real room (footage layer)
  {a: 10.84, b: 14.95, Bg: ({t}) => <StudioBg t={t} packshot="right" enterAt={11.0} exitAt={13.6} />, tr: 'circle', origin: [900, 900]},
  {a: 14.95, b: 15.78, Bg: SpeedBg, tr: 'cut'},
  {a: 15.78, b: 17.85, Bg: MistBg, tr: 'wipe'},
  {a: 17.85, b: 20.8, Bg: () => null, tr: 'wipe'},
  {a: 20.8, b: 24.25, Bg: LabBg, tr: 'zoom'},
  {a: 24.25, b: 27.62, Bg: RaceBg, tr: 'cut'},
  {a: 27.62, b: 30.1, Bg: SerumBg, tr: 'circle', origin: [820, 500]},
  {a: 30.1, b: 31.64, Bg: CtaBg, tr: 'wipe'},
];
const TR = 0.3;
const Backdrop: React.FC = () => {
  const t = useT();
  let i = 0;
  while (i < SCENES.length - 1 && t >= SCENES[i + 1].a) i++;
  const cur = SCENES[i];
  const prev = i > 0 && t < cur.a + TR ? SCENES[i - 1] : null;
  const p = prog(t, cur.a, cur.a + TR);
  let clip: string | undefined;
  let transform: string | undefined;
  if (prev && cur.tr === 'wipe') clip = `polygon(0 0, ${p * 130}% 0, ${p * 130 - 30}% 100%, 0 100%)`;
  if (prev && cur.tr === 'circle') clip = `circle(${p * 2300}px at ${cur.origin?.[0] ?? 540}px ${cur.origin?.[1] ?? 900}px)`;
  if (prev && cur.tr === 'zoom') transform = `scale(${1.4 - 0.4 * p})`;
  return (
    <AbsoluteFill>
      {prev && <prev.Bg t={t} />}
      <AbsoluteFill style={{clipPath: clip, transform, opacity: prev && cur.tr === 'zoom' ? p : 1}}>
        <cur.Bg t={t} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =============================== FOREGROUND STORYTELLING =============================== */

/** routine checklist that builds as she names each step (reference: "Large pore routine 1–6") */
const STEPS = [
  {at: 6.0, text: 'Cuci muka', note: 'gentle cleanser', noteAt: 7.86, doneAt: 6.9},
  {at: 9.1, text: 'Tunggu kering', note: '', noteAt: 99, doneAt: 10.4},
  {at: 11.0, text: 'Toner Mist', note: 'Blumé Bright', noteAt: 12.44, doneAt: 12.9},
  {at: 21.0, text: 'Moisturizer', note: 'lock!', noteAt: 22.28, doneAt: 23.8},
];
const Checklist: React.FC<{t: number}> = ({t}) => {
  const vis = (t >= 3.3 && t < 13.78) || (t >= 23.62 && t < 24.25);
  if (!vis) return null;
  const recap = t >= 23.62;
  const enter = recap ? pop(t, 23.62) : pop(t, 3.3);
  const out = recap ? prog(t, 24.1, 24.25) : prog(t, 13.6, 13.78);
  const nHead = Math.floor(Math.max(0, t - 3.35) * 40);
  const head = 'CARA PAKAI TONER MIST';
  return (
    <div style={abs(recap ? 110 : 64, recap ? 330 : 170, {opacity: (1 - out) * Math.min(1, enter * 1.5), transform: `translateX(${(1 - enter) * -60}px) scale(${recap ? 1.25 : 1})`, transformOrigin: 'left top'})}>
      <div style={{fontFamily: XSANS_I, fontStyle: 'italic', fontWeight: 900, fontSize: 46, color: X.coral, ...stroke(8, '#fff'), whiteSpace: 'nowrap', letterSpacing: -0.5}}>
        {recap ? head : head.slice(0, nHead)}
      </div>
      {STEPS.map((s, i) => {
        const typed = recap ? s.text.length : Math.floor(Math.max(0, t - s.at) * 26);
        const done = t >= s.doneAt;
        const dp = slam(t, s.doneAt);
        const noteP = pop(t, s.noteAt);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, height: 62}}>
            <span style={{fontFamily: XSANS_I, fontStyle: 'italic', fontWeight: 900, fontSize: 46, color: X.coral, ...stroke(8, '#fff'), width: 44}}>{i + 1}.</span>
            <span style={{fontFamily: XSANS_I, fontStyle: 'italic', fontWeight: 800, fontSize: 46, color: '#fff', ...stroke(7, X.ink), whiteSpace: 'nowrap'}}>{s.text.slice(0, typed)}</span>
            {done && typed >= s.text.length && <Img src={emoji('2705')} style={{width: 46, height: 46, transform: `scale(${dp})`}} />}
            {s.note && t >= s.noteAt && !recap && (
              <span style={{fontFamily: XSERIF_I, fontStyle: 'italic', fontSize: 40, color: X.yellow, ...stroke(6, X.ink), transform: `scale(${noteP}) rotate(-4deg)`, display: 'inline-block', whiteSpace: 'nowrap'}}>({s.note})</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/** hook: big editorial serif, word-by-word, plus the "? ? ?" reaction row */
const Hook: React.FC<{t: number}> = ({t}) => {
  if (t > 2.15) return null;
  const out = prog(t, 1.9, 2.1);
  const w = (at: number) => pop(t, at, {damping: 12, stiffness: 220, mass: 0.5});
  return (
    <div style={{opacity: 1 - out}}>
      <div style={abs(70, 150, {width: 840})}>
        <div style={{display: 'flex', gap: 20, alignItems: 'baseline'}}>
          {['Macam', 'mana'].map((x, i) => (
            <span key={i} style={{fontFamily: XSERIF, fontWeight: 500, fontSize: 84, color: '#fff', textShadow: '0 6px 24px rgba(120,20,20,0.35)', opacity: w([0.0, 0.32][i]), transform: `translateY(${(1 - w([0.0, 0.32][i])) * 30}px)`, display: 'inline-block'}}>
              {x}
            </span>
          ))}
        </div>
        <div style={{display: 'flex', gap: 18, alignItems: 'baseline', marginTop: -10}}>
          <span style={{fontFamily: XSERIF, fontWeight: 500, fontSize: 84, color: '#fff', opacity: w(0.46), display: 'inline-block'}}>nak</span>
          <span style={{fontFamily: XSERIF_I, fontStyle: 'italic', fontSize: 150, lineHeight: 1, color: '#fff', textShadow: '0 8px 30px rgba(120,20,20,0.4)', opacity: w(0.56), transform: `scale(${0.6 + 0.4 * w(0.56)})`, display: 'inline-block', transformOrigin: 'left bottom'}}>
            pakai
          </span>
          <span style={{fontFamily: XSERIF, fontWeight: 900, fontSize: 150, lineHeight: 1, color: X.yellow, ...stroke(6, X.ink), transform: `scale(${slam(t, 1.6)}) rotate(10deg)`, display: 'inline-block'}}>?</span>
        </div>
      </div>
      {/* product name drops in on "Blumé Bright Toner Mist" */}
      <div style={abs(70, 420, {padding: '8px 26px', background: '#fff', borderRadius: 8, transform: `rotate(-2deg) scaleX(${w(0.76)})`, transformOrigin: 'left', boxShadow: '0 10px 24px rgba(0,0,0,0.2)'})}>
        <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 40, color: X.coralDeep, letterSpacing: 0.5, whiteSpace: 'nowrap'}}>BLUMÉ BRIGHT TONER MIST</span>
      </div>
      {/* ? ? ? on "ni?" */}
      {[0, 1, 2].map((i) => (
        <span key={i} style={abs(780 + i * 46, 560 + i * 70, {fontFamily: XSANS, fontWeight: 900, fontSize: 90 - i * 12, color: '#fff', ...stroke(8, X.ink), transform: `scale(${slam(t, 1.6 + i * 0.08)}) rotate(${12 - i * 10}deg)`, display: 'inline-block'})}>
          ?
        </span>
      ))}
    </div>
  );
};

/** dense foam rising for "cuci muka" */
const Foam: React.FC<{t: number}> = ({t}) => {
  if (t < 6.4 || t > 8.9) return null;
  const rise = prog(t, 6.5, 7.6) * (1 - prog(t, 8.55, 8.85));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 120}).map((_, i) => {
        const r = 14 + rnd(i) * 46;
        const x = rnd(i * 3) * 1140 - 30;
        const y = 1920 - rise * (220 + rnd(i * 7) * 260) + Math.sin(t * 3 + i) * 5;
        return (
          <div
            key={i}
            style={abs(x - r, y - r, {
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 32% 28%, #fff 0 16%, rgba(255,255,255,0.92) 40%, rgba(225,236,247,0.95) 75%, rgba(190,210,232,0.9))',
              boxShadow: 'inset -4px -6px 10px rgba(150,175,205,0.35)',
            })}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** "beberapa saat kemudian…" — the classic time-skip meme card */
const TimeSkip: React.FC<{t: number}> = ({t}) => {
  const a = 9.55;
  const b = 10.32;
  if (t < a - 0.02 || t > b + 0.02) return null;
  const p = slam(t, a);
  const o = 1 - prog(t, b - 0.08, b);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.35)'}} />
      <div style={abs(-80, 620, {width: 1240, height: 360, overflow: 'hidden', transform: `rotate(-5deg) scaleY(${p})`, boxShadow: '0 24px 60px rgba(0,0,0,0.45)'})}>
        <div style={abs(620 - 1000, 180 - 1000, {width: 2000, height: 2000, transform: `rotate(${(t - a) * 120}deg)`, background: 'repeating-conic-gradient(#FFD60A 0deg 9deg, #FFB800 9deg 18deg)'})} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{fontFamily: XSANS_I, fontStyle: 'italic', fontWeight: 900, fontSize: 60, color: '#fff', ...stroke(10, '#7A3A00'), textShadow: '0 8px 0 #7A3A00', transform: `scale(${0.7 + 0.3 * p})`, whiteSpace: 'nowrap'}}>
            beberapa saat kemudian…
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** fine mist particles (spray) */
const Mist: React.FC<{t: number; from: [number, number]; to: [number, number]; a: number; b: number; n?: number; spread?: number}> = ({t, from, to, a, b, n = 60, spread = 0.35}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const st = a + rnd(i) * (b - a - 0.35);
      const p = prog(t, st, st + 0.45 + rnd(i + 3) * 0.25, (x) => 1 - (1 - x) * (1 - x));
      if (p <= 0 || p >= 1) return null;
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const off = (rnd(i + 7) - 0.5) * spread;
      const r = 4 + rnd(i + 11) * 11;
      return <div key={i} style={abs(from[0] + dx * p - dy * off * p - r, from[1] + dy * p + dx * off * p - r, {width: r * 2, height: r * 2, borderRadius: '50%', background: i % 3 ? 'rgba(255,255,255,0.95)' : 'rgba(170,215,255,0.95)', filter: 'blur(1.2px)', opacity: Math.sin(p * Math.PI)})} />;
    })}
  </>
);

/** skewed label tag (CARA 1 / CARA 2 / STEP 4) */
const Tag: React.FC<{t: number; at: number; until: number; text: string; bg: string; x?: number; y?: number}> = ({t, at, until, text, bg, x = 70, y = 175}) => {
  if (t < at - 0.02 || t > until + 0.2) return null;
  const p = slam(t, at);
  const o = 1 - prog(t, until, until + 0.2);
  return (
    <div style={abs(x, y, {padding: '8px 26px 10px', background: bg, transform: `skewX(-10deg) scale(${p})`, transformOrigin: 'left center', opacity: o, boxShadow: '6px 6px 0 #111'})}>
      <span style={{display: 'inline-block', transform: 'skewX(10deg)', fontFamily: XSANS, fontWeight: 900, fontSize: 44, color: '#fff', letterSpacing: 1}}>{text}</span>
    </div>
  );
};

/** big kinetic word */
const Word: React.FC<{t: number; at: number; until: number; text: string; x: number; y: number; size: number; color: string; strokeC?: string; rot?: number; font?: string; italic?: boolean}> = ({
  t,
  at,
  until,
  text,
  x,
  y,
  size,
  color,
  strokeC = X.ink,
  rot = 0,
  font = XSANS,
  italic = false,
}) => {
  if (t < at - 0.03 || t > until + 0.2) return null;
  const p = slam(t, at - 0.02);
  const o = 1 - prog(t, until, until + 0.18);
  return (
    <div
      style={abs(x, y, {
        fontFamily: font,
        fontStyle: italic ? 'italic' : 'normal',
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color,
        ...stroke(Math.max(4, Math.round(size * 0.09)), strokeC),
        textShadow: `0 ${size * 0.07}px 0 ${strokeC}`,
        transform: `rotate(${rot}deg) scale(${(2 - p) * (1 - 0.25 * (1 - o))})`,
        transformOrigin: 'left center',
        opacity: Math.min(1, p * 2) * o,
        whiteSpace: 'nowrap',
      })}
    >
      {text}
    </div>
  );
};

/** split-screen skin science: real textbook illustrations, magnified, with toner + moisturizer animated in */
const SkinScience: React.FC<{t: number}> = ({t}) => {
  if (t < 20.8 || t > 23.75) return null;
  const enter = pop(t, 20.85, {damping: 15, stiffness: 140, mass: 0.8});
  const out = prog(t, 23.45, 23.7);
  const lens = pop(t, 21.25, {damping: 13, stiffness: 150, mass: 0.7});
  const drops = prog(t, 21.45, 22.15);
  const film = prog(t, 22.15, 22.45, (x) => 1 - (1 - x) ** 3);
  const lockP = slam(t, 22.28);
  const CX = 690;
  const CY = 430;
  const R = 255;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      {/* full skin block (left) */}
      <div style={abs(40, 165, {width: 300, height: 560, transform: `translateY(${(1 - enter) * -400}px)`})}>
        <Img src={img('skin_block.jpg')} style={{width: 280, borderRadius: 14, boxShadow: '0 14px 30px rgba(0,0,0,0.2)', mixBlendMode: 'multiply'}} />
        <div style={abs(0, -6, {fontFamily: XSANS, fontWeight: 900, fontSize: 30, color: X.ink, background: X.yellow, padding: '2px 12px', transform: 'rotate(-3deg)'})}>KULIT</div>
      </div>
      {/* zoom guide lines from the skin surface to the lens */}
      <svg width={1080} height={900} style={abs(0, 0, {opacity: lens})}>
        <path d={`M 250 300 L ${CX - R * 0.7} ${CY - R * 0.7}`} stroke={X.ink} strokeWidth={4} strokeDasharray="10 10" />
        <path d={`M 250 360 L ${CX - R * 0.75} ${CY + R * 0.65}`} stroke={X.ink} strokeWidth={4} strokeDasharray="10 10" />
        <circle cx={250} cy={330} r={34} fill="none" stroke={X.ink} strokeWidth={6} />
      </svg>
      {/* magnifier lens with the epidermis close-up */}
      <div style={abs(CX - R, CY - R, {width: R * 2, height: R * 2, borderRadius: '50%', overflow: 'hidden', border: `12px solid ${X.ink}`, background: '#fff', transform: `scale(${lens})`, boxShadow: '0 20px 40px rgba(0,0,0,0.3)'})}>
        <Img src={img('epidermis_crop.png')} style={{position: 'absolute', left: -40, top: -10, width: R * 2 + 80, height: R * 2 + 60, objectFit: 'cover', objectPosition: 'top'}} />
        {/* toner drops sinking into the top layer */}
        {Array.from({length: 9}).map((_, i) => {
          const p = prog(t, 21.45 + i * 0.07, 21.85 + i * 0.07, (x) => x * x);
          if (p <= 0 || p >= 1) return null;
          return <div key={i} style={abs(70 + i * 44, -30 + p * 150, {width: 26, height: 34, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: X.coral, opacity: 1 - p * 0.6, boxShadow: 'inset -3px -4px 0 rgba(0,0,0,0.15)'})} />;
        })}
        <div style={abs(0, 40, {width: R * 2, height: 70, background: `rgba(255,90,60,${0.35 * drops})`})} />
        {/* moisturizer film sealing the surface */}
        <div style={abs(-20, 0, {width: (R * 2 + 40) * film, height: 70, background: 'linear-gradient(180deg, #FFFFFF, #F4EEE8)', borderBottom: `6px solid ${X.ink}`, boxShadow: '0 6px 12px rgba(0,0,0,0.15)'})} />
      </div>
      {/* labels */}
      <div style={abs(CX + R - 40, CY - 60, {opacity: prog(t, 21.6, 21.8)})}>
        <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 34, color: '#fff', background: X.coral, padding: '4px 14px', display: 'inline-block', transform: 'rotate(4deg)'}}>TONER</span>
      </div>
      <div style={abs(CX - R - 10, CY - R - 40, {opacity: prog(t, 22.35, 22.55)})}>
        <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 34, color: X.ink, background: '#fff', border: `4px solid ${X.ink}`, padding: '2px 14px', display: 'inline-block', transform: 'rotate(-4deg)'}}>MOISTURIZER</span>
      </div>
      {/* padlock slam on "lock" */}
      {t >= 22.28 && (
        <Img src={emoji('1f512')} style={abs(CX + R - 110, CY - R - 70, {width: 150, height: 150, transform: `scale(${lockP}) rotate(${(1 - lockP) * 40}deg)`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'})} />
      )}
    </AbsoluteFill>
  );
};

/** TV colour bars glitch cutaway — covers the flash in the source footage (reference: Drive edit) */
const Glitch: React.FC<{t: number}> = ({t}) => {
  if (t < 24.2 || t >= 24.62) return null;
  const k = Math.floor(t * 30);
  const bars = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{display: 'flex', height: '70%', transform: `translateX(${(rnd(k) - 0.5) * 60}px)`}}>
        {bars.map((c, i) => (
          <div key={i} style={{flex: 1, background: c}} />
        ))}
      </div>
      <div style={{display: 'flex', height: '10%'}}>
        {[...bars].reverse().map((c, i) => (
          <div key={i} style={{flex: 1, background: i % 2 ? '#111' : c}} />
        ))}
      </div>
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 6px)'}} />
      {Array.from({length: 6}).map((_, i) => (
        <div key={i} style={abs(0, rnd(k * 7 + i) * 1920, {width: 1080, height: 8 + rnd(k + i) * 40, background: 'rgba(255,255,255,0.35)', transform: `translateX(${(rnd(k + i * 3) - 0.5) * 200}px)`})} />
      ))}
      <div style={abs(90, 820, {width: 900, textAlign: 'center', background: '#000', padding: '18px 0', transform: `rotate(-3deg) translateX(${(rnd(k * 3) - 0.5) * 16}px)`})}>
        <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 84, color: '#fff'}}>WAIT… ADA LAGI!</span>
      </div>
    </AbsoluteFill>
  );
};

/** promo: 50 counter + racers + cart */
const Promo: React.FC<{t: number}> = ({t}) => {
  if (t < 24.55 || t > 27.8) return null;
  const n = Math.round(interpolate(t, [24.72, 25.4], [0, 50], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const p50 = slam(t, 24.72);
  const out = prog(t, 27.55, 27.75);
  const toner = toScreen(t, 880, 900);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Word t={t} at={24.6} until={27.6} text="PSST… PROMO!" x={80} y={180} size={44} color="#fff" rot={-3} />
      <div style={abs(70, 230, {display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${p50})`, transformOrigin: 'left center'})}>
        <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 210, lineHeight: 1, color: X.coralDeep, ...stroke(12, X.ink), textShadow: `0 14px 0 ${X.ink}`}}>{n}</span>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 64, color: '#fff', ...stroke(9, X.ink), lineHeight: 1.05}}>ORANG</span>
          <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 64, color: '#fff', ...stroke(9, X.ink), lineHeight: 1.05, opacity: prog(t, 25.9, 26.0), transform: `scale(${slam(t, 25.92)})`, transformOrigin: 'left'}}>TERAWAL!</span>
        </div>
      </div>
      {/* racers dashing for the finish line */}
      {[0, 1, 2, 3].map((i) => {
        const x = interpolate(t, [25.6 + i * 0.12, 27.2 + i * 0.12], [-200, 1200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <Img key={i} src={emoji('1f3c3-200d-2640-fe0f')} style={abs(x, 520 + (i % 2) * 40 + Math.abs(Math.sin(t * 18 + i)) * -14, {width: 110, height: 110, transform: 'scaleX(-1)'})} />;
      })}
      {/* cart on "purchase" pointing at the toner she holds */}
      {t >= 26.5 && (
        <div style={abs(Math.min(toner.x - 360, 520), Math.min(toner.y - 40, 1150), {display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${slam(t, 26.52)}) rotate(-4deg)`})}>
          <Img src={emoji('1f6d2')} style={{width: 96, height: 96}} />
          <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 40, color: '#fff', background: X.ink, padding: '6px 14px'}}>BELI TONER</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** free serum reveal */
const FreeSerum: React.FC<{t: number}> = ({t}) => {
  if (t < 27.62 || t > 30.2) return null;
  const out = prog(t, 30.0, 30.15);
  const ps = pop(t, 28.72, {damping: 13, stiffness: 140, mass: 0.8});
  const free = slam(t, 29.78);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={abs(70, 170, {display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${pop(t, 28.06)})`, transformOrigin: 'left'})}>
        <Img src={emoji('1f381')} style={{width: 90, height: 90}} />
        <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 50, color: '#fff', ...stroke(8, X.ink)}}>AKAN DAPAT…</span>
      </div>
      <div style={abs(70, 270, {opacity: prog(t, 28.72, 28.9)})}>
        <span style={{fontFamily: XSERIF_I, fontStyle: 'italic', fontSize: 84, color: X.ink, lineHeight: 1}}>Snowmeric</span>
        <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 52, color: X.ink, marginLeft: 12}}>SERUM</span>
      </div>
      {/* real packshot beside her head */}
      <Img src={staticFile('blume/pack_serum.png')} style={abs(770, 280, {height: 380, transform: `translateY(${(1 - ps) * 500}px) rotate(${6 + Math.sin(t * 2) * 2}deg)`, filter: 'drop-shadow(0 20px 22px rgba(120,80,0,0.35))'})} />
      {/* FREE stamp */}
      {t >= 29.76 && (
        <div style={abs(600, 620, {transform: `rotate(-12deg) scale(${2.2 - 1.2 * free})`, opacity: Math.min(1, free * 2), border: `10px solid ${X.coralDeep}`, borderRadius: 18, padding: '4px 26px', background: 'rgba(255,255,255,0.92)'})}>
          <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 110, color: X.coralDeep, letterSpacing: 4}}>FREE!</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** CTA: Grab yours now! */
const Cta: React.FC<{t: number}> = ({t}) => {
  if (t < 30.1) return null;
  return (
    <AbsoluteFill>
      <Word t={t} at={30.14} until={40} text="GRAB" x={80} y={180} size={104} color="#fff" rot={-4} />
      <Word t={t} at={30.6} until={40} text="YOURS" x={445} y={160} size={104} color={X.yellow} rot={-4} />
      <div style={abs(300, 320, {transform: `rotate(-4deg) scale(${slam(t, 30.76)})`, background: X.coralDeep, padding: '4px 30px', boxShadow: '8px 8px 0 #111'})}>
        <span style={{fontFamily: XSANS, fontWeight: 900, fontSize: 110, color: '#fff'}}>NOW!</span>
      </div>
      <Emoji code="1f447" t={t} at={30.9} x={150} y={1360} size={120} bob={16} />
    </AbsoluteFill>
  );
};

const Storytelling: React.FC = () => {
  const t = useT();
  const palm = toScreen(t, 820, 1110);
  const nozzle = toScreen(t, 300, 900);
  const cheek = toScreen(t, 400, 600);
  const face = toScreen(t, 330, 560);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Hook t={t} />
      <Checklist t={t} />
      {/* step 1 */}
      <Foam t={t} />
      <Emoji code="1f9fc" t={t} at={6.75} until={8.6} x={800} y={760} size={130} rot={10} />
      {/* step 2 */}
      <Emoji code="23f3" t={t} at={8.9} until={10.75} x={790} y={560} size={120} rot={-8} />
      <TimeSkip t={t} />
      {/* step 3: name callout next to the packshot */}
      <Word t={t} at={12.44} until={13.6} text="Blumé Bright" x={520} y={440} size={54} color="#fff" font={XSERIF_I} italic strokeC={X.coralDeep} rot={-3} />
      {/* 2 cara */}
      <Word t={t} at={15.06} until={15.75} text="2" x={70} y={250} size={330} color={X.coralDeep} rot={-6} />
      <Word t={t} at={15.2} until={15.75} text="CARA!" x={60} y={640} size={104} color="#fff" rot={-8} />
      <Emoji code="1f440" t={t} at={14.3} until={15.0} x={800} y={420} size={110} />
      {/* cara 1 */}
      <Tag t={t} at={15.82} until={17.8} text="CARA 1" bg={X.blue} />
      <Word t={t} at={16.36} until={17.8} text="SPRAY" x={530} y={300} size={92} color="#fff" strokeC={X.blue} rot={4} />
      <Word t={t} at={16.64} until={17.8} text="DIRECT!" x={500} y={400} size={92} color={X.yellow} rot={4} />
      <Emoji code="1f4a6" t={t} at={16.4} until={17.8} x={face.x + 120} y={face.y - 200} size={110} />
      <Mist t={t} from={[1000, 1250]} to={[face.x + 40, face.y]} a={16.2} b={17.85} n={90} />
      {/* cara 2: spray -> tangan -> pat-pat */}
      <Tag t={t} at={17.9} until={20.75} text="CARA 2" bg={X.coralDeep} />
      <Word t={t} at={18.5} until={20.75} text="SPRAY" x={80} y={290} size={58} color="#fff" />
      <Word t={t} at={19.22} until={20.75} text="→ TANGAN" x={330} y={290} size={58} color={X.yellow} />
      <Word t={t} at={19.84} until={20.75} text="→ PAT-PAT!" x={300} y={370} size={70} color="#fff" strokeC={X.coralDeep} rot={-3} />
      <Mist t={t} from={[nozzle.x + 40, nozzle.y]} to={[palm.x - 40, palm.y]} a={18.3} b={19.05} n={70} spread={0.25} />
      {[19.9, 20.18, 20.45].map((at, i) => (
        <Word key={i} t={t} at={at} until={at + 0.32} text="PAT!" x={Math.max(70, cheek.x - 330 + (i % 2) * 30)} y={cheek.y - 60 + i * 70} size={66} color={X.yellow} rot={i % 2 ? 8 : -8} />
      ))}
      {/* step 4: skin science */}
      <Tag t={t} at={20.86} until={23.5} text="STEP 4" bg={X.ink} x={70} y={760} />
      <SkinScience t={t} />
      {/* promo / free / cta */}
      <Promo t={t} />
      <FreeSerum t={t} />
      <Cta t={t} />
      <Glitch t={t} />
    </AbsoluteFill>
  );
};

/* =============================== SUBTITLES (supporting, reference-style serif) =============================== */
type Wd = {text: string; start: number; end: number; hl: boolean};
type Ch = {start: number; end: number; words: Wd[]};
const CH = captions as Ch[];
const Subtitles: React.FC = () => {
  const t = useT();
  // the big typography already carries these words, so the subtitle steps aside
  if (t < 1.93 || (t >= 24.2 && t < 24.62) || t >= 30.1) return null;
  const c = CH.find((x) => t >= x.start - 0.04 && t < x.end);
  if (!c) return null;
  const y = t >= 20.8 && t < 23.7 ? 1440 : 1335;
  const e = pop(t, c.start - 0.04, {damping: 16, stiffness: 260, mass: 0.5});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={abs(70, y, {width: 835, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, opacity: Math.min(1, e * 1.5), transform: `translateY(${(1 - e) * 10}px)`})}>
        {c.words.map((w, i) => (
          <span key={i} style={{fontFamily: XSERIF, fontWeight: 700, fontSize: 54, lineHeight: 1.15, color: w.hl ? X.yellow : '#fff', ...stroke(9, X.ink), textShadow: '0 4px 12px rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>
            {w.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* =============================== SOUND =============================== */
type S = [number, string, number];
const SFX: S[] = [
  [0.0, 'whoosh', 0.35],
  [0.05, 'explainerpop', 0.5],
  [0.56, 'pop', 0.4],
  [0.76, 'sweep', 0.4],
  [1.6, 'hardpop', 0.35],
  [1.68, 'hardpop', 0.3],
  [1.76, 'hardpop', 0.3],
  [1.93, 'whoosh', 0.3],
  [3.33, 'typing', 0.28],
  [6.0, 'typing', 0.22],
  [6.55, 'bubble', 0.35],
  [6.75, 'pop', 0.35],
  [6.9, 'click', 0.5],
  [7.86, 'explainerpop', 0.5],
  [8.9, 'pop', 0.35],
  [9.1, 'typing', 0.22],
  [9.53, 'scratch', 0.3],
  [9.56, 'tick', 0.35],
  [10.3, 'sweep', 0.3],
  [10.4, 'ding', 0.4],
  [10.84, 'whoosh', 0.35],
  [11.0, 'typing', 0.22],
  [11.05, 'airwhoosh', 0.3],
  [12.44, 'sparkle', 0.3],
  [12.9, 'click', 0.5],
  [13.6, 'sweep', 0.25],
  [14.3, 'pop', 0.35],
  [14.95, 'zoomimpact', 0.5],
  [15.06, 'hardpop', 0.4],
  [15.2, 'explainerpop', 0.5],
  [15.78, 'whoosh', 0.3],
  [15.82, 'pop', 0.4],
  [16.25, 'spray', 0.3],
  [16.36, 'explainerpop', 0.45],
  [16.64, 'explainerpop', 0.45],
  [16.95, 'spray', 0.2],
  [17.85, 'whoosh', 0.3],
  [17.9, 'pop', 0.4],
  [18.32, 'spray', 0.32],
  [18.5, 'pop', 0.35],
  [19.22, 'pop', 0.35],
  [19.84, 'explainerpop', 0.45],
  [19.9, 'boing', 0.18],
  [20.18, 'pop', 0.3],
  [20.45, 'pop', 0.3],
  [20.8, 'whoosh', 0.35],
  [20.86, 'pop', 0.35],
  [21.0, 'typing', 0.15],
  [21.25, 'airwhoosh', 0.3],
  [21.45, 'bubble', 0.3],
  [22.15, 'sweep', 0.3],
  [22.28, 'zoomimpact', 0.5],
  [22.3, 'click', 0.6],
  [23.62, 'whoosh', 0.25],
  [23.8, 'achieve', 0.35],
  [24.18, 'scratch', 0.4],
  [24.22, 'buzzer', 0.22],
  [24.6, 'whoosh', 0.3],
  [24.72, 'zoomimpact', 0.5],
  [24.75, 'tick', 0.3],
  [25.42, 'servicebell', 0.4],
  [25.6, 'airwhoosh', 0.3],
  [25.92, 'hardpop', 0.4],
  [26.52, 'coins', 0.4],
  [27.62, 'whoosh', 0.3],
  [28.06, 'pop', 0.4],
  [28.72, 'sweep', 0.35],
  [29.76, 'zoomimpact', 0.55],
  [29.8, 'achieve', 0.4],
  [30.1, 'whoosh', 0.35],
  [30.14, 'hardpop', 0.4],
  [30.6, 'hardpop', 0.4],
  [30.76, 'explainerpop', 0.55],
  [30.9, 'pop', 0.35],
];
const Sound: React.FC = () => {
  const vol = useMemo(() => {
    const n = 949;
    const sp = new Array(n).fill(0);
    CH.forEach((c) => c.words.forEach((w) => {
      for (let f = Math.round((w.start - 0.15) * FPS); f <= Math.round((w.end + 0.25) * FPS); f++) if (f >= 0 && f < n) sp[f] = 1;
    }));
    return sp.map((_, f) => {
      let s = 0;
      let k = 0;
      for (let j = f - 10; j <= f + 10; j++) if (j >= 0 && j < n) {
        s += sp[j];
        k++;
      }
      const v = s / k;
      return 0.045 * v + 0.1 * (1 - v);
    });
  }, []);
  return (
    <>
      <Audio src={staticFile('blume/audio/voice.wav')} volume={1} />
      <Audio src={staticFile('blume/audio/music.wav')} volume={(f) => vol[Math.min(f, 948)] * interpolate(f, [0, 6, 930, 949], [0, 1, 1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      {SFX.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={90} layout="none">
          <Audio src={staticFile(`blume/sfx/${name}.wav`)} volume={v * 0.8} />
        </Sequence>
      ))}
    </>
  );
};

/** quick white flash on the big beats (hard cuts / slams) */
const Flash: React.FC = () => {
  const t = useT();
  const hit = [14.95, 15.06, 22.28, 24.72, 29.76].find((a) => t >= a && t < a + 0.1);
  if (hit === undefined) return null;
  return <AbsoluteFill style={{background: '#fff', opacity: 0.6 * (1 - (t - hit) / 0.1)}} />;
};

export const BlumeExplainer: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Backdrop />
    <RoomFootage />
    <Speaker />
    <Storytelling />
    <Subtitles />
    <Flash />
    <Sound />
  </AbsoluteFill>
);

