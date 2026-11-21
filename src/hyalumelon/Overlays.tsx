import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sparkle} from '../Icons';
import {Arrow, Battery, Drop, Feather, HeartIcon, Leaf, Lifebuoy, Snowflake, Sunny, Tick, Watermelon, Zzz} from './Icons';
import {A_SEC, C, F, SAFE, SAFE_CX, SAFE_W, sec} from './theme';

/* ================= helpers ================= */
const SOFT = {damping: 15, stiffness: 150, mass: 0.75};
const BOUNCY = {damping: 11, stiffness: 170, mass: 0.6};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const usePop = (delay = 0, cfg = SOFT) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: cfg});
};
// fade + shrink out over the last `len` frames of the parent Sequence
const useExit = (len = 9) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return interpolate(f, [durationInFrames - len, durationInFrames], [1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
};
const useFloat = (amp = 5, period = 70, phase = 0) => Math.sin((useCurrentFrame() + phase) / (period / (2 * Math.PI))) * amp;

/** A Sequence placed in OUTPUT seconds. `at(t)` inside children = frames from start to output time t. */
const Beat: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <Sequence from={sec(from)} durationInFrames={sec(to) - sec(from)} layout="none">
    {children}
  </Sequence>
);
const at = (from: number, t: number) => sec(t) - sec(from);

/* ---------- text styles (from the reference edits) ---------- */
const chunky = (size: number, color = '#fff', shadow = C.melonDeep): React.CSSProperties => ({
  fontFamily: F.round,
  fontWeight: 700,
  fontSize: size,
  lineHeight: 1.02,
  color,
  letterSpacing: 1,
  textShadow: `0 ${size * 0.06}px 0 ${shadow}, 0 ${size * 0.12}px ${size * 0.3}px rgba(60,25,50,0.4)`,
  whiteSpace: 'nowrap',
});
const script = (size: number, color = C.cream): React.CSSProperties => ({
  fontFamily: F.script,
  fontSize: size,
  lineHeight: 1.05,
  color,
  textShadow: `0 3px 0 rgba(74,48,70,0.8), 0 0 3px rgba(74,48,70,0.6), 0 6px 20px rgba(40,20,40,0.55)`,
  whiteSpace: 'nowrap',
});
const serif = (size: number, color = C.cream, italic = false): React.CSSProperties => ({
  fontFamily: F.serif,
  fontStyle: italic ? 'italic' : 'normal',
  fontSize: size,
  lineHeight: 1.05,
  color,
  textShadow: '0 3px 0 rgba(74,48,70,0.55), 0 8px 24px rgba(40,20,40,0.45)',
  whiteSpace: 'nowrap',
});

/** Top title zone: the empty wall above the head, inside the safe zone. */
const Top: React.FC<{children: React.ReactNode; y?: number; exitLen?: number}> = ({children, y = SAFE.top + 8, exitLen}) => {
  const ex = useExit(exitLen);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: y,
          left: SAFE.left,
          width: SAFE_W,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: ex,
          transform: `scale(${0.88 + 0.12 * ex}) translateY(${(1 - ex) * -20}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** word that pops letter-by-letter */
const PopWord: React.FC<{text: string; delay: number; style: React.CSSProperties; stagger?: number}> = ({text, delay, style, stagger = 1.3}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      {text.split('').map((ch, i) => {
        const p = spring({frame: f - delay - i * stagger, fps: 30, config: BOUNCY});
        const bob = Math.sin((f + i * 7) / 15) * 2.5;
        return (
          <span
            key={i}
            style={{
              ...style,
              display: 'inline-block',
              whiteSpace: 'pre',
              transform: `translateY(${(1 - p) * -40 + bob}px) scale(${0.4 + 0.6 * p})`,
              opacity: Math.min(1, p * 1.6),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** rounded sticker pill */
const Pill: React.FC<{text: string; bg: string; delay: number; size?: number; icon?: React.ReactNode; tilt?: number; textColor?: string}> = ({
  text,
  bg,
  delay,
  size = 52,
  icon,
  tilt = 0,
  textColor = C.plum,
}) => {
  const p = usePop(delay, BOUNCY);
  const fl = useFloat(4, 80, delay * 7);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: `${size * 0.16}px ${size * 0.48}px ${size * 0.22}px ${icon ? size * 0.3 : size * 0.48}px`,
        borderRadius: 999,
        background: `linear-gradient(180deg, #ffffff 0%, ${bg} 60%)`,
        border: '5px solid #fff',
        boxShadow: `0 7px 0 ${bg}, 0 12px 26px rgba(40,20,40,0.28)`,
        fontFamily: F.round,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.05,
        color: textColor,
        whiteSpace: 'nowrap',
        transform: `translateY(${(1 - p) * 30 + fl}px) scale(${0.5 + 0.5 * p}) rotate(${tilt * p}deg)`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      {icon}
      {text}
    </div>
  );
};

/** generic pop-in wrapper for icons */
const PopIn: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties; spin?: number; float?: number}> = ({delay, children, style, spin = 0, float = 6}) => {
  const p = usePop(delay, BOUNCY);
  const fl = useFloat(float, 64, delay * 5);
  return (
    <div style={{position: 'absolute', ...style, transform: `translateY(${fl}px) scale(${p}) rotate(${(1 - p) * spin}deg)`, opacity: Math.min(1, p * 1.5)}}>
      {children}
    </div>
  );
};

const Twinkles: React.FC<{seed: string; n?: number; area: [number, number, number, number]; delay?: number}> = ({seed, n = 4, area, delay = 0}) => {
  const p = usePop(delay);
  const [x, y, w, h] = area;
  return (
    <>
      {Array.from({length: n}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: x + random(`${seed}x${i}`) * w, top: y + random(`${seed}y${i}`) * h, opacity: p}}>
          <Sparkle size={22 + random(`${seed}s${i}`) * 26} delay={i * 11} speed={0.8 + random(`${seed}v${i}`) * 0.6} />
        </div>
      ))}
    </>
  );
};

/* ================= PART A beats ================= */

// 0.1 – 4.7  "…makin suka dengan benda yang simple je"
const Hook: React.FC = () => {
  const from = 0.1;
  return (
    <Top>
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <PopWord text="makin suka yang" delay={2} style={chunky(70)} stagger={1} />
        <div style={{marginTop: -6}}>
          <PopWord text="simple je" delay={at(from, 2.75)} style={script(150, C.cream)} stagger={1.6} />
        </div>
        <PopIn delay={at(from, 2.9)} style={{left: -40, top: 96}} spin={-90}>
          <Sparkle size={56} />
        </PopIn>
        <PopIn delay={at(from, 3.1)} style={{right: -50, top: 150}} spin={90}>
          <Sparkle size={40} color={C.butter} delay={10} />
        </PopIn>
      </div>
    </Top>
  );
};

// 4.9 – 7.15  "tapi sebab banyak sangat step"
const Steps: React.FC = () => {
  const from = 4.9;
  const f = useCurrentFrame();
  const colors = [C.mint, C.peach, C.lavender, C.sky, C.melon];
  const shake = interpolate(f, [at(from, 6.24), at(from, 6.9)], [0, 1], clamp);
  return (
    <Top>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 14px', width: 760, transform: `rotate(${Math.sin(f / 1.6) * 1.6 * shake}deg)`}}>
        {[1, 2, 3, 4, 5, 6, 7].map((n, i) => (
          <Pill key={n} text={`step ${n}`} bg={colors[i % 5]} delay={at(from, 5.0) + i * 4} size={48} tilt={i % 2 ? 4 : -4} />
        ))}
      </div>
      <div style={{marginTop: 10}}>
        <PopWord text="banyak sangat!" delay={at(from, 6.0)} style={chunky(64, C.butter, C.cocoa)} />
      </div>
    </Top>
  );
};

// 7.2 – 9.6  "so I dah hilang semangat"
const Semangat: React.FC = () => {
  const from = 7.2;
  const f = useCurrentFrame();
  const level = interpolate(f, [at(from, 7.4), at(from, 8.3)], [1, 0.06], {...clamp, easing: Easing.inOut(Easing.quad)});
  const blink = level < 0.1 ? 0.55 + 0.45 * Math.abs(Math.sin(f / 4)) : 1;
  const p = usePop(0, BOUNCY);
  return (
    <Top>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${p})`}}>
        <Battery level={level} size={170} style={{opacity: blink}} />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={serif(54, C.cream, true)}>semangat</div>
          <div style={chunky(64, '#fff', C.softRed)}>{Math.round(level * 100)}%</div>
        </div>
      </div>
    </Top>
  );
};

// 10.7 – 17.15  weather: "cuaca tak menentu, kejap panas, kejap aircon, … kering sangat"
const Weather: React.FC = () => {
  const from = 10.7;
  const f = useCurrentFrame();
  const t = from + f / 30;
  const hotP = usePop(at(from, 12.1), BOUNCY);
  const coldP = usePop(at(from, 13.6), BOUNCY);
  const dryP = usePop(at(from, 16.0), BOUNCY);
  const iconsOut = interpolate(t, [15.7, 16.05], [1, 0], clamp);
  const titleOut = interpolate(t, [15.7, 16.0], [1, 0], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* temperature tint washes */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 20% 25%, rgba(255,170,90,0.55), rgba(255,170,90,0) 65%)', opacity: interpolate(t, [12.05, 12.35, 12.85, 13.3], [0, 0.42, 0.42, 0], clamp)}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 80% 25%, rgba(140,200,255,0.6), rgba(140,200,255,0) 65%)', opacity: interpolate(t, [13.55, 13.9, 14.3, 14.8], [0, 0.42, 0.42, 0], clamp)}} />
      <Top>
        <div style={{opacity: titleOut, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={serif(64, C.cream, true)}>cuaca tak menentu</div>
          <div style={{display: 'flex', gap: 120, marginTop: 18, alignItems: 'flex-start'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${hotP * iconsOut}) rotate(${(1 - hotP) * -60}deg)`}}>
              <Sunny size={130} />
              <div style={chunky(50, '#fff', '#E89A3C')}>panas!</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${coldP * iconsOut}) rotate(${(1 - coldP) * 60}deg)`}}>
              <Snowflake size={118} />
              <div style={chunky(50, '#fff', '#5AA9D6')}>aircon</div>
            </div>
          </div>
        </div>
        {t > 15.9 && (
          <div style={{position: 'absolute', top: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${dryP}) rotate(${(1 - dryP) * -20}deg)`}}>
            <Drop empty size={96} />
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
              <div style={chunky(84, '#fff', C.cocoa)}>kering</div>
              <div style={{...script(78, C.butter), marginTop: -14}}>sangat...</div>
            </div>
          </div>
        )}
      </Top>
    </AbsoluteFill>
  );
};

// 19.6 – 21.55  "…jadikan dia sebagai penyelamat korang"
const Saviour: React.FC = () => {
  const from = 19.6;
  const p = usePop(at(from, 20.55), BOUNCY);
  return (
    <Top>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, position: 'relative'}}>
        <div style={{transform: `scale(${usePop(2, BOUNCY)}) rotate(${(1 - usePop(2)) * -180}deg)`}}>
          <Lifebuoy size={140} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={serif(52, C.cream, true)}>si</div>
          <div style={{...script(120, C.cream), marginTop: -20, opacity: p, transform: `scale(${0.6 + 0.4 * p})`}}>penyelamat</div>
        </div>
        <Twinkles seed="sav" area={[0, -20, 600, 200]} delay={at(from, 20.6)} />
      </div>
    </Top>
  );
};

// 21.75 – 24.4  product name
const ProductTitle: React.FC = () => {
  const from = 21.75;
  const f = useCurrentFrame();
  const p1 = usePop(at(from, 22.45), SOFT);
  const p2 = usePop(at(from, 23.0), BOUNCY);
  const shine = interpolate(f, [at(from, 23.2), at(from, 24.0)], [-30, 130], clamp);
  return (
    <Top y={SAFE.top + 4}>
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <PopIn delay={at(from, 22.5)} style={{left: -70, top: -6}} spin={-40}>
          <Watermelon size={110} />
        </PopIn>
        <PopIn delay={at(from, 22.7)} style={{right: -64, top: 60}} spin={40}>
          <Drop size={58} />
        </PopIn>
        <div
          style={{
            ...serif(132, '#fff'),
            opacity: p1,
            transform: `translateY(${(1 - p1) * 30}px)`,
            backgroundImage: `linear-gradient(100deg, #fff 0%, #fff ${shine - 12}%, ${C.butter} ${shine}%, #fff ${shine + 12}%, #fff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 5px 0 rgba(240,101,127,0.9)) drop-shadow(0 10px 18px rgba(40,20,40,0.4))',
            textShadow: 'none',
          }}
        >
          Hyalumelon
        </div>
        <div style={{...script(92, C.cream), marginTop: -10, opacity: p2, transform: `scale(${0.5 + 0.5 * p2}) rotate(-4deg)`}}>Mist Toner</div>
      </div>
    </Top>
  );
};

// 24.1 – 26.9  close-up spray: "jenis spray" + fine mist "halus je"
const MistParticles: React.FC<{origin: [number, number]; start: number; n?: number}> = ({origin, start, n = 46}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const born = start + Math.floor(random(`mb${i}`) * 34);
        const life = 34 + random(`ml${i}`) * 26;
        const k = (f - born) / life;
        if (k < 0 || k > 1) return null;
        const ang = (-28 + random(`ma${i}`) * 50) * (Math.PI / 180);
        const dist = (130 + random(`md${i}`) * 420) * Easing.out(Easing.quad)(k);
        const x = origin[0] + Math.cos(ang) * dist;
        const y = origin[1] + Math.sin(ang) * dist - k * 40;
        const s = 6 + random(`ms${i}`) * 16;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(220,240,255,0.0) 70%)',
              opacity: Math.sin(k * Math.PI) * 0.9,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
const SprayCloseup: React.FC = () => {
  const from = 24.1;
  const p = usePop(at(from, 24.75), BOUNCY);
  const ex = useExit();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{opacity: ex}}>
        <MistParticles origin={[400, 430]} start={at(from, 24.5)} />
      </div>
      <Top y={SAFE.top + 20}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%', paddingRight: 10}}>
          <Pill text="jenis spray" bg={C.sky} delay={2} size={58} tilt={3} icon={<Drop size={40} />} />
        </div>
      </Top>
      <div style={{position: 'absolute', left: 560, top: 620, opacity: Math.min(1, p * 1.4) * ex, transform: `scale(${0.6 + 0.4 * p}) rotate(-8deg)`}}>
        <div style={script(110, C.cream)}>halus je~</div>
      </div>
    </AbsoluteFill>
  );
};

// 26.3 – 29.05  "Bila spray dekat kulit… fresh and lightweight" (she mists her face)
const FaceMist: React.FC = () => {
  const from = 26.3;
  return (
    <Top>
      <PopWord text="boleh pakai sebagai" delay={2} style={serif(56, C.cream, true)} stagger={0.6} />
      <PopWord text="facemist" delay={at(from, 26.75)} style={chunky(96, '#fff', C.aqua)} />
      <div style={{display: 'flex', gap: 16, marginTop: 14}}>
        <Pill text="fresh" bg={C.mint} delay={at(from, 28.12)} size={50} tilt={-4} icon={<Leaf size={42} />} />
        <Pill text="lightweight" bg={C.lavender} delay={at(from, 28.6)} size={50} tilt={4} icon={<Feather size={44} />} />
      </div>
    </Top>
  );
};

// 30.3 – 32.85  "hydrate, refresh and soothe-kan skin kita"
const Benefits: React.FC = () => {
  const from = 30.3;
  return (
    <Top>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{display: 'flex', gap: 14}}>
          <Pill text="hydrate" bg={C.sky} delay={at(from, 30.42)} size={58} tilt={-3} icon={<Drop size={42} />} />
          <Pill text="refresh" bg={C.mint} delay={at(from, 30.98)} size={58} tilt={3} icon={<Leaf size={46} />} />
        </div>
        <Pill text="soothe" bg={C.peach} delay={at(from, 31.56)} size={58} tilt={-2} icon={<HeartIcon size={44} />} />
      </div>
    </Top>
  );
};

// 33.2 – 36.65  "hyaluronic acid dengan watermelon extract"
const Ingredient: React.FC<{name: string; icon: React.ReactNode; bg: string; delay: number; tilt: number}> = ({name, icon, bg, delay, tilt}) => {
  const p = usePop(delay, BOUNCY);
  const fl = useFloat(5, 76, delay * 3);
  return (
    <div
      style={{
        width: 270,
        padding: '10px 12px 12px',
        borderRadius: 34,
        background: `linear-gradient(180deg, #fff 0%, ${bg} 75%)`,
        border: '6px solid #fff',
        boxShadow: `0 9px 0 ${bg}, 0 16px 34px rgba(40,20,40,0.3)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translateY(${(1 - p) * 40 + fl}px) scale(${0.5 + 0.5 * p}) rotate(${tilt * p}deg)`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      <div style={{height: 70, display: 'flex', alignItems: 'center'}}>{icon}</div>
      <div style={{fontFamily: F.round, fontWeight: 600, fontSize: 38, lineHeight: 1.05, color: C.plum, textAlign: 'center'}}>{name}</div>
    </div>
  );
};
const Ingredients: React.FC = () => {
  const from = 33.2;
  const plus = usePop(at(from, 34.6), BOUNCY);
  return (
    <Top>
      <div style={serif(48, C.cream, true)}>siap ada...</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 4, marginTop: 6}}>
        <Ingredient name={'Hyaluronic\nAcid'.replace('\n', ' ')} icon={<Drop size={54} />} bg={C.sky} delay={at(from, 33.4)} tilt={-3} />
        <div style={{...chunky(80, '#fff', C.rindDeep), transform: `scale(${plus}) rotate(${(1 - plus) * 180}deg)`, margin: '0 -6px', zIndex: 2}}>+</div>
        <Ingredient name="Watermelon Extract" icon={<Watermelon size={96} />} bg={C.melon} delay={at(from, 34.98)} tilt={3} />
      </div>
    </Top>
  );
};

// 39.7 – 41.3  "dah tak perlu nak complicated dah"
const NoComplicated: React.FC = () => {
  const from = 39.7;
  const f = useCurrentFrame();
  const strike = interpolate(f, [at(from, 40.6), at(from, 41.0)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Top>
      <div style={{position: 'relative'}}>
        <PopWord text="complicated" delay={at(from, 40.3)} style={chunky(96, '#fff', C.cocoa)} stagger={0.8} />
        <svg width={620} height={120} viewBox="0 0 620 120" style={{position: 'absolute', left: -20, top: 0}}>
          <path
            d="M10 70 C120 40 220 90 330 55 C430 25 520 80 610 45"
            stroke={C.softRed}
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={700}
            strokeDashoffset={700 * (1 - strike)}
          />
        </svg>
      </div>
      <div style={{marginTop: 8, opacity: strike, transform: `scale(${0.7 + 0.3 * strike})`, display: 'flex', alignItems: 'center', gap: 14}}>
        <Tick size={56} progress={strike} />
        <div style={script(88, C.butter)}>tak perlu dah</div>
      </div>
    </Top>
  );
};

// 41.4 – 43.85  "untuk korang yang malas nak pakai skincare berlayer-layer"
const Lazy: React.FC = () => {
  const from = 41.4;
  const f = useCurrentFrame();
  const layers = [C.lavender, C.mint, C.peach, C.sky];
  return (
    <Top>
      <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
        <PopWord text="malas nak layer?" delay={at(from, 42.0)} style={chunky(80)} stagger={0.8} />
        <Zzz size={90} style={{opacity: usePop(at(from, 42.2))}} />
      </div>
      <div style={{position: 'relative', height: 120, width: 300, marginTop: 10}}>
        {layers.map((col, i) => {
          const p = spring({frame: f - at(from, 43.0) - i * 3, fps: 30, config: BOUNCY});
          const wob = Math.sin((f + i * 9) / 9) * 3 * p;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 30 + wob,
                bottom: i * 24,
                width: 240 - i * 26,
                marginLeft: i * 13,
                height: 30,
                borderRadius: 16,
                background: col,
                border: '4px solid #fff',
                boxShadow: '0 5px 12px rgba(40,20,40,0.25)',
                transform: `translateY(${(1 - p) * -80}px)`,
                opacity: p,
              }}
            />
          );
        })}
      </div>
    </Top>
  );
};

// 43.85 – 45.5  "boleh consider dengan this one" -> arrow to the bottle
const ThisOne: React.FC = () => {
  const from = 43.85;
  const f = useCurrentFrame();
  const draw = interpolate(f, [at(from, 44.4), at(from, 44.9)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Top>
        <PopWord text="consider" delay={at(from, 44.0)} style={serif(66, C.cream, true)} stagger={0.8} />
        <PopWord text="this one!" delay={at(from, 44.55)} style={chunky(100, '#fff', C.melonDeep)} />
      </Top>
      <Arrow progress={draw} size={210} style={{position: 'absolute', left: 690, top: 400, transform: 'scaleX(-1) rotate(8deg)'}} />
      <div style={{position: 'absolute', left: 640, top: 600, opacity: draw}}>
        <Twinkles seed="this" n={3} area={[0, 0, 260, 420]} />
      </div>
    </AbsoluteFill>
  );
};

/* ================= transition A -> B: mist puff ================= */
const MistPuff: React.FC = () => {
  const f = useCurrentFrame(); // sequence starts 12 frames before the cut
  const mid = 12;
  const cover = interpolate(f, [0, mid], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const reveal = interpolate(f, [mid, mid + 14], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const amt = f < mid ? cover : reveal;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 9}).map((_, i) => {
        const x = 540 + (random(`px${i}`) - 0.5) * 900;
        const y = 960 + (random(`py${i}`) - 0.5) * 1500;
        const r = 380 + random(`pr${i}`) * 420;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,251,240,1) 35%, rgba(255,240,245,0) 70%)',
              transform: `scale(${amt * (1 + (f > mid ? (f - mid) * 0.03 : 0))})`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: C.cream, opacity: amt > 0.85 ? (amt - 0.85) / 0.15 : 0}} />
      <div style={{position: 'absolute', left: SAFE_CX - 60, top: 860, opacity: amt}}>
        <Sparkle size={120} color={C.butter} />
      </div>
    </AbsoluteFill>
  );
};

/* ================= PART B (spray demo, no speech) ================= */
const B = (t: number) => A_SEC + t; // part-B local seconds -> output seconds

const WhyHeader: React.FC = () => {
  const from = B(0.2);
  return (
    <Top>
      <PopWord text="kenapa" delay={2} style={serif(64, C.cream, true)} />
      <PopWord text="wajib try?" delay={8} style={chunky(108)} />
      <div style={{display: 'flex', gap: 14, marginTop: 16}}>
        <Pill text="jenis spray" bg={C.sky} delay={at(from, B(2.45))} size={46} tilt={-3} icon={<Drop size={34} />} />
        <Pill text="boleh jadi facemist" bg={C.mint} delay={at(from, B(2.7))} size={46} tilt={3} />
      </div>
    </Top>
  );
};

const Milky: React.FC = () => {
  const from = B(3.4);
  const f = useCurrentFrame();
  // droplet sinks into the arm = absorbs fast
  const sink = interpolate(f, [at(from, B(4.6)), at(from, B(5.5))], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Top>
        <PopWord text="milky texture" delay={3} style={script(124, C.cream)} stagger={1} />
        <div style={{marginTop: 4}}>
          <Pill text="cepat meresap" bg={C.butter} delay={at(from, B(4.3))} size={60} tilt={-3} icon={<Sparkle size={40} color={C.melon} />} />
        </div>
      </Top>
      <div
        style={{
          position: 'absolute',
          left: 620,
          top: 640 + sink * 190,
          transform: `scale(${(1 - sink * 0.85) * usePop(at(from, B(4.0)), BOUNCY)})`,
          opacity: 1 - sink * 0.9,
        }}
      >
        <div style={{width: 70, height: 88, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'radial-gradient(circle at 35% 35%, #fff, #F4EEE2 60%, #E9DFCF)', border: '4px solid #fff', boxShadow: '0 8px 18px rgba(40,20,40,0.25)'}} />
      </div>
    </AbsoluteFill>
  );
};

const Plump: React.FC = () => (
  <Top>
    <PopWord text="buat kulit nampak" delay={1} style={serif(58, C.cream, true)} stagger={0.5} />
    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
      <PopWord text="plump" delay={5} style={chunky(124, '#fff', C.melonDeep)} />
      <PopIn delay={10} style={{position: 'relative'}}>
        <HeartIcon size={70} />
      </PopIn>
    </div>
  </Top>
);

const CHECKLIST: [string, number][] = [
  ['sesuai untuk dehydrated skin', 8.3],
  ['kurangkan tiny bump', 8.95],
  ['kurangkan kemerahan', 9.6],
  ['repair barrier', 10.25],
  ['melembapkan kulit', 10.9],
];
const Checklist: React.FC = () => {
  const from = B(7.85);
  const card = usePop(2, SOFT);
  const ex = useExit(10);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Top>
        <PopWord text="Hyalumelon" delay={2} style={serif(108, '#fff')} stagger={0.8} />
        <div style={{...script(84, C.cream), marginTop: -16}}>Mist Toner</div>
      </Top>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: 640,
          top: 1120,
          padding: '20px 30px 22px',
          borderRadius: 38,
          background: 'rgba(255,251,240,0.86)',
          border: '6px solid #fff',
          boxShadow: `0 10px 0 ${C.melon}, 0 20px 40px rgba(40,20,40,0.3)`,
          transform: `translateY(${(1 - card) * 120}px) rotate(${-1.5 * card}deg) scale(${0.95 + 0.05 * ex})`,
          opacity: Math.min(card * 1.5, ex),
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {CHECKLIST.map(([txt, t], i) => {
          const k = at(from, B(t));
          const p = spring({frame: f - k, fps: 30, config: SOFT});
          const tick = interpolate(f, [k + 3, k + 11], [0, 1], clamp);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: 0.35 + 0.65 * p, transform: `translateX(${(1 - p) * -24}px)`}}>
              <Tick size={44} progress={tick} style={{opacity: 0.35 + 0.65 * Math.min(1, tick * 2), flexShrink: 0}} />
              <div style={{fontFamily: F.round, fontWeight: 500, fontSize: 40, lineHeight: 1.1, color: C.plum, whiteSpace: 'nowrap'}}>{txt}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: SAFE.left - 20, top: 1040}}>
        <PopIn delay={4} style={{position: 'relative'}} spin={-30}>
          <Watermelon size={120} />
        </PopIn>
      </div>
    </AbsoluteFill>
  );
};

/* ================= timeline ================= */
export const SPRAY_SFX_B = [2.5, 3.45, 6.45]; // spray moments in part B (local s), used by the audio mix

export const Overlays: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Beat from={0.1} to={4.7}><Hook /></Beat>
    <Beat from={4.9} to={7.15}><Steps /></Beat>
    <Beat from={7.2} to={9.6}><Semangat /></Beat>
    <Beat from={10.7} to={17.15}><Weather /></Beat>
    <Beat from={19.6} to={21.6}><Saviour /></Beat>
    <Beat from={21.75} to={24.38}><ProductTitle /></Beat>
    <Beat from={24.1} to={26.9}><SprayCloseup /></Beat>
    <Beat from={26.3} to={29.05}><FaceMist /></Beat>
    <Beat from={30.3} to={32.9}><Benefits /></Beat>
    <Beat from={33.2} to={36.65}><Ingredients /></Beat>
    <Beat from={39.7} to={41.35}><NoComplicated /></Beat>
    <Beat from={41.4} to={43.85}><Lazy /></Beat>
    <Beat from={43.85} to={45.45}><ThisOne /></Beat>
    <Beat from={B(0.2)} to={B(3.37)}><WhyHeader /></Beat>
    <Beat from={B(3.4)} to={B(6.4)}><Milky /></Beat>
    <Beat from={B(6.45)} to={B(7.85)}><Plump /></Beat>
    <Beat from={B(7.85)} to={B(12.47)}><Checklist /></Beat>
    <Sequence from={sec(A_SEC) - 12} durationInFrames={28} layout="none"><MistPuff /></Sequence>
  </AbsoluteFill>
);
