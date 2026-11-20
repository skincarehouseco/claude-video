import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, pixelFont, roundFont, SAFE} from '../theme';
import {BEATS, handFont, scriptFont} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SOFT = {damping: 14, stiffness: 150, mass: 0.7};
const ZONE_L = SAFE.left; // 80
const ZONE_W = SAFE.right - SAFE.left; // 830
const TOP_Y = SAFE.top + 70; // 230: text block sits in the upper third, like the reference

/* ------------------------------------------------------------------ */
/* typography                                                          */
/* ------------------------------------------------------------------ */
// Thin outline + soft shadow keeps the light butter yellow readable on the pale wall and the leopard hijab
// without making the letters look heavy.
const OUTLINE = '#4B3340';
const softShadow = '0 4px 14px rgba(40,22,32,0.45)';
const outlined = (w: number): React.CSSProperties => ({
  WebkitTextStroke: `${w}px ${OUTLINE}`,
  paintOrder: 'stroke fill',
  textShadow: softShadow,
});

type Tok = {t: string; font?: 'hand' | 'pixel' | 'script'; color?: string; size?: number; spark?: boolean};
const FONT = {hand: handFont, pixel: pixelFont, script: scriptFont};

/** words spring in one by one (2-frame stagger), drift gently, then lift away at the end of the beat */
const Lines: React.FC<{lines: Tok[][]; top: number; size?: number; delay?: number; gap?: number; hold?: boolean}> = ({
  lines,
  top,
  size = 74,
  delay = 3,
  gap = 2,
  hold = false,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const exit = hold ? 0 : interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  let idx = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: ZONE_L,
        width: ZONE_W,
        top,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 24}px)`,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 18}}>
          {line.map((tok, ti) => {
            const i = idx++;
            const p = spring({frame: frame - delay - i * gap, fps, config: SOFT});
            const rot = (random(`r${li}${ti}${tok.t}`) - 0.5) * 6;
            const bob = Math.sin((frame + i * 11) / 13) * 2.5;
            const s = tok.size ?? (tok.font === 'script' ? size * 1.25 : tok.font === 'pixel' ? size * 0.92 : size);
            if (tok.spark) {
              return (
                <div key={ti} style={{transform: `scale(${p}) rotate(${(1 - p) * 90}deg)`, marginTop: -6}}>
                  <PixelSparkle size={s * 0.85} color={C.butter} phase={i * 7} />
                </div>
              );
            }
            return (
              <span
                key={ti}
                style={{
                  display: 'inline-block',
                  fontFamily: FONT[tok.font ?? 'hand'],
                  fontWeight: 400,
                  fontSize: s,
                  lineHeight: tok.font === 'script' ? 1.15 : 1.12,
                  letterSpacing: tok.font === 'pixel' ? 2 : 0.5,
                  color: tok.color ?? C.butter,
                  opacity: Math.min(1, p * 1.5),
                  transform: `translateY(${(1 - p) * 26 + bob}px) scale(${0.7 + 0.3 * p}) rotate(${rot * p}deg)`,
                  whiteSpace: 'nowrap',
                  ...outlined(tok.font === 'script' ? 6 : 7),
                }}
              >
                {tok.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* little graphics                                                     */
/* ------------------------------------------------------------------ */
// pixel-art 4-point sparkle (the ✨ in the reference, drawn in the pixel style of the font reference)
export const PixelSparkle: React.FC<{size?: number; color?: string; phase?: number}> = ({size = 44, color = C.cream, phase = 0}) => {
  const frame = useCurrentFrame();
  const tw = 0.78 + 0.22 * Math.sin((frame + phase) / 6);
  const px = [
    [3, 0], [3, 1], [3, 2], [2, 3], [1, 3], [0, 3], [4, 3], [5, 3], [6, 3], [3, 4], [3, 5], [3, 6], [3, 3], [2, 2], [4, 2], [2, 4], [4, 4],
  ];
  return (
    <svg width={size} height={size} viewBox="-1 -1 9 9" style={{transform: `scale(${tw})`, filter: 'drop-shadow(0 0 6px rgba(255,246,200,0.95))', overflow: 'visible'}}>
      {px.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={1.02} height={1.02} fill={x === 3 && y === 3 ? '#fff' : color} stroke={OUTLINE} strokeWidth={0.22} />
      ))}
    </svg>
  );
};

const PixelHeart: React.FC<{size?: number; color?: string}> = ({size = 40, color = C.pink}) => {
  const rows = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  return (
    <svg width={size} height={(size * 6) / 7} viewBox="0 0 7 6" shapeRendering="crispEdges">
      {rows.flatMap((r, y) =>
        r.split('').map((ch, x) => (ch === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={x === 1 && y === 1 ? '#fff' : color} /> : null)),
      )}
    </svg>
  );
};

/** soft sparkle burst used to punctuate text-beat changes */
const Burst: React.FC<{x: number; y: number; n?: number; seed: string; spread?: number}> = ({x, y, n = 7, seed, spread = 170}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(seed + i) * 0.6;
        const d = interpolate(frame, [0, 16], [0, spread * (0.6 + 0.4 * random(seed + 'd' + i))], {...clamp, easing: Easing.out(Easing.cubic)});
        const o = interpolate(frame, [0, 3, 12, 20], [0, 1, 1, 0], clamp);
        const s = 18 + 16 * random(seed + 's' + i);
        return (
          <div key={i} style={{position: 'absolute', left: x + Math.cos(a) * d - s / 2, top: y + Math.sin(a) * d - s / 2, opacity: o}}>
            <PixelSparkle size={s} color={i % 2 ? C.pink : C.butter} phase={i * 5} />
          </div>
        );
      })}
    </>
  );
};

/* ---- beat 1: comment bubble "pakai mana dulu ? merah or pink ?" ---- */
const CommentBubble: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = spring({frame: frame - 1, fps, config: {damping: 11, stiffness: 170, mass: 0.6}});
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], {...clamp, easing: Easing.in(Easing.back(1.6))});
  const wobble = Math.sin(frame / 9) * 1.2;
  const typed = (s: string, startF: number) => s.slice(0, Math.max(0, Math.floor((frame - startF) * 1.6)));
  const l1 = 'pakai mana dulu ?';
  const l2 = 'merah or pink ?';
  return (
    <div
      style={{
        position: 'absolute',
        left: ZONE_L + 40,
        top: SAFE.top + 40,
        transformOrigin: '12% 100%',
        transform: `scale(${(0.4 + 0.6 * p) * (1 - exit)}) rotate(${-3 + wobble + (1 - p) * -10}deg)`,
        opacity: Math.min(1, p * 1.6) * (1 - exit),
      }}
    >
      <div
        style={{
          position: 'relative',
          background: '#FFFDF6',
          borderRadius: 34,
          padding: '20px 34px 24px 26px',
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          border: `5px solid ${C.pink}`,
          boxShadow: `0 8px 0 ${C.rose}, 0 18px 34px rgba(60,30,45,0.3)`,
          minWidth: 590,
        }}
      >
        {/* avatar */}
        <div style={{width: 84, height: 84, borderRadius: 42, background: `linear-gradient(160deg, ${C.pink}, ${C.lavender})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid #fff'}}>
          <PixelHeart size={44} color={C.rose} />
        </div>
        <div>
          <div style={{fontFamily: roundFont, fontWeight: 500, fontSize: 30, color: '#9C8A93', marginBottom: 2}}>Reply to comment</div>
          <div style={{fontFamily: handFont, fontSize: 60, lineHeight: 1.08, color: C.plum, minHeight: 64}}>{typed(l1, 4)}</div>
          <div style={{fontFamily: handFont, fontSize: 60, lineHeight: 1.08, color: C.plum, minHeight: 64}}>
            {(() => {
              const s = typed(l2, 4 + l1.length / 1.6);
              // colour-code "merah" and "pink" to the two tubes
              return s.split(/(merah|pink)/).map((part, i) => (
                <span key={i} style={{color: part === 'merah' ? '#D6336C' : part === 'pink' ? '#F06BA8' : undefined}}>
                  {part}
                </span>
              ));
            })()}
          </div>
        </div>
        {/* tail */}
        <div style={{position: 'absolute', left: 54, bottom: -30, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `32px solid ${C.pink}`}} />
        <div style={{position: 'absolute', left: 60, bottom: -20, width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '24px solid #FFFDF6'}} />
      </div>
      <div style={{position: 'absolute', right: -24, top: -28}}>
        <PixelSparkle size={52} phase={3} />
      </div>
    </div>
  );
};

/* ---- beat 3 graphic: a little sprout that grows next to "for growth" ---- */
const Sprout: React.FC<{x: number; y: number; delay: number}> = ({x, y, delay}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const g = interpolate(frame - delay, [0, 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const leaf = spring({frame: frame - delay - 14, fps, config: {damping: 10, stiffness: 160}});
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], clamp);
  const sway = Math.sin(frame / 10) * 4;
  return (
    <svg width={110} height={130} viewBox="0 0 110 130" style={{position: 'absolute', left: x, top: y, opacity: exit, transform: `rotate(${sway}deg)`, transformOrigin: '50% 100%', overflow: 'visible'}}>
      <path d="M55 128 C55 100 52 80 56 52" stroke={OUTLINE} strokeWidth={13} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
      <path d="M55 128 C55 100 52 80 56 52" stroke="#9BDDB0" strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
      <g transform={`translate(56 60) scale(${leaf})`}>
        <path d="M0 0 C-10 -26 -38 -32 -46 -22 C-38 -6 -16 4 0 0 Z" fill="#B9EBC6" stroke={OUTLINE} strokeWidth={4} />
        <path d="M0 -6 C10 -32 38 -40 48 -30 C40 -12 18 -2 0 -6 Z" fill="#9BDDB0" stroke={OUTLINE} strokeWidth={4} />
      </g>
    </svg>
  );
};

/* ---- jelly droplets that squish-bounce for "jelly lash oil" ---- */
const JellyDrop: React.FC<{x: number; y: number; delay: number; color: string; size?: number}> = ({x, y, delay, color, size = 56}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 8, stiffness: 140, mass: 0.6}});
  const k = frame - delay;
  // bounce cycle with squash on landing
  const cyc = (k % 26) / 26;
  const hop = k < 0 ? 0 : Math.abs(Math.sin(cyc * Math.PI)) * 22;
  const squash = k < 0 ? 1 : 1 + 0.16 * Math.max(0, Math.cos(cyc * Math.PI * 2)) * (hop < 6 ? 1 : 0);
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], clamp);
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 80 96"
      style={{position: 'absolute', left: x, top: y - hop, opacity: Math.min(1, p * 2) * exit, transform: `scale(${p * squash}, ${p / squash})`, transformOrigin: '50% 100%', overflow: 'visible'}}
    >
      <path d="M40 4 C56 30 74 46 74 64 C74 84 58 94 40 94 C22 94 6 84 6 64 C6 46 24 30 40 4 Z" fill={color} stroke={OUTLINE} strokeWidth={5} />
      <ellipse cx="27" cy="60" rx="7" ry="12" fill="#fff" opacity={0.75} />
      <circle cx="31" cy="72" r="3.4" fill={OUTLINE} />
      <circle cx="50" cy="72" r="3.4" fill={OUTLINE} />
      <path d="M36 80 Q40 84 45 80" stroke={OUTLINE} strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/* ---- floating water droplets for "hydrating serum" ---- */
const Drops: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], clamp);
  const spots: [number, number, number][] = [
    [ZONE_L + 30, TOP_Y + 175, 0],
    [SAFE.right - 70, TOP_Y + 160, 8],
  ];
  return (
    <>
      {spots.map(([x, y, d], i) => {
        const k = frame - 6 - d;
        const o = interpolate(k, [0, 8], [0, 1], clamp) * exit;
        const fy = Math.sin((frame + d * 5) / 12) * 8;
        return (
          <svg key={i} width={46} height={58} viewBox="0 0 80 100" style={{position: 'absolute', left: x, top: y + fy, opacity: o, transform: `rotate(${i ? 12 : -12}deg)`}}>
            <path d="M40 4 C56 30 74 48 74 66 C74 86 58 96 40 96 C22 96 6 86 6 66 C6 48 24 30 40 4 Z" fill={C.sky} stroke={OUTLINE} strokeWidth={5} />
            <ellipse cx="27" cy="62" rx="7" ry="12" fill="#fff" opacity={0.8} />
          </svg>
        );
      })}
    </>
  );
};

/* ---- final CTA: "WAJIB CUBA NI!" letters hop in on the beat ---- */
const BouncyWord: React.FC<{text: string; size: number; delay: number}> = ({text, size, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap'}}>
      {text.split('').map((ch, i) => {
        const p = spring({frame: frame - delay - i * 0.7, fps, config: {damping: 9, stiffness: 190, mass: 0.5}});
        const wave = Math.sin((frame - i * 3) / 5) * 4 * Math.min(1, p);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: ch === ' ' ? size * 0.35 : undefined,
              fontFamily: pixelFont,
              fontWeight: 400,
              fontSize: size,
              lineHeight: 1.1,
              letterSpacing: 1,
              color: C.butter,
              opacity: Math.min(1, p * 1.6),
              transform: `translateY(${(1 - p) * 50 + wave}px) scale(${p})`,
              ...outlined(8),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* ambient twinkles (very sparse so the screen never gets crowded)     */
/* ------------------------------------------------------------------ */
const Twinkles: React.FC = () => {
  const frame = useCurrentFrame();
  const spots: [number, number, number, string][] = [
    [ZONE_L + 10, SAFE.top + 10, 0, C.butter],
    [SAFE.right - 40, SAFE.top + 330, 40, C.pink],
    [SAFE.right - 60, SAFE.bottom - 120, 90, C.cream],
    [ZONE_L + 20, SAFE.bottom - 300, 130, C.lavender],
  ];
  return (
    <>
      {spots.map(([x, y, ph, col], i) => {
        const cycle = ((frame + ph) % 110) / 110;
        const o = Math.sin(cycle * Math.PI) ** 2 * 0.85;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y + Math.sin((frame + ph) / 20) * 6, opacity: o}}>
            <PixelSparkle size={26} color={col} phase={ph} />
          </div>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* the beats                                                           */
/* ------------------------------------------------------------------ */
const S = (t: string, o: Partial<Tok> = {}): Tok => ({t, ...o});
const SP: Tok = {t: '✨', spark: true};
const pinkPixel = {font: 'pixel' as const, color: C.pink};
const bluePixel = {font: 'pixel' as const, color: C.sky};

const beatContent: Record<string, React.ReactNode> = {
  comment: <CommentBubble />,
  tonic: (
    <>
      <Lines top={TOP_Y + 20} lines={[[S('pakai'), S('lash tonic', pinkPixel), S('dulu!')]]} />
      <Burst x={495} y={TOP_Y + 60} seed="tonic" />
    </>
  ),
  root: (
    <>
      <Lines top={TOP_Y} lines={[[SP, S('root treatment')], [SP, S('for'), S('growth', {...pinkPixel, color: C.mint})]]} />
      <Sprout x={SAFE.right - 150} y={TOP_Y + 40} delay={12} />
    </>
  ),
  focus: <Lines top={TOP_Y} lines={[[SP, S('focus on'), S('lebatkan', pinkPixel)], [S('bulu mata')]]} />,
  jelly: (
    <>
      <Lines top={TOP_Y + 20} lines={[[S('next'), S('jelly lash oil!', pinkPixel)]]} />
      <JellyDrop x={ZONE_L + 120} y={TOP_Y + 140} delay={12} color="#F48FB8" />
      <JellyDrop x={ZONE_L + 200} y={TOP_Y + 160} delay={17} color="#FFC2DA" size={44} />
      <JellyDrop x={SAFE.right - 190} y={TOP_Y + 150} delay={22} color="#E5577F" size={50} />
      <Burst x={495} y={TOP_Y + 60} seed="jelly" />
    </>
  ),
  hydrate: (
    <>
      <Lines top={TOP_Y} lines={[[SP, S('hydrating serum', bluePixel)], [SP, S('panjangkan bulu mata')]]} />
      <Drops />
    </>
  ),
  worry: (
    <Lines
      top={TOP_Y - 20}
      size={60}
      gap={1.2}
      lines={[[S("don't worry!", {font: 'script', color: C.pink, size: 92})], [S('lash oil ni akan serap into your')], [S('skin macam pakai'), S('skincare!', pinkPixel)]]}
    />
  ),
  cta: (
    <>
      <div style={{position: 'absolute', left: ZONE_L, width: ZONE_W, top: 1080}}>
        <Lines top={0} size={62} delay={1} gap={1} hold lines={[[S('nak bulu mata')], [S('macam Dahlia Rizal?')]]} />
        <div style={{position: 'absolute', top: 150, left: 0, width: ZONE_W}}>
          <BouncyWord text="WAJIB CUBA NI!" size={84} delay={4} />
        </div>
      </div>
      <Sequence from={5} layout="none">
        <Burst x={495} y={1290} n={10} seed="cta" spread={300} />
      </Sequence>
    </>
  ),
};

export const LashGraphics: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Twinkles />
    {BEATS.map((b) => (
      <Sequence key={b.id} from={b.from} durationInFrames={b.to - b.from + (b.id === 'cta' ? 0 : 3)} layout="none">
        {beatContent[b.id]}
      </Sequence>
    ))}
  </AbsoluteFill>
);
