import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Star} from '../skin/Art';
import {bob, C, captionFont, clamp01, exitAt, FPS, italicFont, pop, roundFont, SAFE, SAFE_CENTER_X, sec} from '../skin/theme';

/* ============================================================================================
   FoamEdit – ~20 s whimsy edit of the Booo Fun Foam Cleanser clips
   (inspo structure: satisfying foam play first, product reveal at the end)
   ============================================================================================ */

export const FOAM_DURATION = 558; // 18.6 s @ 30 fps
const XF = 3; // frames of soft dissolve into every shot

// Camera watermark in some girl shots sits at x 60-490, y 200-250: those shots zoom around it and the
// product label sticker (fixed, top-left) covers it.
const WM_ORIGIN = '25.5% 11.7%';
type Shot = {at: number; dur: number; src: string; from: number; rate: number; z: [number, number]; audio: boolean; origin?: string; freezeAt?: number};
// at/dur in output seconds; from = start inside the source file (s); freezeAt = output-local second to hold the frame
const G = 'foam/girl.mp4';
const SHOTS: Shot[] = [
  {at: 0.0, dur: 2.5, src: G, from: 0.0, rate: 0.5, z: [1.0, 1.08], audio: false, origin: '50% 45%', freezeAt: 1.0}, // hook: holding the 3 cans
  {at: 2.5, dur: 2.27, src: G, from: 0.53, rate: 1.0, z: [1.08, 1.0], audio: false}, // spray foam
  {at: 4.77, dur: 0.49, src: G, from: 2.8, rate: 0.75, z: [1.0, 1.03], audio: false}, // foam close to face
  {at: 5.26, dur: 0.6, src: G, from: 3.17, rate: 0.77, z: [1.0, 1.03], audio: false, origin: WM_ORIGIN}, // wide, holding foam
  {at: 5.86, dur: 1.44, src: 'foam/b1.mp4', from: 0.4, rate: 1.2, z: [1.1, 1.0], audio: true}, // cutaway: foam heart
  {at: 7.3, dur: 1.63, src: G, from: 3.63, rate: 1.15, z: [1.0, 1.05], audio: false}, // hands squish
  {at: 8.93, dur: 0.5, src: G, from: 5.5, rate: 0.75, z: [1.0, 1.02], audio: false, origin: WM_ORIGIN}, // wide hands
  {at: 9.43, dur: 1.2, src: G, from: 5.87, rate: 0.5, z: [1.02, 1.05], audio: false, origin: WM_ORIGIN}, // foam on face, laughing
  {at: 10.63, dur: 0.9, src: 'foam/b4.mp4', from: 0.4, rate: 1.0, z: [1.0, 1.06], audio: true}, // cutaway: toss
  {at: 11.53, dur: 0.9, src: 'foam/b5.mp4', from: 0.5, rate: 1.0, z: [1.06, 1.0], audio: true}, // cutaway: catch
  {at: 12.43, dur: 2.77, src: G, from: 6.47, rate: 0.6, z: [1.0, 1.08], audio: false}, // close squish near face
];
const ENDCARD_AT = 15.2;

const easeIO = Easing.inOut(Easing.cubic);

const ShotView: React.FC<{s: Shot}> = ({s}) => {
  const f = useCurrentFrame(); // local to the sequence (starts XF frames early)
  const total = sec(s.dur) + XF;
  const z = interpolate(f, [XF, total], s.z, {easing: easeIO, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = interpolate(f, [0, XF], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: s.at === 0 ? 1 : o, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: s.origin ?? '50% 50%'}}>
        <Freeze frame={s.freezeAt === undefined ? 0 : sec(s.freezeAt)} active={s.freezeAt !== undefined && f >= sec(s.freezeAt)}>
          <OffthreadVideo
            src={staticFile(s.src)}
            startFrom={Math.max(0, Math.round(s.from * FPS) - (s.at === 0 ? 0 : Math.round(XF * s.rate)))}
            playbackRate={s.rate}
            muted={!s.audio}
            volume={s.audio ? 0.85 : 0}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </Freeze>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EndCardFootage: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, sec(3.4)], [1.0, 1.1], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity: interpolate(f, [0, XF], [0, 1], {extrapolateRight: 'clamp'})}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 60%'}}>
        <Freeze frame={9}>
          <OffthreadVideo src={staticFile('foam/girl.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Freeze>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Footage: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={Math.max(0, sec(s.at) - (s.at === 0 ? 0 : XF))} durationInFrames={sec(s.dur) + (s.at === 0 ? 0 : XF)}>
        <ShotView s={s} />
      </Sequence>
    ))}
    <Sequence from={sec(ENDCARD_AT) - XF}>
      <EndCardFootage />
    </Sequence>
  </AbsoluteFill>
);

/* ============================== graphics ============================== */
const SHADOW = '0 2px 0 rgba(74,58,78,0.3), 0 6px 18px rgba(40,25,35,0.4)';

/** bubbly rounded word with white outline (like the "boring…" / "what's that edit" references) */
const Bubbly: React.FC<{text: string; size: number; fill: string; stroke?: string; style?: React.CSSProperties}> = ({text, size, fill, stroke = '#fff', style}) => (
  <span
    style={{
      fontFamily: roundFont,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1,
      color: fill,
      WebkitTextStroke: `${Math.max(4, size * 0.09)}px ${stroke}`,
      paintOrder: 'stroke fill',
      textShadow: '0 6px 14px rgba(60,30,60,0.28)',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </span>
);

/** onomatopoeia sticker that pops, wobbles and pops away */
const Sfx: React.FC<{text: string; at: number; dur: number; x: number; y: number; rot?: number; fill?: string; size?: number}> = ({text, at, dur, x, y, rot = 0, fill = C.rose, size = 78}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(at + dur)) return null;
  const p = pop(f, at, FPS, 260, 9);
  const out = exitAt(f, at + dur - 0.2, 0.2);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p * out}) rotate(${rot + Math.sin(f / 4) * 3}deg)`}}>
      <Bubbly text={text} size={size} fill={fill} />
    </div>
  );
};

const HeartDoodle: React.FC<{x: number; y: number; s: number; at: number; end: number; color: string; rot?: number}> = ({x, y, s, at, end, color, rot = 0}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, FPS, 240, 9);
  const out = exitAt(f, end - 0.2, 0.2);
  if (f < sec(at)) return null;
  return (
    <svg width={80 * s} height={74 * s} viewBox="0 0 80 74" style={{position: 'absolute', left: x, top: y, transform: `scale(${p * out}) rotate(${rot + Math.sin((f + x) / 10) * 8}deg) translateY(${bob(f, 6, 40, x)}px)`}}>
      <path d="M40 68 C10 48 4 30 10 18 C16 6 32 6 40 20 C48 6 64 6 70 18 C76 30 70 48 40 68Z" fill={color} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={24} cy={22} rx={6} ry={4} fill="#fff" opacity={0.7} transform="rotate(-30 24 22)" />
    </svg>
  );
};

/** dotted toss arc drawn upward with a little star at the tip */
const TossArc: React.FC<{at: number; dur: number; flip?: boolean}> = ({at, dur, flip}) => {
  const f = useCurrentFrame();
  if (f < sec(at) || f > sec(at + dur)) return null;
  const k = clamp01((f - sec(at)) / 12);
  const out = exitAt(f, at + dur - 0.25, 0.25);
  const path = flip ? 'M720 1150 Q520 420 300 760' : 'M330 1150 Q540 420 760 760';
  const len = 1100;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: out * 0.9}}>
      <path d={path} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeDasharray="2 22" strokeDashoffset={0} pathLength={len} opacity={k} />
      <Star x={flip ? 300 : 760} y={760} s={2 * k} t={f} color={C.butter} />
    </svg>
  );
};

/** soft translucent bubbles drifting up (ambient, subtle) */
const Bubbles: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  if (f < sec(from) || f > sec(to)) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 9}).map((_, i) => {
        const x = 90 + random(`bx${i}`) * 820;
        const speed = 2 + random(`bs${i}`) * 2.5;
        const r = 10 + random(`br${i}`) * 18;
        const y = 1700 - ((f * speed + random(`by${i}`) * 1600) % 1600);
        const wob = Math.sin((f + i * 20) / 18) * 14;
        return (
          <g key={i} transform={`translate(${x + wob} ${y})`} opacity={0.55}>
            <circle r={r} fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.85)" strokeWidth={2.5} />
            <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.28} ry={r * 0.16} fill="#fff" transform={`rotate(-35 ${-r * 0.35} ${-r * 0.4})`} />
          </g>
        );
      })}
    </svg>
  );
};

/** pastel bubble wipe centred on a cut (cover -> reveal) */
const BubbleWipe: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const k = f - sec(at);
  if (k < -9 || k > 9) return null;
  const cover = k < 0 ? Easing.in(Easing.cubic)(clamp01((k + 9) / 9)) : 1 - Easing.out(Easing.cubic)(clamp01(k / 9));
  const cols = [C.blush, C.mint, C.butter, C.lavender, C.sky];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 24}).map((_, i) => {
        const x = (i % 4) * 330 + (Math.floor(i / 4) % 2) * 160 + 20;
        const y = Math.floor(i / 4) * 360 + 40;
        const d = random(`w${at}${i}`) * 0.35;
        const c = clamp01((cover - d) / (1 - d));
        return <circle key={i} cx={x} cy={y} r={300 * c} fill={cols[i % cols.length]} />;
      })}
    </svg>
  );
};

/** quick soft flash + sparkles on a cut */
const SparkleCut: React.FC<{at: number; x?: number; y?: number}> = ({at, x = 540, y = 900}) => {
  const f = useCurrentFrame();
  const k = f - sec(at) + 2;
  if (k < 0 || k > 18) return null;
  const glow = interpolate(k, [0, 2, 9], [0, 0.4, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${(x / 1080) * 100}% ${(y / 1920) * 100}%, rgba(255,252,240,1) 0%, rgba(255,241,168,0.5) 35%, rgba(255,241,168,0) 70%)`, opacity: glow}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 9}).map((_, i) => {
          const a = random(`sa${at}${i}`) * Math.PI * 2;
          const dd = (140 + random(`sd${at}${i}`) * 260) * (0.3 + k / 18);
          return <Star key={i} x={x + Math.cos(a) * dd} y={y + Math.sin(a) * dd} s={(1.3 + random(`ss${at}${i}`)) * (1 - k / 18)} t={f} color={i % 3 ? '#fff' : C.butter} phase={i * 7} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** small product label kept on screen during the foam play (like the inspo's product tag) */
const ProductTag: React.FC = () => {
  const f = useCurrentFrame();
  if (f < sec(2.5) || f > sec(ENDCARD_AT)) return null;
  const p = pop(f, 2.55, FPS, 180, 12);
  const out = exitAt(f, ENDCARD_AT - 0.2, 0.2);
  return (
    <div style={{position: 'absolute', top: 180, left: 40, opacity: out, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: '50% 50%'}}>
      <div
        style={{
          width: 476,
          height: 88,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          gap: 10,
          background: '#FFFBF0',
          border: `4px solid ${C.mint}`,
          borderRadius: 40,
          padding: '8px 24px 10px',
          boxShadow: '0 8px 20px rgba(40,25,35,0.22)',
        }}
      >
        <svg width={30} height={30} viewBox="0 0 30 30">
          <circle cx={11} cy={17} r={9} fill={C.sky} stroke={C.ink} strokeWidth={2.5} />
          <circle cx={21} cy={10} r={6} fill={C.blush} stroke={C.ink} strokeWidth={2.5} />
        </svg>
        <span style={{fontFamily: roundFont, fontWeight: 500, fontSize: 38, color: C.ink}}>Booo</span>
        <span style={{fontFamily: italicFont, fontStyle: 'italic', fontSize: 36, color: C.ink}}>Fun Foam Cleanser</span>
      </div>
    </div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f > sec(2.5)) return null;
  const p1 = pop(f, 0.35, FPS, 170, 11);
  const p2 = pop(f, 0.8, FPS, 220, 8);
  const out = exitAt(f, 2.3, 0.2);
  return (
    <div style={{position: 'absolute', top: 190, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center', opacity: out}}>
      <div style={{fontFamily: italicFont, fontStyle: 'italic', fontSize: 64, color: '#fff', textShadow: SHADOW, opacity: clamp01(p1), transform: `translateY(${(1 - p1) * 20}px)`}}>mainan ke</div>
      <div style={{transform: `scale(${p2}) rotate(${-4 + Math.sin(f / 6) * 2}deg)`, marginTop: 4}}>
        <Bubbly text="SABUN?!" size={140} fill={C.coral} />
      </div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  if (f < sec(ENDCARD_AT)) return null;
  const word = 'Booo';
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 190, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          {word.split('').map((ch, i) => {
            const p = pop(f, ENDCARD_AT + 0.15 + i * 0.07, FPS, 260, 8);
            return (
              <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * 60 + Math.sin((f + i * 6) / 6) * 5}px) scale(${p})`}}>
                <Bubbly text={ch} size={150} fill={[C.butterDeep, C.coral, '#5FCFC0', C.lavender][i]} />
              </span>
            );
          })}
        </div>
        <div style={{display: 'inline-block', fontFamily: italicFont, fontStyle: 'italic', fontSize: 56, color: C.ink, background: 'rgba(255,251,240,0.9)', borderRadius: 40, padding: '4px 30px 10px', marginTop: 10, boxShadow: '0 8px 20px rgba(40,25,35,0.2)', opacity: clamp01((f - sec(ENDCARD_AT + 0.4)) / 6), transform: `scale(${pop(f, ENDCARD_AT + 0.4, FPS, 200, 11)})`}}>Fun Foam Cleanser</div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Star x={170} y={230} s={2.4} t={f} color={C.butter} />
        <Star x={880} y={260} s={1.8} t={f} phase={30} />
        <Star x={820} y={560} s={1.4} t={f} color={C.rose} phase={60} />
        <Star x={210} y={560} s={1.3} t={f} phase={90} />
      </svg>
    </AbsoluteFill>
  );
};

/* ============================== captions (butter yellow, regular weight) ============================== */
const LINES: [number, number, string][] = [
  [0.3, 2.45, 'korang rasa ni mainan ke sabun?'],
  [2.55, 4.7, 'spray je terus jadi foam'],
  [4.8, 5.84, 'lembut macam marshmallow'],
  [5.9, 7.25, 'boleh bentuk jadi love pulak'],
  [7.35, 10.55, 'squishy & satisfying gila'],
  [10.65, 12.38, 'boleh main baling-baling'],
  [12.48, 15.1, 'tapi sebenarnya…'],
  [15.25, 18.5, 'sabun rupanya! mandi jadi fun'],
];
const CaptionLine: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / FPS;
  const line = LINES.find(([a, b]) => t >= a && t < b);
  if (!line) return null;
  const [a, b, text] = line;
  const words = text.split(' ');
  const per = Math.min(0.28, ((b - a) * 0.6) / words.length);
  const enter = spring({frame: f - sec(a), fps, config: {damping: 16, stiffness: 200, mass: 0.6}});
  const exit = interpolate(sec(b) - f, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 1300, left: SAFE_CENTER_X - 380, width: 760, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, opacity: Math.min(enter, exit)}}>
      {words.map((w, i) => {
        const k = spring({frame: f - sec(a + i * per), fps, config: {damping: 12, stiffness: 240, mass: 0.45}});
        return (
          <span
            key={i}
            style={{
              fontFamily: captionFont,
              fontWeight: 400,
              fontSize: 54,
              lineHeight: 1.25,
              color: C.butter,
              display: 'inline-block',
              opacity: f >= sec(a + i * per) ? 1 : 0,
              transform: `translateY(${(1 - k) * 10}px) scale(${0.9 + 0.1 * k})`,
              textShadow: '0 1px 0 rgba(60,45,40,0.55), 0 2px 3px rgba(40,28,30,0.55), 0 4px 16px rgba(30,20,25,0.5)',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Overlays: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Bubbles from={0} to={18.6} />
    <ProductTag />
    <Hook />
    {/* hearts around the foam heart cutaway */}
    <HeartDoodle x={120} y={640} s={1.2} at={6.0} end={7.3} color={C.rose} rot={-14} />
    <HeartDoodle x={800} y={700} s={0.9} at={6.15} end={7.3} color={C.blush} rot={12} />
    <HeartDoodle x={150} y={1120} s={0.8} at={6.3} end={7.3} color={C.lavender} rot={8} />
    <HeartDoodle x={790} y={1080} s={1.1} at={6.45} end={7.3} color={C.coral} rot={-6} />

    <Sfx text="psshh~" at={2.7} dur={1.4} x={220} y={820} rot={-8} fill={C.rose} />
    <Sfx text="soft!" at={7.45} dur={1.1} x={290} y={560} rot={-8} fill={C.butterDeep} />
    <Sfx text="hehe~" at={9.5} dur={1.1} x={250} y={1170} rot={-6} fill={C.lavender} size={74} />
    <TossArc at={10.63} dur={0.9} />
    <Sfx text="boing!" at={10.7} dur={0.8} x={300} y={560} rot={-10} fill={C.butterDeep} />
    <Sfx text="catch!" at={11.6} dur={0.8} x={720} y={600} rot={8} fill={C.coral} />
    <Sfx text="squishy~" at={12.7} dur={1.4} x={720} y={1140} rot={-4} fill="#7FD8B4" size={72} />

    <SparkleCut at={2.5} x={540} y={900} />
    <SparkleCut at={5.86} x={540} y={900} />
    <SparkleCut at={10.63} x={540} y={800} />
    <SparkleCut at={12.43} x={540} y={900} />
    <BubbleWipe at={ENDCARD_AT} />
    <EndCard />
    <Sfx text="sabun!" at={15.9} dur={2.4} x={540} y={1150} rot={-6} fill="#5FCFC0" size={96} />
    <CaptionLine />
  </AbsoluteFill>
);

/* ============================== audio ============================== */
type Sx = [number, string, number];
const SFX: Sx[] = [
  [0.35, 'pop', 0.14],
  [0.8, 'boing', 0.12],
  [2.5, 'sparkle', 0.1],
  [2.7, 'whoosh', 0.1],
  [5.86, 'sparkle', 0.1],
  [7.45, 'pop', 0.13],
  [7.7, 'squish', 0.16],
  [9.5, 'pop', 0.13],
  [10.7, 'boing', 0.13],
  [11.6, 'pop', 0.15],
  [12.7, 'squish', 0.16],
  [13.8, 'squish', 0.13],
  [14.9, 'whoosh', 0.12],
  [15.3, 'sparkle', 0.16],
  [15.4, 'ding', 0.12],
  [15.9, 'boing', 0.12],
];
const AudioMix: React.FC = () => (
  <>
    <Audio
      src={staticFile('audio/foam_music.wav')}
      volume={(f) => interpolate(f, [0, 6, FOAM_DURATION - 30, FOAM_DURATION], [0, 0.4, 0.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    {SFX.map(([at, name, v], i) => (
      <Sequence key={i} from={sec(at)} durationInFrames={40} layout="none">
        <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, FOAM_DURATION - 10, FOAM_DURATION], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#FFF8EE', opacity: o * 0.9}} />;
};

export const FoamEdit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Footage />
    <Overlays />
    <Fades />
    <AudioMix />
  </AbsoluteFill>
);
