import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {toScreen} from './Camera';
import {
  Check,
  CleanseIcon,
  Cross,
  Flask,
  Heart,
  HydrateIcon,
  Marks,
  MoisturizeIcon,
  PRODUCTS,
  SleepyCloud,
  Sparkle,
  StormCloud,
} from './Icons';
import {C, captionFont, clamp, easeIO, faceAt, FPS, SAFE, SAFE_CX, scriptFont, sec, serifFont} from './theme';

/* ================= helpers ================= */
const SOFT = {damping: 15, stiffness: 150, mass: 0.75};
const BOUNCY = {damping: 10, stiffness: 170, mass: 0.6};

/** spring-in from `start` (s), smooth fade-out over `out` s ending at `end` (s) */
const useWin = (start: number, end: number, out = 0.3, cfg = SOFT) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - sec(start), fps, config: cfg});
  const ex = interpolate(frame, [sec(end - out), sec(end)], [1, 0], {...clamp, easing: easeIO});
  return {frame, p, ex, t: frame / fps, on: frame >= sec(start) && frame < sec(end)};
};
const float = (frame: number, amp = 6, period = 70, phase = 0) => Math.sin(((frame + phase) / period) * 2 * Math.PI) * amp;

const textShadow = '0 1px 1px rgba(60,40,35,0.5), 0 2px 12px rgba(50,30,30,0.45), 0 0 28px rgba(50,30,30,0.2)';

/** a small twinkling sparkle */
const Twinkle: React.FC<{x: number; y: number; size: number; delay?: number; p?: number}> = ({x, y, size, delay = 0, p = 1}) => {
  const f = useCurrentFrame();
  const tw = 0.7 + 0.3 * Math.sin((f + delay * 7) / 8);
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${tw * p}) rotate(${Math.sin((f + delay) / 25) * 15}deg)`}}>
      <Sparkle size={size} />
    </div>
  );
};

/* ================= 1 · titles in the empty wall above her head ================= */
type Line = {text: string; font: 'script' | 'serif'; size: number; at: number};
const Title: React.FC<{start: number; end: number; lines: Line[]; y?: number; underline?: boolean}> = ({start, end, lines, y = 240, underline = true}) => {
  const {frame, ex, on} = useWin(start, end, 0.35);
  const {fps} = useVideoConfig();
  if (!on) return null;
  const lastAt = lines[lines.length - 1].at;
  const ul = interpolate(frame, [sec(lastAt + 0.25), sec(lastAt + 0.7)], [0, 1], {...clamp, easing: easeIO});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          top: y,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: ex,
          transform: `translateY(${(1 - ex) * -18 + float(frame, 4, 90)}px) scale(${0.94 + 0.06 * ex})`,
        }}
      >
        {lines.map((l, li) => {
          const chars = [...l.text];
          return (
            <div key={li} style={{position: 'relative', display: 'flex', whiteSpace: 'pre', marginTop: li ? -6 : 0}}>
              {chars.map((ch, ci) => {
                // letters drift in one by one (playful but smooth)
                const lf = frame - sec(l.at) - ci * 1.2;
                const p = spring({frame: lf, fps, config: SOFT});
                return (
                  <span
                    key={ci}
                    style={{
                      display: 'inline-block',
                      fontFamily: l.font === 'script' ? scriptFont : serifFont,
                      fontStyle: l.font === 'serif' ? 'italic' : 'normal',
                      fontWeight: 400,
                      fontSize: l.size,
                      lineHeight: 1.15,
                      color: l.font === 'script' ? C.cream : C.butter,
                      textShadow,
                      opacity: Math.min(1, p * 1.3),
                      transform: `translateY(${(1 - p) * 22}px) rotate(${(1 - p) * -12}deg)`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          );
        })}
        {underline && (
          <svg width={360} height={30} viewBox="0 0 360 30" style={{marginTop: -4, overflow: 'visible'}}>
            <path
              d="M8 18 C80 6 160 26 240 14 C290 8 330 12 352 16"
              fill="none"
              stroke={C.butter}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - ul}
              style={{filter: 'drop-shadow(0 2px 4px rgba(50,30,30,0.4))'}}
            />
          </svg>
        )}
      </div>
      <Twinkle x={SAFE_CX - 250} y={y + 40} size={38} delay={3} p={ex * Math.min(1, ul * 2 + 0.3)} />
      <Twinkle x={SAFE_CX + 255} y={y + 95} size={28} delay={11} p={ex * Math.min(1, ul * 2 + 0.3)} />
      <Twinkle x={SAFE_CX + 215} y={y - 5} size={20} delay={19} p={ex * ul} />
    </AbsoluteFill>
  );
};

/* ================= 2 · blush on "sensitive", stress marks on "breakout" ================= */
const Blush: React.FC = () => {
  const {frame, p, ex, on} = useWin(4.1, 5.55, 0.45);
  if (!on) return null;
  const f = faceAt(frame);
  const cheeks = [-1, 1].map((side) => toScreen(frame, f.x + side * f.w * 0.27, f.y + f.w * 0.16));
  const r = f.w * 0.15 * cheeks[0].s;
  const pulse = 1 + 0.05 * Math.sin(frame / 5);
  const marks = interpolate(frame, [sec(4.76), sec(4.9)], [0, 1], clamp);
  const mp = spring({frame: frame - sec(4.76), fps: FPS, config: BOUNCY});
  const head = toScreen(frame, f.x, f.y - f.w * 0.55);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {cheeks.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c.x - r * 1.3,
            top: c.y - r * 0.85,
            width: r * 2.6,
            height: r * 1.7,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,120,150,0.55) 0%, rgba(255,140,165,0.3) 45%, rgba(255,160,180,0) 72%)',
            opacity: Math.min(p, 1) * ex,
            transform: `scale(${(0.6 + 0.4 * p) * pulse})`,
            mixBlendMode: 'multiply',
          }}
        />
      ))}
      {marks > 0 && (
        <>
          <div style={{position: 'absolute', left: head.x - f.w * 0.62 - 35, top: head.y - 20, opacity: ex, transform: `scale(${mp}) rotate(-20deg)`}}>
            <Marks size={74} />
          </div>
          <div style={{position: 'absolute', left: Math.min(head.x + f.w * 0.5, SAFE.right - 74), top: head.y - 10, opacity: ex, transform: `scale(${mp}) rotate(18deg) scaleX(-1)`}}>
            <Marks size={64} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ================= 3 · "jangan terlalu try banyak sangat produk" – products pop round her head ================= */
const PRODUCT_TIMES = [5.2, 5.42, 5.82, 5.96, 6.2, 6.4];
const ProductBurst: React.FC = () => {
  const {frame, on} = useWin(5.15, 7.1);
  const {fps} = useVideoConfig();
  if (!on) return null;
  const f = faceAt(frame);
  const cx = SAFE_CX;
  // swept into a little "poof" right after "produk."
  const sweep = interpolate(frame, [sec(6.72), sec(7.05)], [0, 1], {...clamp, easing: easeIO});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {PRODUCT_TIMES.map((at, i) => {
        const P = PRODUCTS[i % PRODUCTS.length];
        // dome of products in the free wall space above her head
        const k = i / (PRODUCT_TIMES.length - 1);
        const order = [0, 5, 1, 4, 2, 3][i]; // pop in alternating left/right
        const kk = order / (PRODUCT_TIMES.length - 1);
        const x = SAFE.left + 95 + kk * (SAFE.right - SAFE.left - 190);
        const y = 430 - Math.sin(kk * Math.PI) * 170 + (k > 2 ? 0 : 0);
        const p = spring({frame: frame - sec(at), fps, config: BOUNCY});
        const wob = Math.sin((frame + i * 13) / 6) * 7 * p;
        const sx = x + (cx - x) * sweep;
        const sy = y + (300 - y) * sweep;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: sx - 60,
              top: sy - 62 + float(frame, 5, 50, i * 9),
              width: 120,
              display: 'flex',
              justifyContent: 'center',
              transform: `scale(${p * (1 - sweep * 0.9)}) rotate(${wob + sweep * 200}deg)`,
              opacity: 1 - sweep,
              filter: 'drop-shadow(0 8px 14px rgba(40,20,40,0.25))',
            }}
          >
            <P size={122} />
          </div>
        );
      })}
      {sweep > 0 && sweep < 1 && (
        <Twinkle x={cx} y={300} size={110 * Math.sin(sweep * Math.PI)} delay={0} />
      )}
    </AbsoluteFill>
  );
};

/* ================= 4 · "your skin needs skincare, bukan MORE skincare" ================= */
const Sticker: React.FC<{children: React.ReactNode; p: number; tilt: number}> = ({children, p, tilt}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '12px 30px 14px 18px',
      borderRadius: 30,
      background: 'rgba(255,251,234,0.95)',
      border: '5px solid #fff',
      boxShadow: '0 10px 26px rgba(40,20,40,0.22)',
      fontFamily: captionFont,
      fontWeight: 500,
      fontSize: 50,
      color: C.ink,
      whiteSpace: 'nowrap',
      opacity: Math.min(1, p * 1.4),
      transform: `translateY(${(1 - p) * 30}px) scale(${0.6 + 0.4 * p}) rotate(${tilt * p}deg)`,
    }}
  >
    {children}
  </div>
);
const MoreSkincare: React.FC = () => {
  const {frame, ex, on} = useWin(7.55, 10.55, 0.35);
  const {fps} = useVideoConfig();
  if (!on) return null;
  const p1 = spring({frame: frame - sec(7.6), fps, config: SOFT});
  const p2 = spring({frame: frame - sec(8.72), fps, config: SOFT});
  const strike = interpolate(frame, [sec(9.15), sec(9.75)], [0, 1], {...clamp, easing: easeIO});
  const xp = spring({frame: frame - sec(9.75), fps, config: BOUNCY});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          top: 215,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          opacity: ex,
          transform: `translateY(${float(frame, 4, 80)}px)`,
        }}
      >
        <Sticker p={p1} tilt={-3}>
          <Check size={50} />
          <span>skincare</span>
          <Heart size={34} />
        </Sticker>
        {p2 > 0.01 && (
          <div style={{position: 'relative'}}>
            <Sticker p={p2} tilt={2.5}>
              <div style={{transform: `scale(${p2 * (1 + Math.sin(Math.min(1, xp) * Math.PI) * 0.3)}) rotate(${Math.sin(Math.min(1, xp) * Math.PI) * 20}deg)`, width: 50, height: 50}}>
                <Cross size={50} />
              </div>
              <span style={{position: 'relative'}}>
                more skincare
                <svg width="100%" height="40" viewBox="0 0 300 40" preserveAspectRatio="none" style={{position: 'absolute', left: -8, top: 16, width: 'calc(100% + 16px)', overflow: 'visible'}}>
                  <path
                    d="M4 26 C80 14 160 30 296 12"
                    fill="none"
                    stroke={C.softRed}
                    strokeWidth={7}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset={1 - strike}
                  />
                </svg>
              </span>
            </Sticker>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ================= 5 · "excited" – little hearts & sparkles fizz up ================= */
const Excited: React.FC = () => {
  const {frame, on} = useWin(12.15, 13.6);
  if (!on) return null;
  const f = faceAt(frame);
  const items = [
    {dx: -0.62, kind: 'heart', d: 0, size: 54, color: C.rose},
    {dx: 0.55, kind: 'heart', d: 3, size: 44, color: C.pink},
    {dx: -0.45, kind: 'spark', d: 5, size: 40, color: C.cream},
    {dx: 0.4, kind: 'spark', d: 8, size: 34, color: C.butter},
    {dx: -0.75, kind: 'spark', d: 10, size: 26, color: C.cream},
  ];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((it, i) => {
        const lf = frame - sec(12.15) - it.d;
        const u = interpolate(lf, [0, 40], [0, 1], clamp);
        const p = spring({frame: lf, fps: FPS, config: BOUNCY});
        const x = Math.max(SAFE.left + 30, Math.min(SAFE.right - 30, f.x + it.dx * f.w));
        const y = f.y - f.w * 0.2 - u * 260;
        const o = interpolate(u, [0, 0.1, 0.75, 1], [0, 1, 1, 0]);
        return (
          <div key={i} style={{position: 'absolute', left: x - it.size / 2, top: y, opacity: o, transform: `scale(${p}) rotate(${Math.sin(lf / 6) * 14}deg)`}}>
            {it.kind === 'heart' ? <Heart size={it.size} color={it.color} /> : <Sparkle size={it.size} color={it.color} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ================= 6 · "macam-macam produk sampai 5 ke 6 layer" – a wobbly product tower ================= */
const LAYER_TIMES = [13.38, 13.6, 13.88, 14.3, 14.7, 15.42];
// pyramid slots above her head: 3 on the bottom, 2 in the middle, 1 on top
const PILE: [number, number][] = [
  [SAFE_CX - 120, 445], [SAFE_CX + 120, 445], [SAFE_CX, 450],
  [SAFE_CX - 62, 343], [SAFE_CX + 60, 343], [SAFE_CX, 240],
];
const LayerTower: React.FC = () => {
  const {frame, on} = useWin(13.3, 17.2);
  const {fps} = useVideoConfig();
  if (!on) return null;
  const H = 104;
  // the pile topples on "But honestly"
  const fall = frame - sec(16.25);
  const n = LAYER_TIMES.filter((at) => frame >= sec(at)).length;
  const wobbleAmp = n >= 5 ? (n - 4) * 2.4 : 0.8;
  const cp = spring({frame: frame - sec(LAYER_TIMES[Math.max(0, n - 1)]), fps, config: BOUNCY});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {LAYER_TIMES.map((at, i) => {
        const P = PRODUCTS[(i + 2) % PRODUCTS.length];
        const p = spring({frame: frame - sec(at), fps, config: {damping: 11, stiffness: 190, mass: 0.6}});
        if (p <= 0.001) return null;
        const level = i < 3 ? 0 : i < 5 ? 1 : 2;
        const sway = Math.sin(frame / 7) * wobbleAmp * (0.4 + level * 0.5);
        let [x, y] = PILE[i];
        x += sway * (1 + level);
        y -= (1 - p) * 160;
        let rot = sway + (i % 2 ? 4 : -4);
        let o = 1;
        if (fall > 0) {
          const tt = fall / fps;
          const dir = x < SAFE_CX ? -1 : x > SAFE_CX ? 1 : i % 2 ? 1 : -1;
          x += dir * (140 + level * 40) * tt;
          y += 1100 * tt * tt - (120 + level * 60) * tt;
          rot += dir * 300 * tt;
          o = interpolate(fall, [5, 16], [1, 0], clamp);
        }
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 60,
              top: y - H,
              width: 120,
              height: H,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              opacity: o * Math.min(1, p * 2),
              transform: `rotate(${rot}deg)`,
              filter: 'drop-shadow(0 6px 10px rgba(40,20,40,0.25))',
            }}
          >
            <P size={H} />
          </div>
        );
      })}
      {n >= 4 && (
        <div
          style={{
            position: 'absolute',
            left: SAFE_CX + 185,
            top: 215,
            fontFamily: scriptFont,
            fontSize: 64,
            fontWeight: 500,
            lineHeight: 1,
            color: C.butter,
            textShadow,
            whiteSpace: 'nowrap',
            transform: `scale(${0.85 + 0.15 * cp}) rotate(-8deg)`,
            transformOrigin: 'left center',
            opacity: fall > 0 ? interpolate(fall, [0, 8], [1, 0], clamp) : 1,
          }}
        >
          {n >= 6 ? <>6<br />layers?!</> : n >= 5 ? '5...' : '4...'}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ================= 7 · "give your skin a break" – sleepy cloud ================= */
const BreakCloud: React.FC = () => {
  const {frame, p, ex, on} = useWin(18.95, 20.75, 0.4);
  if (!on) return null;
  const x = 750;
  const y = 290;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x - 95, top: y + float(frame, 7, 60), opacity: ex, transform: `scale(${p}) rotate(${Math.sin(frame / 20) * 3}deg)`}}>
        <SleepyCloud size={190} />
      </div>
      {[0, 1, 2].map((i) => {
        const lf = frame - sec(19.35) - i * 8;
        const u = ((lf / 45) % 1 + 1) % 1;
        if (lf < 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + 70 + u * 40 + i * 6,
              top: y - 20 - u * 100,
              fontFamily: captionFont,
              fontWeight: 500,
              fontSize: 38 + i * 10,
              color: C.cream,
              textShadow,
              opacity: interpolate(u, [0, 0.2, 0.8, 1], [0, 1, 1, 0]) * ex,
            }}
          >
            z
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ================= 8 · "ingat tiga benda ni: cleanse, hydrate, moisturize" ================= */
const STEPS = [
  {label: 'cleanse', at: 22.74, again: 24.14, Icon: CleanseIcon, tint: C.sky},
  {label: 'hydrate', at: 23.2, again: 24.78, Icon: HydrateIcon, tint: C.mint},
  {label: 'moisturize', at: 23.58, again: 25.48, Icon: MoisturizeIcon, tint: C.pink},
];
const ThreeThings: React.FC = () => {
  const {frame, ex, on} = useWin(21.78, 26.36, 0.3);
  const {fps} = useVideoConfig();
  if (!on) return null;
  const head = spring({frame: frame - sec(21.8), fps, config: SOFT});
  const CARD = 240;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          top: 170,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: ex,
          transform: `scale(${0.95 + 0.05 * ex})`,
        }}
      >
        <div
          style={{
            fontFamily: scriptFont,
            fontSize: 66,
            fontWeight: 500,
            color: C.butter,
            textShadow,
            opacity: head,
            transform: `translateY(${(1 - head) * 16}px) rotate(-3deg)`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Sparkle size={30} /> 3 things <Sparkle size={24} />
        </div>
        <div style={{display: 'flex', gap: 22, marginTop: 10}}>
          {STEPS.map(({label, at, again, Icon, tint}, i) => {
            const p = spring({frame: frame - sec(at - 0.06), fps, config: BOUNCY});
            const draw = interpolate(frame, [sec(at), sec(at + 0.5)], [0, 1], {...clamp, easing: easeIO});
            const hit = spring({frame: frame - sec(again), fps, config: {damping: 9, stiffness: 200, mass: 0.5}});
            const bump = frame >= sec(again) ? Math.sin(Math.min(1, hit) * Math.PI) * 0.1 : 0;
            const tick = frame >= sec(again) ? hit : 0;
            return (
              <div
                key={label}
                style={{
                  position: 'relative',
                  width: CARD,
                  padding: '14px 0 12px',
                  borderRadius: 34,
                  background: `linear-gradient(180deg, #FFFDF4 0%, ${tint} 140%)`,
                  border: '5px solid #fff',
                  boxShadow: '0 10px 26px rgba(40,20,40,0.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: Math.min(1, p * 1.5),
                  transform: `translateY(${(1 - p) * 40 + float(frame, 4, 70, i * 20)}px) scale(${(0.5 + 0.5 * p) * (1 + bump)}) rotate(${(i - 1) * 2.5}deg)`,
                }}
              >
                <Icon size={132} draw={draw} />
                <div style={{fontFamily: captionFont, fontWeight: 500, fontSize: 38, color: C.ink, marginTop: 0}}>{label}</div>
                <div
                  style={{
                    position: 'absolute',
                    left: -12,
                    top: -14,
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    background: C.butter,
                    border: '4px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: captionFont,
                    fontWeight: 600,
                    fontSize: 28,
                    color: C.ink,
                    boxShadow: '0 4px 10px rgba(40,20,40,0.2)',
                  }}
                >
                  {i + 1}
                </div>
                {tick > 0 && (
                  <div style={{position: 'absolute', right: -14, top: -14, transform: `scale(${tick}) rotate(${(1 - tick) * -90}deg)`}}>
                    <Check size={50} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================= 9 · "kulit korang tengah meragam" – grumpy little cloud ================= */
const Meragam: React.FC = () => {
  const {frame, p, ex, on} = useWin(27.55, 28.6, 0.3, BOUNCY);
  if (!on) return null;
  const f = faceAt(frame);
  const head = toScreen(frame, f.x, f.y - f.w * 0.62);
  const shake = Math.sin(frame * 1.7) * 4 * p;
  const flash = frame % 8 < 4 ? 1 : 0.25;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: Math.max(SAFE.left, head.x - f.w * 0.7 - 100), top: Math.max(SAFE.top + 20, head.y - 230), opacity: ex, transform: `scale(${p}) translateX(${shake}px) rotate(-6deg)`}}>
        <StormCloud size={190} flash={flash} />
      </div>
    </AbsoluteFill>
  );
};

/* ================= 10 · "buat experiment" – bubbling flask gets a gentle "no" ================= */
const Experiment: React.FC = () => {
  const {frame, p, ex, on} = useWin(31.0, 32.45, 0.35, BOUNCY);
  const {fps} = useVideoConfig();
  if (!on) return null;
  const no = spring({frame: frame - sec(31.78), fps, config: {damping: 9, stiffness: 200, mass: 0.5}});
  const x = 745;
  const y = 250;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x - 80, top: y + float(frame, 6, 50), opacity: ex, transform: `scale(${p}) rotate(${Math.sin(frame / 5) * 5}deg)`}}>
        <Flask size={160} bubble={frame / 30} />
        {frame >= sec(31.78) && (
          <div style={{position: 'absolute', right: -10, bottom: 0, transform: `scale(${no}) rotate(${(1 - no) * 120}deg)`}}>
            <Cross size={60} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ================= 11 · "Okay?" + thumbs up – hearts float up ================= */
const Outro: React.FC = () => {
  const {frame, on} = useWin(32.55, 34);
  if (!on) return null;
  const items = [
    {x: 200, d: 0, size: 56, kind: 'heart', color: C.rose},
    {x: 820, d: 4, size: 48, kind: 'heart', color: C.pink},
    {x: 300, d: 9, size: 40, kind: 'spark', color: C.butter},
    {x: 760, d: 12, size: 36, kind: 'spark', color: C.cream},
    {x: 150, d: 16, size: 30, kind: 'spark', color: C.cream},
    {x: 870, d: 18, size: 38, kind: 'heart', color: C.blush},
  ];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((it, i) => {
        const lf = frame - sec(32.55) - it.d;
        if (lf < 0) return null;
        const u = lf / 45;
        const p = spring({frame: lf, fps: FPS, config: BOUNCY});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: Math.min(SAFE.right - it.size, it.x + Math.sin(lf / 8) * 14),
              top: 1150 - u * 520,
              opacity: interpolate(u, [0, 0.12, 0.8, 1.05], [0, 1, 1, 0], clamp),
              transform: `scale(${p}) rotate(${Math.sin(lf / 7) * 12}deg)`,
            }}
          >
            {it.kind === 'heart' ? <Heart size={it.size} color={it.color} /> : <Sparkle size={it.size} color={it.color} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ================= all graphics (one idea on screen at a time) ================= */
export const Graphics: React.FC = () => (
  <>
    <Title
      start={0.25}
      end={2.85}
      y={250}
      lines={[
        {text: 'back to', font: 'script', size: 62, at: 0.3},
        {text: 'the basics', font: 'serif', size: 92, at: 1.75},
      ]}
    />
    <Blush />
    <ProductBurst />
    <MoreSkincare />
    <Excited />
    <LayerTower />
    <Title
      start={16.3}
      end={18.5}
      y={250}
      lines={[
        {text: 'honestly,', font: 'script', size: 62, at: 16.4},
        {text: 'less is better', font: 'serif', size: 88, at: 17.25},
      ]}
    />
    <BreakCloud />
    <ThreeThings />
    <Meragam />
    <Title
      start={28.55}
      end={30.15}
      y={250}
      lines={[
        {text: 'ingat,', font: 'script', size: 62, at: 28.55},
        {text: 'keep it simple', font: 'serif', size: 88, at: 28.85},
      ]}
    />
    <Experiment />
    <Outro />
  </>
);
