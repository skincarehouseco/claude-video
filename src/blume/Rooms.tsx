import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, H, rnd, W} from './theme';

/*
 * Illustrated, softly defocused "rooms" — each background shows the place / object the sentence is about
 * (bathroom for cleansing, towel + clock for waiting, vanity for the toner, store for the promo, gifts for the
 * free serum...). Props sit at the sides and above the head, where the speaker doesn't cover them.
 */

type BottleKind = 'pump' | 'dropper' | 'jar' | 'tube' | 'spray';
const Bottle: React.FC<{x: number; y: number; w: number; h: number; body: string; cap?: string; kind?: BottleKind; label?: boolean}> = ({
  x,
  y,
  w,
  h,
  body,
  cap = '#FFFFFF',
  kind = 'pump',
  label = true,
}) => {
  // (x, y) = bottom-left corner
  const top = y - h;
  return (
    <g>
      {kind === 'jar' ? (
        <>
          <rect x={x} y={top + h * 0.28} width={w} height={h * 0.72} rx={w * 0.18} fill={body} />
          <rect x={x - w * 0.04} y={top} width={w * 1.08} height={h * 0.32} rx={w * 0.12} fill={cap} />
        </>
      ) : kind === 'tube' ? (
        <>
          <path d={`M${x + w * 0.1} ${top} H${x + w * 0.9} L${x + w} ${y - h * 0.18} H${x} Z`} fill={body} />
          <rect x={x + w * 0.2} y={y - h * 0.2} width={w * 0.6} height={h * 0.2} rx={4} fill={cap} />
        </>
      ) : (
        <>
          <rect x={x} y={top + h * 0.25} width={w} height={h * 0.75} rx={w * 0.22} fill={body} />
          {kind === 'pump' && (
            <>
              <rect x={x + w * 0.3} y={top + h * 0.1} width={w * 0.4} height={h * 0.16} rx={4} fill={cap} />
              <rect x={x + w * 0.42} y={top} width={w * 0.16} height={h * 0.12} fill={cap} />
              <rect x={x + w * 0.42} y={top} width={w * 0.5} height={h * 0.05} rx={3} fill={cap} />
            </>
          )}
          {kind === 'dropper' && (
            <>
              <rect x={x + w * 0.28} y={top + h * 0.1} width={w * 0.44} height={h * 0.16} rx={4} fill={cap} />
              <ellipse cx={x + w / 2} cy={top + h * 0.06} rx={w * 0.2} ry={h * 0.07} fill={cap} />
            </>
          )}
          {kind === 'spray' && <rect x={x + w * 0.18} y={top} width={w * 0.64} height={h * 0.27} rx={w * 0.12} fill={cap} opacity={0.85} />}
        </>
      )}
      {label && kind !== 'tube' && <rect x={x + w * 0.2} y={y - h * 0.5} width={w * 0.6} height={h * 0.22} rx={4} fill="#fff" opacity={0.55} />}
      <rect x={x + w * 0.12} y={top + h * 0.32} width={w * 0.1} height={h * 0.5} rx={w * 0.05} fill="#fff" opacity={0.35} />
    </g>
  );
};

const Plant: React.FC<{x: number; y: number; s?: number; t: number; pot?: string}> = ({x, y, s = 1, t, pot = '#F3E4D7'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-50, -25, 0, 25, 50, -38, 38].map((a, i) => (
      <ellipse
        key={i}
        cx={0}
        cy={-110 - (i % 3) * 25}
        rx={26}
        ry={70}
        fill={i % 2 ? '#9CC5A1' : '#86B78D'}
        transform={`rotate(${a + Math.sin(t * 1.2 + i) * 3} 0 -10)`}
      />
    ))}
    <path d="M-60 -20 H60 L48 70 H-48 Z" fill={pot} />
    <rect x={-66} y={-30} width={132} height={22} rx={8} fill={pot} />
  </g>
);

const Bokeh: React.FC<{t: number; n?: number; color?: string; seed?: number; ymax?: number}> = ({t, n = 14, color = 'rgba(255,240,220,0.7)', seed = 1, ymax = 900}) => (
  <>
    {Array.from({length: n}).map((_, i) => (
      <circle
        key={i}
        cx={rnd(i * 3 + seed) * W}
        cy={120 + rnd(i * 5 + seed) * ymax + Math.sin(t * 0.8 + i) * 10}
        r={14 + rnd(i * 7 + seed) * 34}
        fill={color}
        opacity={0.35 + 0.35 * Math.sin(t * 1.5 + i * 1.7) ** 2}
      />
    ))}
  </>
);

const Room: React.FC<{children: React.ReactNode; blur?: number; drift?: number; t: number}> = ({children, blur = 3, drift = 1, t}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{position: 'absolute', inset: 0, filter: `blur(${blur}px)`, transform: `scale(${1.04 + 0.01 * Math.sin(t * 0.3)}) translateX(${Math.sin(t * 0.25) * 8 * drift}px)`}}
    >
      {children}
    </svg>
    {/* soft vignette = depth */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0) 50%, rgba(20,30,45,0.18) 100%)'}} />
  </AbsoluteFill>
);

/* ---------------- 1. beauty corner (hello / intro) ---------------- */
export const RoomStudio: React.FC<{t: number}> = ({t}) => (
  <Room t={t}>
    <defs>
      <linearGradient id="st-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#EEF1F4" />
        <stop offset="1" stopColor="#DDE4EC" />
      </linearGradient>
      <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#DCEBFA" />
        <stop offset="1" stopColor="#FFF4E6" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#st-wall)" />
    {/* window with sheer curtain on the left */}
    <rect x={-40} y={180} width={400} height={760} rx={20} fill="url(#st-sky)" />
    <path d="M160 180 V940 M-40 560 H360" stroke="#fff" strokeWidth={14} />
    <rect x={-40} y={180} width={400} height={760} rx={20} fill="none" stroke="#fff" strokeWidth={22} />
    <path d={`M250 150 C ${300 + Math.sin(t) * 10} 400, 230 700, ${290 + Math.sin(t * 1.3) * 8} 980 L 400 980 L 400 150 Z`} fill="#fff" opacity={0.7} />
    {/* sunbeam */}
    <path d="M360 200 L 1080 900 L 1080 1300 L 360 940 Z" fill="#FFF6E0" opacity={0.35} />
    {/* floating shelf with skincare on the right */}
    <rect x={740} y={600} width={380} height={22} rx={8} fill="#D9CDBE" />
    <Bottle x={770} y={600} w={58} h={150} body="#FF8F70" kind="pump" />
    <Bottle x={845} y={600} w={50} h={120} body="#D9CCF5" kind="dropper" />
    <Bottle x={910} y={600} w={74} h={70} body="#FFE7A8" kind="jar" />
    <Bottle x={1000} y={600} w={50} h={140} body="#C8E0F6" kind="spray" />
    <rect x={740} y={900} width={380} height={22} rx={8} fill="#D9CDBE" />
    <Plant x={1000} y={880} s={0.8} t={t} />
    <Bottle x={780} y={900} w={64} h={110} body="#FFD3C2" kind="tube" />
    {/* fairy lights */}
    <path d="M-20 130 C 250 230, 520 120, 780 210 S 1060 140, 1100 190" stroke="#D5CBBE" strokeWidth={3} fill="none" />
    {Array.from({length: 11}).map((_, i) => {
      const x = i * 105;
      const y = 150 + Math.sin(i * 1.1) * 40;
      return <circle key={i} cx={x} cy={y} r={11} fill="#FFF2C4" opacity={0.6 + 0.4 * Math.sin(t * 3 + i) ** 2} />;
    })}
    <Bokeh t={t} n={10} seed={3} />
  </Room>
);

/* ---------------- 2. bathroom (cuci muka) ---------------- */
export const RoomBathroom: React.FC<{t: number; imgCleanser?: boolean}> = ({t}) => (
  <Room t={t} blur={2.5}>
    <rect width={W} height={H} fill="#EAF3FC" />
    {/* tiles */}
    {Array.from({length: 10}).map((_, i) => (
      <line key={`v${i}`} x1={i * 120} y1={0} x2={i * 120} y2={H} stroke="#fff" strokeWidth={6} />
    ))}
    {Array.from({length: 17}).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 120} x2={W} y2={i * 120} stroke="#fff" strokeWidth={6} />
    ))}
    {/* round mirror behind her head */}
    <circle cx={540} cy={560} r={360} fill="#F4F8FC" stroke="#E6C98F" strokeWidth={16} />
    <path d="M330 380 L 420 300 M 360 460 L 500 330" stroke="#fff" strokeWidth={18} strokeLinecap="round" opacity={0.8} />
    {/* wall sconces */}
    {[110, 970].map((x, i) => (
      <g key={i}>
        <rect x={x - 8} y={420} width={16} height={90} rx={6} fill="#E6C98F" />
        <ellipse cx={x} cy={400} rx={42} ry={54} fill="#FFF6DD" />
        <circle cx={x} cy={400} r={110} fill="#FFF3CF" opacity={0.35} />
      </g>
    ))}
    {/* glass shelf with cleanser (left) */}
    <rect x={-20} y={820} width={300} height={16} rx={6} fill="#CFE2F5" />
    <Bottle x={40} y={820} w={78} h={200} body="#BFD7F2" cap="#fff" kind="pump" />
    <Bottle x={140} y={820} w={60} h={90} body="#FFD3C2" kind="jar" />
    <rect x={215} y={730} width={46} height={90} rx={10} fill="#fff" opacity={0.85} />
    <rect x={226} y={660} width={8} height={90} rx={4} fill="#FF8F70" />
    <rect x={240} y={670} width={8} height={80} rx={4} fill="#9FC3EA" />
    {/* towel ring (right) */}
    <circle cx={960} cy={720} r={56} fill="none" stroke="#E6C98F" strokeWidth={10} />
    <path d="M905 740 C 900 880, 940 960, 960 980 C 990 960, 1020 880, 1015 740 Z" fill="#BFD7F2" />
    <path d="M915 900 H1005" stroke="#fff" strokeWidth={8} opacity={0.7} />
    {/* faucet peeking at the bottom-left */}
    <path d="M60 1180 V1120 C 60 1080, 110 1060, 150 1080 L 200 1100" stroke="#D9DEE6" strokeWidth={24} fill="none" strokeLinecap="round" />
    <rect x={-40} y={1180} width={400} height={80} rx={30} fill="#fff" />
    <Bokeh t={t} n={8} color="rgba(255,255,255,0.8)" seed={5} />
  </Room>
);

/* ---------------- 3. towel + clock (tunggu kering) ---------------- */
export const RoomTowel: React.FC<{t: number}> = ({t}) => {
  // clock hands spin fast = "waiting..."
  const minute = t * 360;
  const hour = t * 30;
  return (
    <Room t={t} blur={2.5}>
      <rect width={W} height={H} fill="#FFF6E2" />
      <rect x={0} y={1100} width={W} height={820} fill="#F7E6C9" />
      {/* window with sunbeams (right) */}
      <rect x={720} y={420} width={420} height={560} rx={16} fill="#FFFBEE" stroke="#fff" strokeWidth={20} />
      {Array.from({length: 7}).map((_, i) => (
        <rect key={i} x={720} y={440 + i * 76} width={420} height={18} fill="#F4E3BF" opacity={0.8} />
      ))}
      <path d="M720 480 L 0 1250 L 0 1600 L 720 980 Z" fill="#FFF0B8" opacity={0.45} />
      {/* wall clock (top right) */}
      <g transform="translate(860 250)">
        <circle r={118} fill="#fff" stroke="#F2CF62" strokeWidth={14} />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={-4} y={-100} width={8} height={18} rx={4} fill="#C9B58A" transform={`rotate(${i * 30})`} />
        ))}
        <rect x={-6} y={-60} width={12} height={66} rx={6} fill={C.ink} transform={`rotate(${hour})`} />
        <rect x={-4} y={-92} width={8} height={96} rx={4} fill={C.cherry} transform={`rotate(${minute})`} />
        <circle r={10} fill={C.ink} />
      </g>
      {/* towel rack with hanging towels (left) */}
      <rect x={-20} y={420} width={330} height={18} rx={9} fill="#D9C08E" />
      <path d="M20 430 H150 V860 C 120 880, 60 880, 20 860 Z" fill="#D6C9F3" />
      <path d="M20 800 H150" stroke="#fff" strokeWidth={10} opacity={0.6} />
      <path d="M160 430 H290 V780 C 260 800, 200 800, 160 780 Z" fill="#FFE7A8" />
      <path d="M160 720 H290" stroke="#fff" strokeWidth={10} opacity={0.6} />
      <Plant x={150} y={1110} s={0.9} t={t} pot="#fff" />
      <Bokeh t={t} n={8} color="rgba(255,248,214,0.9)" seed={8} />
    </Room>
  );
};

/* ---------------- 4. vanity mirror with bulbs (toner mist / 2 cara) ---------------- */
export const RoomVanity: React.FC<{t: number; packshot?: number}> = ({t, packshot = 1}) => (
  <AbsoluteFill>
    <Room t={t} blur={2.5}>
      <rect width={W} height={H} fill="#F1EFEB" />
      <rect x={0} y={1180} width={W} height={740} fill="#D9D1C6" />
      <rect x={0} y={1180} width={W} height={26} fill="#FFFFFF" />
      {/* hollywood mirror */}
      <rect x={150} y={180} width={780} height={980} rx={60} fill="#FFF7F3" stroke="#CFC6BA" strokeWidth={20} />
      {Array.from({length: 7}).map((_, i) => {
        const y = 240 + i * 135;
        const glow = 0.7 + 0.3 * Math.sin(t * 2 + i);
        return (
          <g key={i}>
            <circle cx={150} cy={y} r={30} fill="#FFF6D8" opacity={glow} />
            <circle cx={150} cy={y} r={60} fill="#FFF0C0" opacity={0.25 * glow} />
            <circle cx={930} cy={y} r={30} fill="#FFF6D8" opacity={glow} />
            <circle cx={930} cy={y} r={60} fill="#FFF0C0" opacity={0.25 * glow} />
          </g>
        );
      })}
      {/* flowers on the table (right) */}
      <rect x={930} y={1020} width={70} height={160} rx={30} fill="#fff" opacity={0.85} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${940 + i * 18} ${880 + (i % 2) * 40}) rotate(${Math.sin(t + i) * 4})`}>
          <path d={`M10 0 V140`} stroke="#86B78D" strokeWidth={5} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={10} cy={-16} rx={12} ry={18} fill={i % 2 ? C.rose : '#FFD3C2'} transform={`rotate(${a} 10 0)`} />
          ))}
          <circle cx={10} cy={0} r={8} fill="#FFE7A8" />
        </g>
      ))}
      <Bottle x={20} y={1180} w={60} h={120} body="#FFE7A8" kind="jar" />
      {/* glass shelf for the product (left, above her shoulder line) */}
      <rect x={-20} y={720} width={330} height={16} rx={6} fill="#fff" opacity={0.9} />
      <Bokeh t={t} n={10} color="rgba(255,240,210,0.75)" seed={11} />
    </Room>
    {/* the real product standing on the vanity (left) */}
    {packshot > 0 && (
      <Img
        src={staticFile('blume/pack_toner.png')}
        style={{position: 'absolute', left: 70, top: 724 - 420, height: 420, opacity: packshot, filter: 'drop-shadow(0 16px 18px rgba(180,70,50,0.3))'}}
      />
    )}
  </AbsoluteFill>
);

/* ---------------- 5. morning window with sheer curtains (spray / pat) ---------------- */
export const RoomMorning: React.FC<{t: number}> = ({t}) => (
  <Room t={t} blur={3}>
    <defs>
      <radialGradient id="mo-sun" cx="0.5" cy="0.25" r="0.7">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.5" stopColor="#E7F1FB" />
        <stop offset="1" stopColor="#EDF2F8" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#mo-sun)" />
    {/* big window frame */}
    <rect x={120} y={160} width={840} height={1100} rx={24} fill="none" stroke="#fff" strokeWidth={26} />
    <path d="M540 160 V1260 M120 700 H960" stroke="#fff" strokeWidth={18} opacity={0.9} />
    {/* sheer curtains swaying */}
    {[0, 1].map((side) => (
      <path
        key={side}
        d={
          side === 0
            ? `M-20 100 H${240 + Math.sin(t * 1.1) * 14} C ${200 + Math.sin(t) * 20} 600, ${260 + Math.sin(t * 1.3) * 20} 1100, ${190 + Math.sin(t) * 16} 1500 H -20 Z`
            : `M1100 100 H${840 - Math.sin(t * 1.1) * 14} C ${880 - Math.sin(t) * 20} 600, ${820 - Math.sin(t * 1.3) * 20} 1100, ${890 - Math.sin(t) * 16} 1500 H 1100 Z`
        }
        fill="#fff"
        opacity={0.75}
      />
    ))}
    <rect x={-20} y={90} width={1120} height={22} rx={11} fill="#E6C98F" />
    {/* hanging plant + haze */}
    <Plant x={900} y={560} s={0.6} t={t} pot="#fff" />
    <Bokeh t={t} n={16} color="rgba(255,255,255,0.9)" seed={17} ymax={1200} />
  </Room>
);

/* ---------------- 6. evening vanity (moisturizer) ---------------- */
export const RoomEvening: React.FC<{t: number}> = ({t}) => (
  <Room t={t} blur={2.5}>
    <defs>
      <linearGradient id="ev-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#DCE2F0" />
        <stop offset="1" stopColor="#E8E7F1" />
      </linearGradient>
      <radialGradient id="ev-lamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.9" />
        <stop offset="1" stopColor="#FFE9B8" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#ev-wall)" />
    {/* window with moon (left) */}
    <rect x={30} y={200} width={300} height={440} rx={150} fill="#B9AEE0" stroke="#fff" strokeWidth={16} />
    <circle cx={190} cy={340} r={56} fill="#FFF6DA" />
    <circle cx={215} cy={322} r={50} fill="#B9AEE0" />
    {[[90, 300], [260, 470], [120, 520], [280, 300]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={5} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />
    ))}
    {/* warm lamp (right) */}
    <circle cx={930} cy={560} r={300} fill="url(#ev-lamp)" />
    <path d="M840 470 H1020 L 980 600 H 880 Z" fill="#FFF1D6" />
    <rect x={922} y={600} width={16} height={260} fill="#D9C08E" />
    <rect x={860} y={860} width={140} height={22} rx={10} fill="#D9C08E" />
    {/* shelf with a moisturizer jar (left) */}
    <rect x={-20} y={860} width={340} height={20} rx={8} fill="#D3D8E2" />
    <g>
      <rect x={60} y={760} width={160} height={100} rx={26} fill="#FFFFFF" />
      <rect x={52} y={720} width={176} height={56} rx={20} fill={C.rose} />
      <rect x={95} y={790} width={90} height={30} rx={8} fill={C.blushDeep} />
    </g>
    <Bottle x={240} y={860} w={46} h={120} body="#D6C9F3" kind="dropper" />
    <Bokeh t={t} n={8} color="rgba(255,236,196,0.7)" seed={23} />
  </Room>
);

/* ---------------- 7. skincare store (50 orang terawal) ---------------- */
const SHELF_COLORS = ['#F6B4A3', '#FFE7A8', '#FF8F70', '#D6C9F3', '#BFD7F2', '#FFD3C2'];
export const RoomStore: React.FC<{t: number}> = ({t}) => (
  <Room t={t} blur={3}>
    <rect width={W} height={H} fill="#EDF1F5" />
    {[0, 1].map((side) => (
      <g key={side}>
        <rect x={side ? 760 : -20} y={140} width={340} height={1400} rx={16} fill="#FFFFFF" />
        {Array.from({length: 5}).map((_, r) => {
          const y = 380 + r * 250;
          const x0 = side ? 780 : 0;
          return (
            <g key={r}>
              <rect x={x0 - 10} y={y} width={330} height={18} rx={6} fill="#D9CDBE" />
              {Array.from({length: 5}).map((__, k) => {
                const kinds: BottleKind[] = ['pump', 'spray', 'jar', 'dropper', 'tube'];
                const kind = kinds[(k + r + side) % 5];
                const h = kind === 'jar' ? 70 : kind === 'tube' ? 110 : 150 - ((k * 13) % 40);
                return <Bottle key={k} x={x0 + 8 + k * 62} y={y} w={48} h={h} body={SHELF_COLORS[(k + r * 2 + side) % 6]} kind={kind} />;
              })}
            </g>
          );
        })}
      </g>
    ))}
    {/* ceiling lights */}
    {[270, 540, 810].map((x, i) => (
      <g key={i}>
        <line x1={x} y1={0} x2={x} y2={90} stroke="#E6C98F" strokeWidth={4} />
        <path d={`M${x - 50} 130 Q ${x} 70 ${x + 50} 130 Z`} fill="#fff" />
        <circle cx={x} cy={140} r={60} fill="#FFF3CF" opacity={0.5 + 0.2 * Math.sin(t * 2 + i)} />
      </g>
    ))}
  </Room>
);

/* ---------------- 8. gifts (free serum) ---------------- */
const GiftBox: React.FC<{x: number; y: number; w: number; h: number; c: string; rib: string}> = ({x, y, w, h, c, rib}) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} rx={10} fill={c} />
    <rect x={x - 6} y={y - h} width={w + 12} height={h * 0.22} rx={8} fill={c} />
    <rect x={x + w / 2 - 9} y={y - h} width={18} height={h} fill={rib} />
    <path d={`M${x + w / 2} ${y - h} C ${x + w / 2 - 50} ${y - h - 50}, ${x + w / 2 - 70} ${y - h}, ${x + w / 2} ${y - h} C ${x + w / 2 + 70} ${y - h}, ${x + w / 2 + 50} ${y - h - 50}, ${x + w / 2} ${y - h} Z`} fill={rib} />
  </g>
);
export const RoomGifts: React.FC<{t: number}> = ({t}) => (
  <Room t={t} blur={2.5}>
    <rect width={W} height={H} fill="#FFF5DC" />
    <rect x={0} y={1180} width={W} height={740} fill="#E3E8EE" />
    {/* bunting */}
    <path d="M-20 160 Q 540 300 1100 160" stroke="#E6C98F" strokeWidth={4} fill="none" />
    {Array.from({length: 11}).map((_, i) => {
      const x = i * 105 + 10;
      const y = 160 + Math.sin((x / 1080) * Math.PI) * 110;
      return <path key={i} d={`M${x - 30} ${y} L ${x + 30} ${y} L ${x} ${y + 60} Z`} fill={[C.rose, '#FFE7A8', '#D6C9F3', '#BFD7F2'][i % 4]} />;
    })}
    {/* gift stacks on both sides */}
    <GiftBox x={10} y={1180} w={200} h={170} c={C.rose} rib="#FFE7A8" />
    <GiftBox x={50} y={1010} w={140} h={120} c="#FFE7A8" rib={C.cherry} />
    <GiftBox x={80} y={890} w={90} h={80} c="#D6C9F3" rib="#fff" />
    <GiftBox x={850} y={1180} w={220} h={190} c="#FFE7A8" rib={C.rose} />
    <GiftBox x={880} y={990} w={150} h={120} c="#BFD7F2" rib="#fff" />
    <GiftBox x={905} y={870} w={100} h={80} c={C.rose} rib="#FFE7A8" />
    {/* falling confetti */}
    {Array.from({length: 30}).map((_, i) => {
      const x = rnd(i * 3) * W;
      const y = ((rnd(i * 7) * 1400 + t * (80 + rnd(i) * 60)) % 1400) + 150;
      return <rect key={i} x={x} y={y} width={14} height={8} rx={3} fill={[C.rose, '#F2CF62', '#9583CC', '#7099CF'][i % 4]} transform={`rotate(${t * 120 + i * 40} ${x} ${y})`} />;
    })}
  </Room>
);

/* ---------------- 9. shopping bags (grab yours now) ---------------- */
const ShopBag: React.FC<{x: number; y: number; w: number; h: number; c: string}> = ({x, y, w, h, c}) => (
  <g>
    <path d={`M${x + w * 0.3} ${y - h} V${y - h - 40} C ${x + w * 0.3} ${y - h - 80}, ${x + w * 0.7} ${y - h - 80}, ${x + w * 0.7} ${y - h - 40} V${y - h}`} stroke="#B98F7A" strokeWidth={8} fill="none" />
    <rect x={x} y={y - h} width={w} height={h} rx={12} fill={c} />
    <rect x={x} y={y - h} width={w} height={22} fill="#fff" opacity={0.35} />
  </g>
);
export const RoomShopping: React.FC<{t: number}> = ({t}) => (
  <Room t={t} blur={2.5}>
    <rect width={W} height={H} fill="#EEF1F4" />
    <rect x={0} y={1100} width={W} height={820} fill="#D7DEE6" />
    {/* rail with hanging bags */}
    <rect x={-20} y={520} width={1120} height={16} rx={8} fill="#E6C98F" />
    {[40, 200, 820, 960].map((x, i) => (
      <g key={i} transform={`rotate(${Math.sin(t * 1.5 + i) * 3} ${x + 60} 520)`}>
        <ShopBag x={x} y={820 + (i % 2) * 40} w={130} h={200} c={[C.rose, '#FFE7A8', '#D6C9F3', '#FFD3C2'][i]} />
      </g>
    ))}
    <ShopBag x={20} y={1100} w={200} h={240} c="#FFE7A8" />
    <ShopBag x={860} y={1100} w={200} h={260} c={C.rose} />
    <Bokeh t={t} n={10} color="rgba(255,255,255,0.75)" seed={31} />
  </Room>
);
