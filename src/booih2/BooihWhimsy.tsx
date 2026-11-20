import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';

/* booih foam — master whimsical edit shared by two versions:
   A = original wall, enhanced (public/booih2/enhanced.mp4)
   B = new generated affiliate-room background (public/booih2/aesthetic.mp4)
   The clip has no speech, so on-screen text is title/callout copy (previously approved booih lines), not captions. */

const FONTS: [string, string, FontFaceDescriptors][] = [
  ['BWNunito', 'fonts/Nunito.ttf', {weight: '200 1000'}],
  ['BWRound', 'fonts/Fredoka.ttf', {weight: '300 700'}],
  ['BWSerif', 'fonts/PlayfairDisplay-Italic.ttf', {weight: '400 900', style: 'italic'}],
];
if (typeof window !== 'undefined' && 'FontFace' in window) {
  const h = delayRender('booih2 fonts', {timeoutInMilliseconds: 120000, retries: 2});
  Promise.all(FONTS.map(([fam, file, d]) => new FontFace(fam, `url(${staticFile(file)})`, d).load().then((f) => document.fonts.add(f))))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
}

export const BW_DURATION = 1085; // 36.17 s @ 30 fps (full original length)
const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const pop = (f: number, at: number, d = 11, st = 220) => (f < sec(at) ? 0 : spring({frame: f - sec(at), fps: FPS, config: {damping: d, stiffness: st, mass: 0.6}}));
const out = (f: number, end: number, d = 0.25) => 1 - c01((f - sec(end - d)) / (d * FPS));

const P = {
  cream: '#FFF9F1', warm: '#FFFDF8', butter: '#F7E3A1', pink: '#F6C9D0', pinkDeep: '#E893A3', blue: '#C9E2F4', blueDeep: '#8DBFE3',
  sage: '#B9D3AE', sageDeep: '#86A879', beige: '#EADBC8', cocoa: '#4E3B30',
};
const SAFE = {top: 230, bottom: 1498, left: 86, right: 896};
const CX = (SAFE.left + SAFE.right) / 2;
const NUN = 'BWNunito';
const ROUND = 'BWRound';
const SERIF = 'BWSerif';

/* ---------------- camera: identical moves for both versions ---------------- */
const ease = Easing.inOut(Easing.cubic);
const PUSH: [number, number, number][] = [
  [8.6, 12.0, 1.06], // heart
  [20.2, 24.0, 1.06], // donut
  [24.5, 29.0, 1.03],
];
const zoomAt = (t: number) => {
  let z = 1.0 + 0.02 * Math.sin(t / 3); // breathing drift
  for (const [a, b, s] of PUSH) {
    if (t > a && t < b + 0.8) z *= 1 + (s - 1) * ease(c01((t - a) / 0.8)) * (1 - ease(c01((t - b) / 0.8)));
  }
  return z * (1 + 0.04 * (1 - Easing.out(Easing.cubic)(c01(t / 1.2)))); // gentle settle at the start
};

/* ---------------- text block: Nunito ExtraBold, cocoa on cream pill, pastel marker on the keyword ---------------- */
const Callout: React.FC<{at: number; end: number; text: string; mark?: string; color?: string; top?: number; align?: 'left' | 'center'}> = ({at, end, text, mark, color = P.butter, top = SAFE.top + 20, align = 'center'}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(end)) return null;
  const k = pop(f, at, 15, 200) * out(f, end);
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', top, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 18}px)`}}>
      <div style={{background: 'rgba(255,251,244,0.92)', borderRadius: 30, padding: '12px 28px 16px', boxShadow: `0 10px 26px rgba(90,64,44,0.16), inset 0 0 0 3px ${color}`, maxWidth: 760, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14}}>
        {words.map((w, i) => {
          const wk = pop(f, at + 0.05 + i * 0.06, 14, 240);
          const isMark = mark && mark.split(' ').includes(w.replace(/[!?.,~]/g, ''));
          return (
            <span key={i} style={{position: 'relative', zIndex: 0, display: 'inline-block', fontFamily: NUN, fontWeight: 800, fontSize: 54, lineHeight: 1.25, color: P.cocoa, opacity: c01(wk * 1.5), transform: `translateY(${(1 - wk) * 10}px)`}}>
              {isMark && <span style={{position: 'absolute', left: -6, right: -6, top: '45%', bottom: '6%', background: color, borderRadius: 10, zIndex: -1, transform: `scaleX(${c01((f - sec(at) - 6) / 8)})`, transformOrigin: '0 50%'}} />}
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* bubbly bouncing hook "mainan ke SABUN?!" */
const Bubbly: React.FC<{text: string; size: number; fill: string}> = ({text, size, fill}) => (
  <span style={{fontFamily: ROUND, fontWeight: 600, fontSize: size, lineHeight: 1, color: fill, WebkitTextStroke: `${size * 0.1}px #fff`, paintOrder: 'stroke fill', filter: 'drop-shadow(0 6px 10px rgba(90,64,44,0.22))', whiteSpace: 'nowrap'}}>{text}</span>
);
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f > sec(3.9)) return null;
  const o = out(f, 3.9, 0.3);
  const row = (word: string, at: number, size: number, cols: string[]) => (
    <div style={{display: 'flex'}}>
      {word.split('').map((ch, i) => {
        const t0 = at + i * 0.05;
        const p = pop(f, t0, 8, 280);
        const k = f - sec(t0);
        const st = k > 0 ? 0.2 * Math.sin(k * 0.8) * Math.exp(-k * 0.15) : 0;
        return ch === ' ' ? (
          <span key={i} style={{width: size * 0.3}} />
        ) : (
          <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * 40 + Math.sin((f - i * 4) / 6) * 4}px) scale(${p * (1 + st)}, ${p * (1 - st)})`, transformOrigin: '50% 90%'}}>
            <Bubbly text={ch} size={size} fill={cols[i % cols.length]} />
          </span>
        );
      })}
    </div>
  );
  return (
    <div style={{position: 'absolute', top: SAFE.top + 10, left: SAFE.left + 10, opacity: o, transform: `rotate(-3deg)`}}>
      {row('mainan ke', 0.25, 92, [P.blueDeep, P.sageDeep, '#E0B85A', P.pinkDeep])}
      {row('SABUN?!', 0.75, 150, [P.pinkDeep, '#F2A9B5', P.pinkDeep, '#F2A9B5', P.pinkDeep, '#E0B85A', '#E0B85A'])}
    </div>
  );
};

/* ---------------- 3-step how-to infographic (only what the video shows) ---------------- */
const Steps: React.FC = () => {
  const f = useCurrentFrame();
  const a = 4.0, e = 8.3;
  if (f < sec(a) || f > sec(e)) return null;
  const steps = [
    {n: 1, t: 'Spray', c: P.blue, icon: 'spray'},
    {n: 2, t: 'Jadi foam', c: P.sage, icon: 'foam'},
    {n: 3, t: 'Bentuk ikut suka', c: P.pink, icon: 'heart'},
  ];
  return (
    <div style={{position: 'absolute', top: SAFE.top + 10, left: SAFE.left + 6, display: 'flex', flexDirection: 'column', gap: 12, opacity: out(f, e)}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 42, color: P.cocoa, textShadow: '0 0 14px rgba(255,251,244,1), 0 0 4px #fff', opacity: pop(f, a, 14)}}>cara main</div>
      {steps.map((s, i) => {
        const k = pop(f, a + 0.2 + i * 0.45, 12, 220);
        return (
          <div key={s.n} style={{display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,251,244,0.93)', borderRadius: 26, padding: '8px 22px 8px 8px', boxShadow: '0 8px 18px rgba(90,64,44,0.14)', transform: `translateX(${(1 - k) * -40}px)`, opacity: c01(k * 1.5), width: 'fit-content'}}>
            <svg width={52} height={52} viewBox="-26 -26 52 52">
              <circle r={24} fill={s.c} />
              {s.icon === 'spray' && <g fill="none" stroke={P.cocoa} strokeWidth={3} strokeLinecap="round"><rect x={-8} y={-4} width={14} height={20} rx={4} fill="#fff" /><path d="M-4 -4 v-6 h10" /><path d="M10 -12 l5 -3 M10 -9 l6 0 M10 -6 l5 3" /></g>}
              {s.icon === 'foam' && <g fill="#fff" stroke={P.cocoa} strokeWidth={2.5}><circle cx={-7} cy={4} r={8} /><circle cx={6} cy={2} r={9} /><circle cx={0} cy={-8} r={7} /></g>}
              {s.icon === 'heart' && <path d="M0 12 C-12 4 -16 -4 -13 -9 C-10 -14 -3 -13 0 -7 C3 -13 10 -14 13 -9 C16 -4 12 4 0 12Z" fill="#fff" stroke={P.cocoa} strokeWidth={2.5} />}
            </svg>
            <span style={{fontFamily: NUN, fontWeight: 800, fontSize: 40, color: P.cocoa}}>{s.t}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ---------------- doodles ---------------- */
const STAR = 'M0 -20 C3 -6 6 -3 20 0 C6 3 3 6 0 20 C-3 6 -6 3 -20 0 C-6 -3 -3 -6 0 -20Z';
const HEART = 'M0 22 C-20 8 -32 -4 -28 -16 C-24 -30 -8 -30 0 -17 C8 -30 24 -30 28 -16 C32 -4 20 8 0 22Z';
const Doodles: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const sp = (x: number, y: number, s: number, at: number, end: number, col: string, ph = 0) =>
    t >= at && t <= end ? <path key={`${x}${y}${at}`} d={STAR} transform={`translate(${x} ${y + Math.sin((f + ph) / 12) * 5}) scale(${s * pop(f, at, 9) * out(f, end) * (0.85 + 0.15 * Math.sin((f + ph) / 6))}) rotate(${Math.sin((f + ph) / 15) * 12})`} fill={col} stroke={P.cocoa} strokeWidth={2} /> : null;
  const ht = (x: number, y: number, s: number, at: number, end: number, col: string, rot = 0) =>
    t >= at && t <= end ? <path key={`h${x}${y}${at}`} d={HEART} transform={`translate(${x} ${y + Math.sin((f + x) / 14) * 6}) scale(${s * pop(f, at, 9) * out(f, end)}) rotate(${rot + Math.sin((f + x) / 10) * 8})`} fill={col} stroke={P.cocoa} strokeWidth={2} /> : null;
  // toss arc 15.0–17.6
  const arcK = c01((t - 15.0) / 0.5) * out(f, 17.6);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {/* spray: little sparkles near the nozzle */}
      {sp(860, 520, 1.2, 0.5, 3.6, P.butter, 0)}
      {sp(760, 420, 0.8, 0.8, 3.6, '#fff', 20)}
      {/* heart */}
      {ht(140, 820, 1.5, 8.8, 12.1, P.pink, -12)}
      {ht(880, 760, 1.1, 9.0, 12.1, P.pinkDeep, 10)}
      {ht(170, 1180, 0.9, 9.2, 12.1, P.blue, 8)}
      {sp(860, 1100, 1.0, 9.3, 12.1, P.butter, 30)}
      {/* toss arc */}
      {arcK > 0 && (
        <g opacity={arcK}>
          <path d="M300 1250 Q540 520 820 860" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeDasharray="2 22" />
          <path d={STAR} transform={`translate(820 860) scale(${1.6 * arcK})`} fill={P.butter} stroke={P.cocoa} strokeWidth={2} />
        </g>
      )}
      {/* donut sparkles */}
      {sp(200, 700, 1.4, 20.3, 24.0, P.butter, 0)}
      {sp(870, 720, 1.0, 20.5, 24.0, '#fff', 25)}
      {sp(860, 1180, 1.2, 20.7, 24.0, P.blue, 50)}
      {sp(170, 1150, 0.9, 20.9, 24.0, P.pink, 75)}
      {/* end sparkles */}
      {sp(200, 600, 1.4, 34.0, 36.2, P.butter, 0)}
      {sp(870, 640, 1.1, 34.2, 36.2, '#fff', 30)}
    </svg>
  );
};

/* bubbly onomatopoeia sticker */
const Sticker: React.FC<{text: string; at: number; dur: number; x: number; y: number; fill: string; rot?: number; size?: number}> = ({text, at, dur, x, y, fill, rot = 0, size = 76}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(at + dur)) return null;
  const p = pop(f, at, 9, 260);
  const k = f - sec(at);
  const st = 0.18 * Math.sin(k * 0.7) * Math.exp(-k * 0.13);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot + Math.sin(f / 5) * 3}deg) scale(${p * out(f, at + dur) * (1 + st)}, ${p * out(f, at + dur) * (1 - st)})`}}>
      <Bubbly text={text} size={size} fill={fill} />
    </div>
  );
};

/* ---------------- end card: booih logo + tagline ---------------- */
const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const at = 33.6;
  if (f < sec(at)) return null;
  const p = pop(f, at, 8, 240);
  const k = f - sec(at);
  const st = 0.15 * Math.sin(k * 0.7) * Math.exp(-k * 0.12);
  const tg = pop(f, at + 0.45, 11);
  return (
    <div style={{position: 'absolute', top: 700, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Img src={staticFile('brand/booih_logo.png')} style={{width: 560, height: (560 * 477) / 858, transform: `scale(${p * (1 + st)}, ${p * (1 - st)}) rotate(${Math.sin(f / 10) * 2}deg)`, filter: 'drop-shadow(0 12px 22px rgba(80,40,60,0.25))'}} />
      <div style={{marginTop: 10, background: P.pinkDeep, color: '#fff', fontFamily: NUN, fontWeight: 800, fontSize: 46, padding: '8px 30px 12px', borderRadius: 40, border: '5px solid #fff', boxShadow: '0 10px 20px rgba(120,40,70,0.25)', transform: `scale(${tg}) rotate(-2deg)`, opacity: c01(tg * 1.5), whiteSpace: 'nowrap'}}>
        Booih dulu, baru mandi!
      </div>
    </div>
  );
};

/* small product tag next to the can at the start (product name only, from the can label / brand) */
const ProductTag: React.FC = () => {
  const f = useCurrentFrame();
  const a = 1.6, e = 3.8;
  if (f < sec(a) || f > sec(e)) return null;
  const k = pop(f, a, 12) * out(f, e);
  return (
    <div style={{position: 'absolute', top: 1180, left: SAFE.left + 10, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,251,244,0.94)', borderRadius: 26, padding: '6px 18px 6px 8px', boxShadow: '0 8px 18px rgba(90,64,44,0.18)', transform: `scale(${k}) rotate(-2deg)`, transformOrigin: '0 50%'}}>
      <Img src={staticFile('brand/booih_logo.png')} style={{width: 110, height: (110 * 477) / 858}} />
      <span style={{fontFamily: NUN, fontWeight: 800, fontSize: 34, color: P.cocoa}}>Fun Foam Cleanser</span>
    </div>
  );
};

/* ---------------- sound: original foam sounds (cleaned) + soft SFX ---------------- */
const SFX: [number, string, number][] = [
  [0.25, 'twinkle', 0.07], [0.75, 'boing2', 0.07], [0.35, 'psst', 0.1], [1.6, 'bubble_pop', 0.08],
  [4.0, 'whoosh', 0.05], [4.2, 'bubble_pop', 0.07], [4.65, 'bubble_pop', 0.07], [5.1, 'bubble_pop', 0.07],
  [7.4, 'slide_up', 0.07], [8.0, 'pop', 0.07],
  [8.8, 'heart', 0.08], [9.0, 'bubble_pop', 0.06], [9.2, 'bubble_pop', 0.06],
  [12.5, 'squish2', 0.09], [12.6, 'bubble_pop', 0.06], [13.6, 'squish2', 0.07],
  [15.0, 'slide_up', 0.08], [15.4, 'boing2', 0.07], [16.6, 'slide_down', 0.06], [17.0, 'pop', 0.07],
  [20.2, 'twinkle', 0.07], [20.4, 'bubble_pop', 0.06],
  [24.6, 'squish2', 0.08], [25.1, 'bubble_pop', 0.06], [26.5, 'squish2', 0.07],
  [29.6, 'pop', 0.07], [33.5, 'whoosh', 0.06], [33.6, 'tada', 0.09], [34.1, 'boing2', 0.06],
];
const Sound: React.FC = () => (
  <>
    <Audio src={staticFile('booih2/foam_audio.wav')} volume={(fr) => interpolate(fr, [BW_DURATION - 15, BW_DURATION], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    {SFX.map(([at, name, v], i) => (
      <Sequence key={i} from={sec(at)} durationInFrames={45} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

export const BooihWhimsy: React.FC<{version: 'A' | 'B'}> = ({version}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const src = version === 'A' ? 'booih2/enhanced.mp4' : 'booih2/aesthetic.mp4';
  const fade = interpolate(f, [0, 5, BW_DURATION - 10, BW_DURATION], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: P.cream}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <AbsoluteFill style={{transform: `scale(${zoomAt(t)})`, transformOrigin: '50% 48%'}}>
          <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          {/* B only: the last ~2 s is a defocused close-up where the foam fills the frame, so the matte is not meaningful;
              dissolve to the enhanced original footage there (the new room is not visible in that shot anyway) */}
          {version === 'B' && t > 34.0 && (
            <AbsoluteFill style={{opacity: c01((t - 34.0) / 0.35)}}>
              <OffthreadVideo src={staticFile('booih2/enhanced.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
      <Doodles />
      <Hook />
      <ProductTag />
      <Steps />
      <Callout at={8.7} end={12.2} text="boleh bentuk jadi love pulak" mark="love" color={P.pink} />
      <Sticker text="squish~" at={12.5} dur={1.6} x={760} y={480} fill={P.sageDeep} rot={6} />
      <Callout at={12.8} end={15.0} text="lembut macam marshmallow" mark="lembut" color={P.butter} />
      <Sticker text="boing!" at={15.3} dur={1.2} x={300} y={520} fill="#E0B85A" rot={-8} />
      <Callout at={15.2} end={18.0} text="boleh main baling-baling" mark="baling-baling" color={P.blue} top={SAFE.top + 160} />
      <Callout at={20.2} end={24.2} text="bentuk donut pun boleh!" mark="donut" color={P.sage} />
      <Sticker text="squishy~" at={24.6} dur={1.5} x={740} y={480} fill={P.pinkDeep} rot={-5} />
      <Callout at={25.0} end={29.2} text="satisfying gila tengok" mark="satisfying" color={P.pink} />
      <Callout at={29.6} end={33.4} text="sabun rupanya! mandi jadi fun" mark="sabun" color={P.butter} />
      <EndCard />
      <AbsoluteFill style={{background: P.cream, opacity: fade * 0.9}} />
      <Sound />
    </AbsoluteFill>
  );
};

export const BW_SEED = random('booih2');
