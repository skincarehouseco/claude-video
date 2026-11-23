import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PhaseCard} from './PhaseCard';
import {C, FPS} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useT = () => useCurrentFrame() / FPS;

/* ------------------------------------------------------------------ primitives */

/** A block of text that is visible from `from` to `until` (seconds) with a soft scale/blur exit. */
const Block: React.FC<{from: number; until: number; style: React.CSSProperties; children: React.ReactNode}> = ({from, until, style, children}) => {
  const t = useT();
  if (t < from - 0.05 || t > until + 0.3) return null;
  const out = interpolate(t, [until - 0.02, until + 0.22], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <div style={{position: 'absolute', ...style, opacity: 1 - out, transform: `${style.transform ?? ''} scale(${1 - out * 0.08})`, filter: `blur(${out * 8}px)`}}>
      {children}
    </div>
  );
};

/** Word that bounces in at time `at` (springy pop, whimsy). */
const W: React.FC<{at: number; style?: React.CSSProperties; children: React.ReactNode; from?: 'up' | 'down' | 'left' | 'zoom'}> = ({
  at,
  style,
  children,
  from = 'up',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - Math.round(at * fps), fps, config: {damping: 11, stiffness: 170, mass: 0.6}});
  const o = interpolate(frame - Math.round(at * fps), [0, 4], [0, 1], clamp);
  const tr =
    from === 'zoom'
      ? `scale(${0.3 + 0.7 * p})`
      : from === 'left'
        ? `translateX(${(1 - p) * -40}px) scale(${0.85 + 0.15 * p})`
        : `translateY(${(1 - p) * (from === 'up' ? 34 : -34)}px) scale(${0.8 + 0.2 * p})`;
  return <span style={{display: 'inline-block', opacity: o, transform: tr, transformOrigin: '50% 70%', ...style}}>{children}</span>;
};

/** Handwriting reveal: wipes the text in from left to right between `at` and `at + dur`. */
const Write: React.FC<{at: number; dur: number; style?: React.CSSProperties; children: React.ReactNode}> = ({at, dur, style, children}) => {
  const t = useT();
  const p = interpolate(t, [at, at + dur], [0, 100], {...clamp, easing: Easing.inOut(Easing.quad)});
  if (t < at) return null;
  return (
    <span style={{display: 'inline-block', clipPath: `inset(-30% ${100 - p}% -30% -5%)`, ...style}}>{children}</span>
  );
};

/** Letter-by-letter typing. */
const Type: React.FC<{at: number; dur: number; text: string; style?: React.CSSProperties}> = ({at, dur, text, style}) => {
  const t = useT();
  const n = Math.floor(interpolate(t, [at, at + dur], [0, text.length], clamp));
  if (t < at) return null;
  return <span style={style}>{text.slice(0, Math.max(1, n))}</span>;
};

/** Four-point twinkle star. */
const Twinkle: React.FC<{x: number; y: number; at: number; size?: number; color?: string; until?: number}> = ({x, y, at, size = 40, color = C.cream, until = 999}) => {
  const t = useT();
  if (t < at || t > until + 0.3) return null;
  const local = t - at;
  const s = interpolate(local, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))}) * (1 - interpolate(t, [until, until + 0.25], [0, 1], clamp));
  const pulse = 0.85 + 0.15 * Math.sin(local * 7);
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${s * pulse}) rotate(${local * 40}deg)`, filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))'}}>
      <path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z" fill={color} />
    </svg>
  );
};

/* ------------------------------------------------------------------ styles (match the reference edit) */

const shadow = '0 3px 14px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.35)';
const white = (size: number, weight = 500): React.CSSProperties => ({fontFamily: 'Round', fontWeight: weight, fontSize: size, color: '#fff', textShadow: shadow, lineHeight: 0.95});
const yellow = (size: number): React.CSSProperties => ({fontFamily: 'Round', fontWeight: 600, fontSize: size, color: '#FFE45C', textShadow: '0 3px 14px rgba(120,80,0,0.35)', lineHeight: 0.9});
const neon = (size: number, color = C.neon): React.CSSProperties => ({
  fontFamily: 'Script',
  fontSize: size,
  color: '#fff',
  lineHeight: 1,
  textShadow: `0 0 6px ${color}, 0 0 16px ${color}, 0 0 34px ${color}, 0 0 60px ${color}`,
});
const scribble = (size: number, color = '#fff'): React.CSSProperties => ({fontFamily: 'Scribble', fontWeight: 500, fontSize: size, color, textShadow: shadow, lineHeight: 0.9});
const box: React.CSSProperties = {fontFamily: 'Serif', fontSize: 66, color: C.ink, background: C.butterBox, padding: '2px 14px 4px', lineHeight: 1.05, display: 'inline-block', boxShadow: '0 6px 18px rgba(0,0,0,0.15)'};

/* ------------------------------------------------------------------ comment-reply sticker (hook) */

const CommentSticker: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = spring({frame: frame - 8, fps, config: {damping: 12, stiffness: 150, mass: 0.7}});
  const out = interpolate(t, [6.85, 7.1], [0, 1], clamp);
  if (t > 7.2) return null;
  const bob = Math.sin(t * 2.2) * 4;
  return (
    <div
      style={{
        position: 'absolute',
        left: 265,
        top: 905 + bob,
        width: 440,
        background: '#fff',
        borderRadius: 18,
        padding: '14px 22px 18px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        transform: `scale(${(0.5 + 0.5 * p) * (1 - out * 0.3)}) rotate(${(1 - p) * -6}deg)`,
        opacity: Math.min(1, p * 1.5) * (1 - out),
        transformOrigin: '20% 50%',
      }}
    >
      <div style={{fontFamily: 'Cap', fontWeight: 500, fontSize: 19, color: '#8a8a8a', marginLeft: 58}}>Reply to pnabf🍉's comment</div>
      <div style={{display: 'flex', gap: 14, marginTop: 6}}>
        <div style={{width: 44, height: 44, borderRadius: 22, background: '#f1f1f1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26}}>🍉</div>
        <div style={{fontFamily: 'Cap', fontWeight: 700, fontSize: 29, color: '#161616', lineHeight: 1.18}}>
          kalo stop pakai sbb habis, nnti bulu mata jadi pendek/gugur tak?😓
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ section titles */

export const Graphics: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {/* 1. hook: WHAT IF I STOP using lash serum? */}
    <Block from={0} until={3.05} style={{left: 105, top: 600, width: 760}}>
      <div style={{fontFamily: 'Hand', fontSize: 104, color: '#fff', textShadow: shadow, letterSpacing: 2, lineHeight: 1}}>
        <W at={0.12}>WHAT</W> <W at={0.89}>iF</W> <W at={1.09}>i</W> <W at={1.35} from="zoom">STOP</W>
      </div>
      <div style={{marginLeft: 30, marginTop: -6}}>
        <Write at={1.5} dur={1.0} style={scribble(84)}>
          using lash serum?
        </Write>
      </div>
    </Block>
    <Twinkle x={830} y={600} at={1.4} until={3.0} size={46} />
    <Twinkle x={150} y={590} at={1.7} until={3.0} size={28} color="#FFE45C" />
    <CommentSticker />

    {/* 2. bila you stop pakai after around 3 months */}
    <Block from={3.2} until={7.0} style={{left: 360, top: 300, width: 540, textAlign: 'center'}}>
      <div>
        <W at={3.22} style={white(66)}>bila you</W>
      </div>
      <div style={{marginTop: 4, marginLeft: 60}}>
        <W at={3.5} from="zoom" style={yellow(118)}>stop</W>
      </div>
      <div style={{marginLeft: 150}}>
        <W at={3.7} from="zoom" style={yellow(118)}>pakai</W>
      </div>
      <div style={{marginLeft: 170, marginTop: 4}}>
        <W at={4.94} style={white(44, 400)}>after around</W>
      </div>
      <div style={{marginLeft: 150, marginTop: -4}}>
        <Write at={5.75} dur={0.6} style={scribble(86, '#FFD3E8')}>3 months</Write>
      </div>
    </Block>
    <Twinkle x={385} y={420} at={3.6} until={6.9} size={34} color="#FFE45C" />

    {/* 3. your lashes akan gugur */}
    <Block from={7.1} until={8.95} style={{left: 110, top: 250, width: 800}}>
      <div style={{position: 'relative', height: 330}}>
        <W at={7.15} style={{...white(60), position: 'absolute', left: 40, top: 0}}>your</W>
        <W at={7.28} style={{...yellow(110), position: 'absolute', left: 20, top: 52}}>lashes</W>
        <W at={7.82} style={{...white(42, 400), position: 'absolute', left: 250, top: 158}}>akan</W>
        <div style={{position: 'absolute', left: 390, top: 110}}>
          <Write at={8.3} dur={0.5} style={neon(160)}>gugur</Write>
        </div>
      </div>
    </Block>

    {/* 4. dan tumbuh semula dalam keadaan asal */}
    <Block from={9.0} until={12.1} style={{left: 200, top: 760, width: 620, textAlign: 'center'}}>
      <div>
        <W at={9.0} style={white(58)}>dan</W>
      </div>
      <div>
        <W at={9.26} from="zoom" style={yellow(108)}>tumbuh</W>
      </div>
      <div style={{marginLeft: 220, marginTop: -6}}>
        <W at={9.78} style={white(46, 400)}>semula</W>
      </div>
      <div style={{marginTop: 4}}>
        <Write at={10.75} dur={0.35} style={scribble(80)}>dalam</Write>
      </div>
      <div>
        <Write at={10.9} dur={0.7} style={scribble(92)}>keadaan asal</Write>
      </div>
    </Block>
    <Twinkle x={760} y={800} at={9.3} until={12.0} size={40} />
    <Twinkle x={240} y={1040} at={11.0} until={12.0} size={30} color="#FFE45C" />

    {/* 5. TAPI JAP!  ->  BEFORE YOU ASSUME */}
    <Block from={12.2} until={12.95} style={{left: 80, top: 470, width: 830, textAlign: 'center'}}>
      <W at={12.22} from="zoom" style={{...white(170, 600), letterSpacing: 6}}>TAPI</W>
      <br />
      <W at={12.34} from="zoom" style={{...white(170, 600), letterSpacing: 6}}>JAP!</W>
    </Block>
    <Block from={12.97} until={14.05} style={{left: 80, top: 470, width: 830, textAlign: 'center'}}>
      <W at={12.99} from="zoom" style={{...white(140, 600), letterSpacing: 5}}>BEFORE</W>
      <br />
      <W at={13.2} from="zoom" style={{...white(140, 600), letterSpacing: 5}}>YOU</W>
      <br />
      <W at={13.36} style={{...white(120, 600), color: 'rgba(255,255,255,0.45)', letterSpacing: 5}}>ASSUME</W>
    </Block>

    {/* 6. lash serum tak bagi permanent result? */}
    <Block from={14.15} until={17.25} style={{left: 120, top: 380, width: 760, transform: 'rotate(-10deg)'}}>
      <Write at={14.7} dur={1.2} style={{fontFamily: 'Thin', fontSize: 66, color: '#FFF6C8', textShadow: shadow, lineHeight: 1.1}}>
        · lash serum tak bagi
      </Write>
      <br />
      <Write at={15.9} dur={0.9} style={{fontFamily: 'Thin', fontSize: 66, color: '#FFF6C8', textShadow: shadow, lineHeight: 1.1, marginLeft: 50}}>
        permanent result?
      </Write>
    </Block>

    {/* 7. you need to understand */}
    <Block from={17.35} until={18.6} style={{left: 140, top: 250, width: 740}}>
      <W at={17.37} style={{...white(64), marginLeft: 40}}>you need to</W>
      <div style={{marginTop: -10, marginLeft: 120}}>
        <Write at={17.78} dur={0.45} style={neon(150)}>understand</Write>
      </div>
    </Block>

    {/* 8. proses kitaran semula jadi tubuh  +  rambut gugur is normal! */}
    <Block from={18.62} until={22.45} style={{left: 140, top: 270, width: 740, textAlign: 'center'}}>
      <div>
        <W at={18.65} style={box}>proses</W>
        <W at={19.0} style={{...box, marginLeft: -2}}>kitaran</W>
      </div>
      <div style={{marginTop: 6}}>
        <W at={19.29} style={box}>semula</W>
        <W at={19.66} style={{...box, marginLeft: -2}}>jadi</W>
        <W at={19.97} style={{...box, marginLeft: -2}}>tubuh</W>
      </div>
    </Block>
    <Block from={20.62} until={22.45} style={{left: 200, top: 1040, width: 620, textAlign: 'center'}}>
      <div>
        <W at={20.67} style={box}>rambut gugur</W>
      </div>
      <div style={{marginTop: 6}}>
        <W at={21.07} style={box}>is</W>
        <W at={21.49} from="zoom" style={{...box, marginLeft: -2}}>normal!</W>
      </div>
    </Block>
    <Twinkle x={830} y={300} at={19.0} until={22.4} size={36} color="#FFE45C" />

    {/* 9. it is part of body biology (arched handwriting) */}
    <BiologyArc />

    {/* 10/11. anagen + telogen cards */}
    <PhaseCard />

    {/* 12. consistency is important! */}
    <Block from={47.45} until={50.0} style={{left: 100, top: 255, width: 790, textAlign: 'center'}}>
      <div>
        <Type at={47.5} dur={0.75} text="consistency" style={{...box, fontFamily: 'Round', fontWeight: 500, fontSize: 104, color: C.pink, padding: '0 18px 8px'}} />
      </div>
      <div style={{marginTop: 6}}>
        <W at={48.37} from="zoom" style={{...box, fontFamily: 'Round', fontWeight: 500, fontSize: 104, color: C.pink, padding: '0 18px 8px'}}>is</W>
      </div>
      <div style={{marginTop: 6}}>
        <Type at={49.0} dur={0.45} text="important!" style={{...box, fontFamily: 'Round', fontWeight: 500, fontSize: 104, color: C.pink, padding: '0 18px 8px'}} />
      </div>
    </Block>
    <Twinkle x={160} y={300} at={48.4} until={49.95} size={44} color="#FFE45C" />
    <Twinkle x={850} y={590} at={49.3} until={49.95} size={36} />

    {/* 13. bukan setakat untuk dapat the result */}
    <Block from={50.15} until={52.6} style={{left: 130, top: 300, width: 760}}>
      <W at={50.18} style={white(96, 600)}>bukan</W>
      <W at={50.49} style={{...white(46, 400), marginLeft: 10}}>setakat</W>
      <div style={{marginLeft: 70, marginTop: -6}}>
        <W at={50.85} style={white(46, 400)}>untuk</W>
        <W at={51.07} from="zoom" style={{...yellow(96), color: '#FF7AB8', marginLeft: 12}}>dapat</W>
      </div>
      <div style={{marginLeft: 160, marginTop: -8}}>
        <Write at={51.5} dur={0.55} style={scribble(96)}>the result</Write>
      </div>
    </Block>

    {/* 14. tapi juga untuk maintain the result */}
    <Block from={52.72} until={55.5} style={{left: 110, top: 300, width: 800}}>
      <W at={52.77} style={white(96, 600)}>tapi</W>
      <span style={{display: 'inline-flex', flexDirection: 'column', verticalAlign: 'top', marginLeft: 10, marginTop: 6}}>
        <W at={52.87} style={white(40, 400)}>juga</W>
        <W at={53.11} style={white(40, 400)}>untuk</W>
      </span>
      <W at={53.53} from="zoom" style={{...yellow(104), marginLeft: 12}}>maintain</W>
      <div style={{marginLeft: 200, marginTop: -6}}>
        <Write at={53.95} dur={0.6} style={scribble(100)}>the result</Write>
      </div>
    </Block>
    <Twinkle x={860} y={330} at={53.6} until={55.3} size={44} color="#FFE45C" />
    <Twinkle x={150} y={560} at={54.2} until={55.3} size={30} />
  </AbsoluteFill>
);

const BiologyArc: React.FC = () => {
  const t = useT();
  if (t < 22.5 || t > 25.1) return null;
  const p = interpolate(t, [22.55, 24.2], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const out = interpolate(t, [24.8, 25.05], [0, 1], clamp);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: `drop-shadow(0 3px 8px rgba(0,0,0,0.35)) blur(${out * 6}px)`}}>
      <defs>
        <path id="arc" d="M 120 640 C 300 330, 640 300, 880 560" />
        <clipPath id="arcClip">
          <rect x={100} y={250} width={800 * p} height={500} />
        </clipPath>
      </defs>
      <text style={{fontFamily: 'Scribble', fontSize: 76, fontWeight: 500}} fill="#fff" clipPath="url(#arcClip)">
        <textPath href="#arc" startOffset="2%">
          it is part of body biology
        </textPath>
      </text>
    </svg>
  );
};
