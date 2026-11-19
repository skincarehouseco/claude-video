import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {cameraTransform, ORIGIN} from './camera';
import {Moon, Sparkle, Sun} from './Icons';
import {C, FPS, roundFont, SAFE, sec, serifFont, srcTime} from './theme';

/*
 * Morning / night scene (21.45s – 27.3s).
 * The real wall is replaced with an animated 2D cartoon background: the speaker is cut out
 * per-frame (BiRefNet portrait segmentation -> public/subject/s_XXXX.png) and composited on top.
 */

const W = 1080;
const H = 1920;
const NIGHT_AT = 24.15; // "...and retinol pula waktu malam"
const ease = Easing.inOut(Easing.cubic);

// deterministic pseudo-random
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Cloud: React.FC<{x: number; y: number; s: number; fill: string; shade: string; opacity?: number}> = ({
  x,
  y,
  s,
  fill,
  shade,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx="0" cy="22" rx="150" ry="34" fill={shade} />
    <circle cx="-80" cy="0" r="52" fill={fill} />
    <circle cx="-15" cy="-30" r="72" fill={fill} />
    <circle cx="60" cy="-8" r="58" fill={fill} />
    <circle cx="112" cy="14" r="38" fill={fill} />
    <rect x="-130" y="0" width="270" height="40" rx="20" fill={fill} />
  </g>
);

const Flower: React.FC<{x: number; y: number; c: string; f: number; i: number}> = ({x, y, c, f, i}) => {
  const sway = Math.sin(f / 18 + i) * 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway})`}>
      <path d="M0 0 C 4 -20 -4 -40 0 -60" stroke="#4FA85A" strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="10" cy="-30" rx="10" ry="5" fill="#5DBB66" transform="rotate(-30 10 -30)" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-74" rx="10" ry="15" fill={c} transform={`rotate(${a} 0 -60)`} />
      ))}
      <circle cx="0" cy="-60" r="9" fill="#FFD54F" />
    </g>
  );
};

const Butterfly: React.FC<{x: number; y: number; c: string; f: number}> = ({x, y, c, f}) => {
  const flap = 0.35 + 0.65 * Math.abs(Math.sin(f / 3));
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`scale(${flap} 1)`}>
        <ellipse cx="-14" cy="-6" rx="16" ry="12" fill={c} />
        <ellipse cx="14" cy="-6" rx="16" ry="12" fill={c} />
        <ellipse cx="-10" cy="10" rx="10" ry="8" fill={c} opacity="0.85" />
        <ellipse cx="10" cy="10" rx="10" ry="8" fill={c} opacity="0.85" />
      </g>
      <rect x="-2" y="-12" width="4" height="26" rx="2" fill="#5B4636" />
    </g>
  );
};

/* ---------------- morning ---------------- */
const MorningBg: React.FC<{f: number; sunDrop: number}> = ({f, sunDrop}) => {
  const sunX = 830;
  const sunY = 330 + sunDrop;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6EC1F5" />
          <stop offset="0.5" stopColor="#B9E4FF" />
          <stop offset="0.78" stopColor="#FFF2CF" />
          <stop offset="1" stopColor="#FFE3B8" />
        </linearGradient>
        <radialGradient id="sunglow">
          <stop offset="0" stopColor="#FFF7C2" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#FFF1A6" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFF1A6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBE0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFBE0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#msky)" />
      {/* sunbeams */}
      <g transform={`translate(${sunX} ${sunY})`}>
        {[110, 128, 146, 164, 182].map((a, i) => (
          <polygon
            key={a}
            points="0,0 -60,1500 60,1500"
            fill="url(#beam)"
            opacity={0.2 + 0.12 * Math.sin(f / 20 + i)}
            transform={`rotate(${a - 90 + Math.sin(f / 60) * 2})`}
          />
        ))}
      </g>
      <circle cx={sunX} cy={sunY} r={300} fill="url(#sunglow)" />
      {/* cute sun */}
      <g transform={`translate(${sunX} ${sunY})`}>
        <g transform={`rotate(${f * 0.6})`}>
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x="-9" y="-170" width="18" height="44" rx="9" fill="#FFCF3F" transform={`rotate(${i * 30})`} />
          ))}
        </g>
        <circle r="112" fill="#FFD84D" stroke="#FFC22E" strokeWidth="8" />
        <circle r="112" fill="none" stroke="#FFF3B0" strokeWidth="6" strokeDasharray="60 500" transform="rotate(-130)" />
        <ellipse cx="-36" cy="-12" rx="10" ry={Math.abs(Math.sin(f / 40)) > 0.97 ? 2 : 14} fill="#6B4B2A" />
        <ellipse cx="36" cy="-12" rx="10" ry={Math.abs(Math.sin(f / 40)) > 0.97 ? 2 : 14} fill="#6B4B2A" />
        <path d="M-26 26 Q0 50 26 26" stroke="#6B4B2A" strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="-62" cy="22" rx="16" ry="10" fill="#FF9CB0" opacity="0.8" />
        <ellipse cx="62" cy="22" rx="16" ry="10" fill="#FF9CB0" opacity="0.8" />
      </g>
      {/* drifting clouds */}
      <Cloud x={((f * 0.9 + 120) % 1500) - 200} y={500} s={0.9} fill="#FFFFFF" shade="#E3F2FF" />
      <Cloud x={((f * 0.5 + 900) % 1500) - 200} y={760} s={0.7} fill="#FFFFFF" shade="#E3F2FF" />
      <Cloud x={((f * 0.7 + 400) % 1500) - 200} y={930} s={0.55} fill="#FFFFFF" shade="#E3F2FF" opacity={0.9} />
      {/* birds */}
      {[0, 1, 2].map((i) => {
        const bx = ((f * 2.2 + i * 70) % 1400) - 150;
        const by = 520 + i * 40 + Math.sin(f / 10 + i) * 10;
        const w = 14 + Math.sin(f / 4 + i) * 6;
        return <path key={i} d={`M${bx - 18} ${by - w} Q${bx - 8} ${by - 4} ${bx} ${by} Q${bx + 8} ${by - 4} ${bx + 18} ${by - w}`} stroke="#4A6A8A" strokeWidth="5" fill="none" strokeLinecap="round" />;
      })}
      {/* hills */}
      <path d="M0 1330 Q 220 1200 470 1310 T 1080 1260 L1080 1920 L0 1920 Z" fill="#B7E8A2" />
      {/* lollipop trees */}
      {[
        [120, 1255, 1],
        [990, 1240, 0.9],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x="-8" y="0" width="16" height="70" rx="6" fill="#A97C50" />
          <circle cx="0" cy="-20" r="56" fill="#6FCB72" />
          <circle cx="-18" cy="-36" r="16" fill="#8EDB8C" />
        </g>
      ))}
      <path d="M0 1480 Q 300 1380 600 1470 T 1080 1430 L1080 1920 L0 1920 Z" fill="#8ED784" />
      <path d="M0 1650 Q 260 1580 540 1650 T 1080 1620 L1080 1920 L0 1920 Z" fill="#6CC56F" />
      {[60, 170, 280, 760, 870, 990, 420, 640].map((x, i) => (
        <Flower key={i} x={x} y={1500 + (i % 3) * 70 + (i > 5 ? 120 : 0)} c={[C.rose, '#FFFFFF', C.lavender, '#FFB3C6'][i % 4]} f={f} i={i} />
      ))}
      <Butterfly x={140 + Math.sin(f / 25) * 60} y={1080 + Math.cos(f / 18) * 40} c="#FFB3C6" f={f} />
      <Butterfly x={900 + Math.cos(f / 22) * 50} y={1180 + Math.sin(f / 16) * 40} c={C.lavender} f={f + 7} />
      {/* floating light specks */}
      {Array.from({length: 14}).map((_, i) => {
        const x = rnd(i) * W;
        const y = ((rnd(i + 50) * H - f * (0.6 + rnd(i + 9))) % H + H) % H;
        return <circle key={i} cx={x + Math.sin(f / 20 + i) * 10} cy={y} r={3 + rnd(i + 3) * 4} fill="#FFFBE0" opacity={0.5 + 0.4 * Math.sin(f / 9 + i)} />;
      })}
    </svg>
  );
};

/* ---------------- night ---------------- */
const NightBg: React.FC<{f: number; moonRise: number; t: number}> = ({f, moonRise, t}) => {
  const mx = 830;
  const my = 330 + moonRise;
  const shoot = interpolate(t, [25.3, 26.0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A1238" />
          <stop offset="0.5" stopColor="#1B2A6B" />
          <stop offset="0.8" stopColor="#36488F" />
          <stop offset="1" stopColor="#4B5AA0" />
        </linearGradient>
        <radialGradient id="moonglow">
          <stop offset="0" stopColor="#FFF6C8" stopOpacity="0.75" />
          <stop offset="0.4" stopColor="#C9D6FF" stopOpacity="0.25" />
          <stop offset="1" stopColor="#C9D6FF" stopOpacity="0" />
        </radialGradient>
        <mask id="crescent">
          <rect x="-200" y="-200" width="400" height="400" fill="#000" />
          <circle r="110" fill="#fff" />
          <circle cx="58" cy="-40" r="96" fill="#000" />
        </mask>
        <linearGradient id="shoot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#nsky)" />
      {/* stars */}
      {Array.from({length: 60}).map((_, i) => {
        const x = rnd(i + 100) * W;
        const y = rnd(i + 200) * 1250;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / (8 + rnd(i) * 10) + i));
        return <circle key={i} cx={x} cy={y} r={1.5 + rnd(i + 300) * 3} fill="#FFFFFF" opacity={tw} />;
      })}
      {/* shooting star */}
      {shoot > 0 && shoot < 1 && (
        <g transform={`translate(${-100 + shoot * 700} ${120 + shoot * 300}) rotate(25)`} opacity={Math.sin(shoot * Math.PI)}>
          <rect x="-220" y="-3" width="220" height="6" rx="3" fill="url(#shoot)" />
          <circle cx="0" cy="0" r="7" fill="#fff" />
        </g>
      )}
      <circle cx={mx} cy={my} r={320} fill="url(#moonglow)" />
      {/* cute sleepy crescent moon */}
      <g transform={`translate(${mx} ${my}) rotate(${-8 + Math.sin(f / 40) * 4})`}>
        <g mask="url(#crescent)">
          <circle r="110" fill="#FFF1B0" />
          <circle cx="-50" cy="30" r="14" fill="#F6DE86" />
          <circle cx="-20" cy="70" r="9" fill="#F6DE86" />
        </g>
        <path d="M-76 -6 Q-64 4 -52 -6" stroke="#6B4B2A" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M-66 30 Q-56 40 -46 32" stroke="#6B4B2A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="-84" cy="18" rx="10" ry="7" fill="#FF9CB0" opacity="0.8" />
      </g>
      {/* little zzz */}
      {[0, 1, 2].map((i) => {
        const p = ((f / 30 + i * 0.6) % 1.8) / 1.8;
        return (
          <text key={i} x={mx + 90 + p * 60} y={my - 60 - p * 120} fill="#E6ECFF" opacity={Math.sin(p * Math.PI)} fontFamily={roundFont} fontWeight={600} fontSize={34 + i * 6}>
            z
          </text>
        );
      })}
      {/* sparkle stars */}
      {[
        [140, 260, 46],
        [420, 140, 30],
        [300, 820, 34],
        [960, 760, 28],
        [620, 980, 24],
      ].map(([x, y, s], i) => {
        const tw = 0.6 + 0.4 * Math.sin(f / 7 + i * 2);
        return (
          <path
            key={i}
            d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z"
            fill="#FFF6C8"
            transform={`translate(${x - (s * tw) / 2} ${y - (s * tw) / 2}) scale(${(s * tw) / 100})`}
          />
        );
      })}
      {/* clouds */}
      <Cloud x={((f * 0.6 + 300) % 1500) - 200} y={560} s={0.8} fill="#2E3F82" shade="#25356F" opacity={0.85} />
      <Cloud x={((f * 0.4 + 1000) % 1500) - 200} y={900} s={0.6} fill="#34478F" shade="#2A3B7A" opacity={0.8} />
      {/* hills + tiny houses */}
      <path d="M0 1330 Q 220 1200 470 1310 T 1080 1260 L1080 1920 L0 1920 Z" fill="#26346E" />
      {[
        [150, 1236],
        [930, 1218],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-34" y="0" width="68" height="56" rx="6" fill="#1C2858" />
          <polygon points="-44,4 0,-34 44,4" fill="#1A2450" />
          <rect x="-14" y="16" width="28" height="22" rx="4" fill="#FFD66B" opacity={0.75 + 0.25 * Math.sin(f / 15 + i)} />
        </g>
      ))}
      <path d="M0 1480 Q 300 1380 600 1470 T 1080 1430 L1080 1920 L0 1920 Z" fill="#1D2A5C" />
      <path d="M0 1650 Q 260 1580 540 1650 T 1080 1620 L1080 1920 L0 1920 Z" fill="#152049" />
      {/* fireflies */}
      {Array.from({length: 16}).map((_, i) => {
        const x = rnd(i + 400) * W + Math.sin(f / 23 + i) * 40;
        const y = 1050 + rnd(i + 500) * 800 + Math.cos(f / 19 + i) * 30;
        const o = 0.3 + 0.7 * Math.abs(Math.sin(f / 11 + i * 1.7));
        return (
          <g key={i} opacity={o}>
            <circle cx={x} cy={y} r={14} fill="#FFE98A" opacity={0.25} />
            <circle cx={x} cy={y} r={5} fill="#FFF6C2" />
          </g>
        );
      })}
    </svg>
  );
};

/* ---------------- info card ---------------- */
const TimeCard: React.FC<{when: string; what: string; icon: React.ReactNode; bg: string; local: number; night: boolean}> = ({
  when,
  what,
  icon,
  bg,
  local,
  night,
}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: local, fps, config: {damping: 15, stiffness: 140, mass: 0.8}});
  const fl = Math.sin(local / 14) * 4;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left + 10,
        top: SAFE.top + 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 40 + fl}px) scale(${0.7 + 0.3 * p}) rotate(-2deg)`,
        transformOrigin: 'left top',
      }}
    >
      <div
        style={{
          fontFamily: serifFont,
          fontStyle: 'italic',
          fontSize: 76,
          lineHeight: 1.1,
          color: night ? '#FFF1B0' : '#F5892B',
          textShadow: night ? '0 3px 0 rgba(10,18,56,0.8), 0 6px 22px rgba(0,0,0,0.5)' : '0 3px 0 #FFFFFF, 0 -2px 0 #FFFFFF, 2px 0 0 #FFFFFF, -2px 0 0 #FFFFFF, 0 8px 22px rgba(200,120,40,0.35)',
          marginLeft: 12,
        }}
      >
        {when}
      </div>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 38px 18px 24px',
          borderRadius: 999,
          background: `linear-gradient(180deg, #ffffff 0%, ${bg} 55%)`,
          border: '6px solid #fff',
          boxShadow: `0 9px 0 ${bg}, 0 14px 30px rgba(20,20,60,0.35)`,
          fontFamily: roundFont,
          fontWeight: 600,
          fontSize: 74,
          color: C.plum,
          whiteSpace: 'nowrap',
        }}
      >
        {icon}
        {what}
      </div>
    </div>
  );
};

/* ---------------- scene ---------------- */
export const DayNight: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const absFrame = f + sec(start); // composition frame (drives cartoon animation)
  const t = start + srcTime(f); // source time (drives story timing)
  const srcFrame = Math.round(t * FPS); // source video frame for the cut-out

  // fade the cartoon world in/out around the scene (subject stays perfectly still underneath)
  const world = interpolate(f, [0, 12, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const night = interpolate(t, [NIGHT_AT, NIGHT_AT + 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const sunDrop = interpolate(t, [NIGHT_AT - 0.1, NIGHT_AT + 0.6], [0, 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const moonRise = interpolate(t, [NIGHT_AT, NIGHT_AT + 0.9], [520, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2))});
  // cards swap one after the other (never overlapping): morning card leaves, then night card pops in
  const cardOut = interpolate(t, [NIGHT_AT - 0.05, NIGHT_AT + 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const nightFrame = absFrame - sec(NIGHT_AT + 0.3);

  // subject colour-matching to the scene lighting
  const subjectFilter = [
    `brightness(${(1 - 0.2 * night).toFixed(3)})`,
    `saturate(${(1 - 0.12 * night).toFixed(3)})`,
    `contrast(${(1 + 0.03 * night).toFixed(3)})`,
    // soft light-wrap / rim light: warm sun by day, cool moonlight by night
    `drop-shadow(0 0 14px rgba(255,236,170,${(0.55 * (1 - night)).toFixed(3)}))`,
    `drop-shadow(0 0 18px rgba(140,170,255,${(0.6 * night).toFixed(3)}))`,
  ].join(' ');
  const frameNo = String(Math.min(820, srcFrame)).padStart(4, '0');

  return (
    <AbsoluteFill style={{opacity: world}}>
      {/* background world, with gentle parallax drift */}
      <AbsoluteFill style={{transform: `scale(${1.03 + 0.02 * Math.sin(f / 90)})`}}>
        <MorningBg f={absFrame} sunDrop={sunDrop} />
        <AbsoluteFill style={{opacity: night}}>
          <NightBg f={absFrame} moonRise={moonRise} t={t} />
        </AbsoluteFill>
      </AbsoluteFill>
      {/* speaker cut-out, transformed exactly like the main camera */}
      <AbsoluteFill style={{transform: cameraTransform(t), transformOrigin: ORIGIN}}>
        <Img src={staticFile(`subject/s_${frameNo}.png`)} style={{width: W, height: H, filter: subjectFilter}} />
      </AbsoluteFill>
      {/* scene lighting over everything so subject + background share one light */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 78% 15%, rgba(255,240,180,0.35) 0%, rgba(255,240,180,0) 55%)',
          mixBlendMode: 'soft-light',
          opacity: 1 - night,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(40,60,160,0.35) 0%, rgba(30,40,120,0.25) 100%)',
          mixBlendMode: 'soft-light',
          opacity: night,
        }}
      />
      {/* info cards */}
      {cardOut < 1 && (
        <div style={{opacity: 1 - cardOut}}>
          <TimeCard when="morning" what="vitamin C" icon={<Sun size={70} />} bg={C.peach} local={f - 6} night={false} />
        </div>
      )}
      {nightFrame >= 0 && (
        <div>
          <TimeCard when="night" what="retinol" icon={<Moon size={70} />} bg={C.lavender} local={nightFrame} night />
        </div>
      )}
      <Sparkle size={40} style={{position: 'absolute', left: 560, top: 210}} delay={4} />
    </AbsoluteFill>
  );
};
