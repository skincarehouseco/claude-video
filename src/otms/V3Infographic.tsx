import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';
import {AudioMix, BRoll, clamp, ease, f, PHRASES, pop, ramp, Sfx, SpeakerCut, tokens} from './common';
import {Check, Clock, Cross, MarkerCircle, Moon, Sun, SunsetIcon} from './stickers';
import track from './track.json';

/*
 VIDEO 03 — Original dynamic infographic explainer with contextual background replacement.
 The speaker is cut out for the whole video and the environment behind her changes with every idea:
 sunrise question -> "BOLEH" burst -> schedule board -> 24h sky cycle -> night-shift timeline ->
 office day-to-night timeline -> sun / skin diagram -> 24h "anytime" ring conclusion.
*/

const NAVY = '#14213D';
const TUR = '#FFB81C';
const TUR_D = '#E89A00';
const CREAM = '#FFF8EA';
const GREEN = '#22A45D';
const RED = '#E5484D';
const H = 'JakartaX';
const B = 'JakartaS';

/* ---------------- scenes & speaker placement ---------------- */
const CUTS = [0, 2.28, 3.06, 4.48, 8.64, 12.74, 17.6, 22.14];
const sceneAt = (t: number) => {
  let i = 0;
  CUTS.forEach((c, k) => {
    if (t >= c) i = k;
  });
  return i;
};
// [dx, dy, scale] per scene
const PLACE: [number, number, number][] = [
  [0, 0, 0.95],
  [-230, 0, 0.86],
  [-250, 0, 0.86],
  [0, 0, 0.86],
  [-250, 0, 0.86],
  [220, 0, 0.86],
  [-250, 0, 0.86],
  [0, 0, 0.9],
];
const placement = (frame: number) => {
  const t = frame / 30;
  const i = sceneAt(t);
  const st = f(CUTS[i]);
  const p = ease(ramp(frame, st - 4, st + 8));
  const a = PLACE[Math.max(0, i - 1)];
  const b = PLACE[i];
  const m = i === 0 ? b : ([0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * p) as [number, number, number]);
  // hook: quick push-in on the first second
  if (i === 0) m[2] = interpolate(frame, [0, 10, 60], [1.04, 0.97, 0.95], clamp);
  return m;
};
/** source px -> screen px under the current speaker placement */
const toScreen = (frame: number, x: number, y: number) => {
  const [dx, dy, s] = placement(frame);
  return [540 + (x - 540) * s + dx, 1920 - (1920 - y) * s + dy];
};
const faceAt = (frame: number) => {
  const [cx, top] = (track as number[][])[Math.min(frame, track.length - 1)];
  return {cx, top};
};

/* ---------------- shared bits ---------------- */
const Grid: React.FC<{color?: string; op?: number}> = ({color = NAVY, op = 0.06}) => (
  <AbsoluteFill style={{backgroundImage: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px)`, backgroundSize: '90px 90px', opacity: op}} />
);

const Title: React.FC<{lines: {t: string; hl?: boolean; color?: string; at?: number}[]; top?: number; size?: number; align?: 'center' | 'left' | 'right'; left?: number; width?: number}> = ({lines, top = 190, size = 96, align = 'center', left = 80, width = 830}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left, width, top, textAlign: align}}>
      {lines.map((l, i) => {
        const st = f(l.at ?? 0);
        const p = pop(frame, st, 9);
        if (frame < st) return null;
        return (
          <div key={i} style={{marginTop: i ? 4 : 0, transform: `translateY(${(1 - p) * 30}px) scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2), transformOrigin: align === 'left' ? '0% 50%' : align === 'right' ? '100% 50%' : '50% 50%'}}>
            <span
              style={{
                font: `800 ${size}px ${H}`,
                letterSpacing: '-0.03em',
                lineHeight: 1.02,
                color: l.hl ? NAVY : l.color ?? NAVY,
                background: l.hl ? TUR : undefined,
                padding: l.hl ? '0 18px' : undefined,
                borderRadius: l.hl ? 14 : undefined,
                boxDecorationBreak: 'clone',
                display: 'inline-block',
                transform: l.hl ? 'rotate(-1.5deg)' : undefined,
                boxShadow: l.hl ? `6px 6px 0 ${NAVY}` : undefined,
              }}
            >
              {l.t}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const Chip: React.FC<{t: string; at: number; x: number; y: number; bg?: string; color?: string; size?: number}> = ({t, at, x, y, bg = NAVY, color = '#fff', size = 38}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, f(at), 8);
  if (frame < f(at)) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, padding: '10px 22px', borderRadius: 999, background: bg, color, font: `800 ${size}px ${H}`, letterSpacing: '-0.01em', transform: `scale(${p})`, transformOrigin: '0% 50%', boxShadow: '0 8px 18px rgba(20,33,61,0.25)', whiteSpace: 'nowrap'}}>
      {t}
    </div>
  );
};

/* ---------------- backgrounds ---------------- */
const BgHook: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 68], [760, 600], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#FFC98F 0%,#FFE2BA 45%,#FFF4E2 100%)'}}>
      <div style={{position: 'absolute', left: 540 - 300, top: rise - 300, width: 600, height: 600, borderRadius: 300, background: 'radial-gradient(circle,#FFF6C8 0%,#FFD36B 45%,rgba(255,190,90,0) 70%)'}} />
      {Array.from({length: 5}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 1060 + i * 46, height: 10 + i * 2, background: '#FFB86B', opacity: 0.25 - i * 0.03}} />
      ))}
      <Grid op={0.05} />
    </AbsoluteFill>
  );
};

const BgBurst: React.FC<{color1?: string; color2?: string}> = ({color1 = '#FFC531', color2 = '#FFB000'}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: color1, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 - 1600, top: 900 - 1600, width: 3200, height: 3200, transform: `rotate(${frame * 0.4}deg)`, background: `repeating-conic-gradient(${color2} 0deg 9deg, ${color1} 9deg 18deg)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,250,230,0.85) 0%, rgba(255,250,230,0) 55%)'}} />
    </AbsoluteFill>
  );
};

const BgPaper: React.FC = () => (
  <AbsoluteFill style={{background: CREAM}}>
    <Grid op={0.07} />
    <div style={{position: 'absolute', left: 60, top: 0, bottom: 0, width: 4, background: '#F2A5A5', opacity: 0.6}} />
  </AbsoluteFill>
);

// 24h sky cycle: colours follow the words pagi / tengah hari / malam
const skyKeys = [4.48, 5.14, 5.74, 6.82, 8.64];
const skyTop = ['#FFD3A3', '#FFB38A', '#4DA8FF', '#141C44', '#141C44'];
const skyBot = ['#FFF1DE', '#FFE2C4', '#D2ECFF', '#3A4A8C', '#3A4A8C'];
const BgSky: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const k = skyKeys.map((x) => f(x));
  const k2 = [k[0], k[1], k[1] + 8, k[2], k[2] + 8, k[3], k[3] + 8, k[4]];
  const top = interpolateColors(frame, k2, ['#FFD3A3', '#FFD3A3', skyTop[1], skyTop[1], skyTop[2], skyTop[2], skyTop[3], skyTop[3]]);
  const bot = interpolateColors(frame, k2, ['#FFF1DE', '#FFF1DE', skyBot[1], skyBot[1], skyBot[2], skyBot[2], skyBot[3], skyBot[3]]);
  const night = ramp(frame, k[3], k[3] + 8);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${top} 0%, ${bot} 100%)`}}>
      {Array.from({length: 40}).map((_, i) => {
        const x = (i * 197) % 1080;
        const y = (i * 131) % 900 + 120;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 5, height: 5, borderRadius: 3, background: '#fff', opacity: night * (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.1 + i)))}} />;
      })}
      <Grid color="#fff" op={0.08 + 0.02 * Math.sin(t)} />
    </AbsoluteFill>
  );
};

const BgNightShift: React.FC = () => {
  const frame = useCurrentFrame();
  const m = ramp(frame, f(10.3), f(10.9));
  const top = interpolateColors(m, [0, 1], ['#121A3F', '#8FCBFF']);
  const bot = interpolateColors(m, [0, 1], ['#2E3E7E', '#FFE7C4']);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${top}, ${bot})`}}>
      {/* skyline */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {[[0, 1100, 160], [150, 980, 140], [280, 1150, 120], [390, 900, 170], [560, 1040, 150], [700, 940, 130], [820, 1080, 260]].map(([x, y, w], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={1920 - y} fill={interpolateColors(m, [0, 1], ['#0B1030', '#7C93B8'])} />
            {Array.from({length: 18}).map((_, j) => (
              <rect key={j} x={x + 18 + (j % 3) * (w / 3.4)} y={y + 30 + Math.floor(j / 3) * 70} width={18} height={26} fill="#FFD866" opacity={(1 - m) * ((i + j) % 3 === 0 ? 0.25 : 0.85)} />
            ))}
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', left: 760, top: interpolate(m, [0, 1], [1050, 420]), opacity: m}}>
        <Sun size={170} />
      </div>
      <div style={{position: 'absolute', left: 760, top: 300, opacity: 1 - m}}>
        <Moon size={140} />
      </div>
      <Grid color="#fff" op={0.05} />
    </AbsoluteFill>
  );
};

const BgOffice: React.FC = () => {
  const frame = useCurrentFrame();
  const keys = [f(12.74), f(13.46), f(14.38), f(14.38) + 10, f(15.26), f(15.26) + 10, f(17.6)];
  const sky = interpolateColors(frame, keys, ['#9DD6FF', '#9DD6FF', '#9DD6FF', '#FF9E6B', '#FF9E6B', '#1D2756', '#1D2756']);
  const sky2 = interpolateColors(frame, keys, ['#E8F6FF', '#E8F6FF', '#E8F6FF', '#FFD7A6', '#FFD7A6', '#46549A', '#46549A']);
  const wall = interpolateColors(frame, keys, ['#FFF6E6', '#FFF6E6', '#FFF6E6', '#FFE6CF', '#FFE6CF', '#C9C7D8', '#C9C7D8']);
  return (
    <AbsoluteFill style={{background: wall}}>
      {/* big window */}
      <div style={{position: 'absolute', left: 70, top: 620, width: 940, height: 860, borderRadius: 24, background: `linear-gradient(180deg, ${sky}, ${sky2})`, border: '16px solid #fff', boxShadow: 'inset 0 0 0 4px rgba(20,33,61,0.08)'}}>
        <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 14, background: '#fff', transform: 'translateX(-50%)'}} />
        <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 14, background: '#fff'}} />
      </div>
      <Grid op={0.04} />
    </AbsoluteFill>
  );
};

const BgSun: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#7CC4FF 0%,#CFEBFF 55%,#FFF6E0 100%)'}}>
    <Grid color="#fff" op={0.1} />
  </AbsoluteFill>
);

/* ---------------- scene overlays ---------------- */
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const bounce = Math.abs(Math.sin(frame * 0.25)) * 14;
  return (
    <>
      <Title top={180} size={104} lines={[{t: 'PAKAI OTMS', at: 0}, {t: 'WAKTU PAGI?', hl: true, at: 0.1}]} />
      <div style={{position: 'absolute', left: 820, top: 330 - bounce, transform: `scale(${pop(frame, f(1.32))}) rotate(12deg)`}}>
        <Clock size={110} hour={7} />
      </div>
      {/* macro lens: the actual mask texture (supplied bowl shot) */}
      {frame >= f(0.86) && (
        <div style={{position: 'absolute', left: 84, top: 1000, width: 300, height: 300, borderRadius: 150, overflow: 'hidden', border: `8px solid ${NAVY}`, boxShadow: `8px 8px 0 ${TUR}`, transform: `scale(${pop(frame, f(0.9), 10)})`}}>
          <div style={{position: 'absolute', left: 150 - 540, top: 150 - 960, transform: 'scale(0.5)', transformOrigin: '540px 960px'}}>
            <BRoll clip="bowl" from={0.86} start={0.3} />
          </div>
        </div>
      )}
      {frame >= f(1.0) && <Chip t="tekstur OTMS" at={1.0} x={110} y={1290} bg={TUR} color={NAVY} size={30} />}
      {/* "yang ni" = the product */}
      <div style={{position: 'absolute', left: 650, top: 1030, transform: `translateX(${(1 - pop(frame, f(0.86), 10)) * 500}px) rotate(-6deg)`}}>
        <Img src={staticFile('otms/otms_jar.png')} style={{width: 260, filter: 'drop-shadow(0 14px 18px rgba(20,33,61,0.3))'}} />
        <div style={{position: 'absolute', left: 30, top: -64, padding: '6px 16px', borderRadius: 12, background: NAVY, color: '#fff', font: `800 32px ${H}`, opacity: ramp(frame, f(1.0), f(1.1)), whiteSpace: 'nowrap'}}>yang ni ↓</div>
      </div>
    </>
  );
};

const SceneBoleh: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(2.28);
  return (
    <>
      <div style={{position: 'absolute', left: 430, top: 440, width: 480, textAlign: 'center', transform: `scale(${pop(frame, st, 8)}) rotate(-4deg)`}}>
        <div style={{font: `800 168px ${H}`, letterSpacing: '-0.05em', color: '#fff', WebkitTextStroke: `6px ${NAVY}`, paintOrder: 'stroke fill', textShadow: `10px 10px 0 ${NAVY}`}}>BOLEH</div>
      </div>
      <div style={{position: 'absolute', left: 620, top: 250, transform: `scale(${pop(frame, st + 4, 9)})`}}>
        <div style={{width: 170, height: 170, borderRadius: 85, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `6px 6px 0 ${NAVY}`}}>
          <Check size={120} color="#fff" progress={ramp(frame, st + 6, st + 14)} stroke={16} />
        </div>
      </div>
      <Chip t="tak ada masalah" at={2.6} x={500} y={700} />
    </>
  );
};

const SceneJadual: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    {l: 'PAGI', icon: <SunsetIcon size={64} />},
    {l: 'TENGAH HARI', icon: <Sun size={60} />},
    {l: 'MALAM', icon: <Moon size={56} />},
  ];
  return (
    <>
      <Title top={180} size={100} lines={[{t: 'TAK ADA', at: 3.06}, {t: 'JADUAL', hl: true, at: 3.9}]} />
      {/* marker strike-through on the idea of a fixed schedule */}
      <div style={{position: 'absolute', left: 330, top: 345, width: 330 * ramp(frame, f(4.0), f(4.25)), height: 12, background: RED, borderRadius: 6, transform: 'rotate(-4deg)'}} />
      <div style={{position: 'absolute', left: 540, top: 600, width: 370, padding: 24, borderRadius: 28, background: '#fff', boxShadow: `8px 8px 0 ${NAVY}`, border: `4px solid ${NAVY}`, transform: `translateX(${(1 - pop(frame, f(3.1), 10)) * 500}px)`}}>
        <div style={{font: `800 30px ${H}`, color: '#8A93A6', marginBottom: 10}}>BILA BOLEH PAKAI?</div>
        {rows.map((r, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i ? '2px dashed #E3E6EE' : undefined}}>
            {r.icon}
            <div style={{font: `800 34px ${H}`, color: NAVY, flex: 1}}>{r.l}</div>
            <Check size={54} color={GREEN} progress={ramp(frame, f(4.05) + i * 4, f(4.05) + i * 4 + 6)} />
          </div>
        ))}
      </div>
      <Chip t="pakai bila-bila masa" at={4.2} x={540} y={1060} bg={TUR} color={NAVY} size={34} />
    </>
  );
};

const SceneCycle: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 510;
  const cy = 880;
  const r = 360;
  // angle along the arc (180 = left horizon, 90 = top, 0 = right horizon)
  const ang = interpolate(frame, [f(4.48), f(5.14), f(5.74), f(6.4), f(6.82)], [190, 165, 90, 30, -10], clamp);
  const rad = (ang * Math.PI) / 180;
  const sx = cx + r * Math.cos(rad);
  const sy = cy - r * Math.sin(rad);
  const night = ramp(frame, f(6.82), f(6.82) + 8);
  const moonAng = interpolate(frame, [f(6.82), f(8.6)], [175, 120], clamp);
  const mr = (moonAng * Math.PI) / 180;
  const labels = [
    {t: 'PAGI', at: 5.14, x: cx - r - 40, y: cy + 30},
    {t: 'TENGAH HARI', at: 5.74, x: cx - 150, y: cy - r - 130},
    {t: 'MALAM', at: 6.82, x: cx + r - 150, y: cy + 30},
  ];
  const ok = f(7.74);
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" opacity={0.85} />
      </svg>
      <div style={{position: 'absolute', left: sx - 70, top: sy - 70, opacity: 1 - night}}>
        <Sun size={140} />
      </div>
      <div style={{position: 'absolute', left: cx + r * Math.cos(mr) - 60, top: cy - r * Math.sin(mr) - 60, opacity: night}}>
        <Moon size={120} />
      </div>
      {labels.map((l, i) => {
        const p = pop(frame, f(l.at), 8);
        if (frame < f(l.at)) return null;
        return (
          <div key={i} style={{position: 'absolute', left: Math.max(84, l.x), top: l.y, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: '#fff', color: NAVY, font: `800 36px ${H}`, transform: `scale(${p})`, boxShadow: `5px 5px 0 ${NAVY}`, whiteSpace: 'nowrap'}}>
            {l.t}
            {frame >= ok + i * 3 && (
              <div style={{width: 40, height: 40, borderRadius: 20, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(frame, ok + i * 3, 7)})`}}>
                <Check size={30} color="#fff" stroke={16} />
              </div>
            )}
          </div>
        );
      })}
      <Title top={180} size={84} lines={frame < ok ? [{t: 'BILA BOLEH PAKAI?', color: frame > f(6.7) ? '#fff' : NAVY, at: 4.48}] : [{t: 'SEMUA BOLEH ✓', hl: true, at: 7.74}]} />
    </>
  );
};

const Banner: React.FC<{at: number; until: number}> = ({at, until}) => {
  const frame = useCurrentFrame();
  if (frame < f(at) || frame >= f(until)) return null;
  const p = ease(ramp(frame, f(at), f(at) + 6));
  const o = ramp(frame, f(until) - 4, f(until), 1, 0);
  return (
    <div style={{position: 'absolute', left: -40, right: -40, top: 520, height: 150, background: NAVY, transform: `rotate(-4deg) translateX(${(1 - p) * -1200}px)`, opacity: o, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, boxShadow: '0 14px 30px rgba(0,0,0,0.25)'}}>
      <div style={{width: 84, height: 84, borderRadius: 42, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Check size={60} color="#fff" stroke={16} progress={ramp(frame, f(at) + 4, f(at) + 10)} />
      </div>
      <div style={{font: `800 86px ${H}`, color: '#fff', letterSpacing: '-0.03em'}}>TAK ADA MASALAH</div>
    </div>
  );
};

const Timeline: React.FC<{nodes: {t: string; sub?: string; at: number; icon: React.ReactNode; good?: boolean}[]; x: number; y: number; gap?: number}> = ({nodes, x, y, gap = 230}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      {nodes.map((n, i) => {
        const p = pop(frame, f(n.at), 9);
        const lineP = i < nodes.length - 1 ? ramp(frame, f(n.at) + 4, f(nodes[i + 1].at)) : 0;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: i * gap}}>
            {i < nodes.length - 1 && <div style={{position: 'absolute', left: 52, top: 104, width: 8, height: (gap - 104) * lineP, background: '#fff', borderRadius: 4, boxShadow: `0 0 0 3px ${NAVY}`}} />}
            <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: frame >= f(n.at) ? 1 : 0.0, transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: '56px 52px'}}>
              <div style={{width: 112, height: 112, borderRadius: 56, background: n.good ? TUR : '#fff', border: `5px solid ${NAVY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `5px 5px 0 ${NAVY}`, overflow: 'hidden'}}>{n.icon}</div>
              <div style={{padding: '10px 18px', borderRadius: 16, background: '#fff', border: `4px solid ${NAVY}`, boxShadow: `5px 5px 0 ${NAVY}`}}>
                <div style={{font: `800 38px ${H}`, color: NAVY, whiteSpace: 'nowrap'}}>{n.t}</div>
                {n.sub && <div style={{font: `600 26px ${B}`, color: '#5A6478', whiteSpace: 'nowrap'}}>{n.sub}</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** motion-tracked pointer label to the mask on her face */
const MaskLabel: React.FC<{at: number; until: number; text: string; side?: 'left' | 'right'}> = ({at, until, text, side = 'right'}) => {
  const frame = useCurrentFrame();
  if (frame < f(at) || frame >= f(until)) return null;
  const {cx, top} = faceAt(frame);
  const [sx, sy] = toScreen(frame, cx + (side === 'right' ? 150 : -150), top + 420);
  const p = pop(frame, f(at), 8);
  const dir = side === 'right' ? 1 : -1;
  return (
    <div style={{position: 'absolute', left: sx, top: sy, transform: `scale(${p})`, transformOrigin: '0 0'}}>
      <svg width={160} height={80} style={{position: 'absolute', left: dir > 0 ? 0 : -160, top: -40, overflow: 'visible'}}>
        <path d={dir > 0 ? 'M0 40 L130 10' : 'M160 40 L30 10'} stroke={NAVY} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(frame, f(at), f(at) + 6)} />
        <circle cx={dir > 0 ? 0 : 160} cy={40} r={10} fill={TUR} stroke={NAVY} strokeWidth={4} />
      </svg>
      <div style={{position: 'absolute', left: dir > 0 ? 120 : -120, top: -64, transform: dir > 0 ? undefined : 'translateX(-100%)', padding: '8px 16px', borderRadius: 14, background: NAVY, color: '#fff', font: `800 32px ${H}`, whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};

const SceneNightShift: React.FC = () => (
  <>
    <Chip t="CONTOH 1" at={8.66} x={540} y={190} bg={TUR} color={NAVY} size={36} />
    <Title top={262} size={84} align="left" left={540} width={420} lines={[{t: 'SHIFT', color: '#fff', at: 9.76}, {t: 'MALAM', color: '#fff', at: 10.0}]} />
    <Timeline
      x={545}
      y={520}
      gap={215}
      nodes={[
        {t: 'kerja malam', at: 9.76, icon: <Moon size={70} />},
        {t: 'pagi: bangun', at: 11.12, icon: <Sun size={74} />},
        {t: 'pakai OTMS', sub: 'boleh ✓', at: 11.96, icon: <Img src={staticFile('otms/otms_jar.png')} style={{width: 96}} />, good: true},
      ]}
    />
    <MaskLabel at={12.1} until={12.74} text="OTMS" side="left" />
  </>
);

const SceneOffice: React.FC = () => {
  const frame = useCurrentFrame();
  const hour = interpolate(frame, [f(13.46), f(13.9), f(14.38), f(14.9), f(15.26), f(15.8)], [8, 8, 8, 18, 18, 21], clamp);
  return (
    <>
      <Chip t="CONTOH 2" at={12.76} x={84} y={190} bg={TUR} color={NAVY} size={36} />
      <Title top={262} size={80} align="left" left={84} width={560} lines={[{t: 'KERJA PAGI,', at: 13.46}, {t: 'BALIK PETANG', at: 14.38}]} />
      <div style={{position: 'absolute', left: 96, top: 520, transform: `scale(${pop(frame, f(13.0), 9)})`}}>
        <Clock size={170} hour={hour} />
      </div>
      <Timeline
        x={90}
        y={740}
        gap={190}
        nodes={[
          {t: 'kerja pagi', at: 13.46, icon: <Sun size={70} />},
          {t: 'balik petang', at: 14.38, icon: <SunsetIcon size={80} />},
          {t: 'malam: OTMS', sub: 'boleh ✓', at: 15.26, icon: <Img src={staticFile('otms/otms_jar.png')} style={{width: 96}} />, good: true},
        ]}
      />
    </>
  );
};

const SkinDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(17.7);
  const p = pop(frame, st, 10);
  return (
    <div style={{position: 'absolute', left: 520, top: 760, width: 390, transform: `scale(${p})`, transformOrigin: '50% 0%'}}>
      <svg width={390} height={330} viewBox="0 0 390 330">
        <defs>
          <clipPath id="skinclip">
            <rect x={0} y={0} width={390} height={330} rx={24} />
          </clipPath>
        </defs>
        <g clipPath="url(#skinclip)">
          <rect x={0} y={0} width={390} height={330} fill="#fff" />
          <path d="M0 70 C40 55 80 85 120 70 S200 55 240 70 S320 85 390 68 L390 330 L0 330Z" fill="#F7D2B5" />
          <path d="M0 110 C40 98 80 122 120 110 S200 96 240 110 S320 122 390 108 L390 330 L0 330Z" fill="#F2B2A0" />
          <path d="M0 230 C60 220 120 240 190 228 S320 222 390 232 L390 330 L0 330Z" fill="#FBE7A6" />
          {[60, 150, 250, 330].map((x, i) => (
            <path key={i} d={`M${x} 120 C${x + 10} 160 ${x - 10} 190 ${x} 225`} stroke="#D97C7C" strokeWidth={4} fill="none" opacity={0.6} />
          ))}
        </g>
        <rect x={2} y={2} width={386} height={326} rx={24} fill="none" stroke={NAVY} strokeWidth={5} />
      </svg>
      <div style={{position: 'absolute', left: 14, top: 268, font: `800 26px ${H}`, color: NAVY}}>KULIT</div>
      {/* sensitivity badge that gets crossed out on "tak ada" */}
      <div style={{position: 'absolute', left: 120, top: -70, padding: '8px 16px', borderRadius: 14, background: '#fff', border: `4px solid ${RED}`, color: RED, font: `800 30px ${H}`, opacity: ramp(frame, f(20.08), f(20.2)), transform: `scale(${pop(frame, f(20.08), 8)})`}}>
        ⚠ SENSITIF?
        <div style={{position: 'absolute', left: 40, top: -26}}>
          <Cross size={110} progress={ramp(frame, f(21.74), f(21.74) + 8)} stroke={14} />
        </div>
      </div>
    </div>
  );
};

const SceneSun: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{position: 'absolute', left: 560, top: 380, transform: `rotate(${frame * 0.5}deg) scale(${pop(frame, f(17.64), 10)})`}}>
        <Sun size={210} />
      </div>
      {/* animated rays from the sun to the skin */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: ramp(frame, f(18.0), f(18.3))}}>
        {[600, 690, 780, 870].map((x, i) => (
          <line key={i} x1={665} y1={490} x2={x} y2={830} stroke="#FFB000" strokeWidth={8} strokeLinecap="round" strokeDasharray="14 22" strokeDashoffset={-frame * 3} />
        ))}
      </svg>
      <SkinDiagram />
      <Title top={180} size={78} lines={[{t: 'BUAT MUKA', at: 17.6}, {t: 'SENSITIF', hl: frame >= f(20.08), at: 18.2}]} />
      {frame >= f(20.84) && <Chip t="kepada matahari ☀" at={20.84} x={540} y={1110} bg={'#fff'} color={NAVY} size={34} />}
      {frame >= f(21.74) && (
        <div style={{position: 'absolute', left: 520, top: 640, transform: `scale(${pop(frame, f(21.74), 8)}) rotate(-6deg)`, padding: '10px 24px', background: RED, color: '#fff', font: `800 64px ${H}`, borderRadius: 16, boxShadow: `6px 6px 0 ${NAVY}`}}>TAK ADA ✕</div>
      )}
    </>
  );
};

const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(22.14);
  const fill = ramp(frame, st + 6, st + 40);
  return (
    <>
      {/* 24 ticks ring = every hour of the day */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 24}).map((_, i) => {
          const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const on = i / 24 <= fill;
          const r1 = 380;
          const r2 = 430;
          const cx = 540;
          const cy = 930;
          return <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke={on ? NAVY : 'rgba(20,33,61,0.18)'} strokeWidth={14} strokeLinecap="round" />;
        })}
      </svg>
      <Title top={180} size={96} lines={[{t: 'BOLEH PAKAI', at: 22.14}, {t: 'BILA-BILA ✓', hl: true, at: 23.1}]} />
      <div style={{position: 'absolute', left: 724, top: 1150, transform: `translateY(${(1 - pop(frame, st + 8, 10)) * 300}px) rotate(-5deg)`}}>
        <Img src={staticFile('otms/otms_jar.png')} style={{width: 196, filter: 'drop-shadow(0 14px 18px rgba(20,33,61,0.35))'}} />
      </div>
    </>
  );
};

/* ---------------- supplied close-up as an annotated full-screen cut-away ---------------- */
const FaceCutaway: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <BRoll clip="face" from={17.6} start={2.6} />
      <AbsoluteFill style={{boxShadow: `inset 0 0 0 18px ${TUR}`}} />
      <Title top={180} size={84} lines={[{t: 'MUKA YOU', hl: true, at: 17.7}]} />
      <Chip t="pakai OTMS" at={18.4} x={560} y={430} bg={NAVY} color="#fff" size={34} />
      <Chip t="kena matahari? ☀" at={19.06} x={120} y={1120} bg="#fff" color={NAVY} size={34} />
    </AbsoluteFill>
  );
};

/* ---------------- transitions between environments ---------------- */
const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const c = [...CUTS.slice(1), 20.08].map(f).find((x) => frame >= x - 6 && frame < x + 6);
  if (c === undefined) return null;
  const p = (frame - (c - 6)) / 12; // 0..1
  const x = interpolate(p, [0, 1], [-1400, 1400]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x - 200, top: -300, width: 900, height: 2600, background: TUR, transform: 'rotate(12deg)', boxShadow: `0 0 0 40px ${NAVY}`}} />
    </AbsoluteFill>
  );
};

/* ---------------- captions: 3-4 word groups, active word in turmeric ---------------- */
const GROUPS = PHRASES.flatMap((p) => {
  const tk = tokens(p);
  const n = Math.ceil(tk.length / 4);
  const size = Math.ceil(tk.length / n);
  return Array.from({length: n}).map((_, i) => tk.slice(i * size, i * size + size));
}).filter((g) => g.length);

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const gi = GROUPS.findIndex((g, i) => t >= g[0].s - 0.03 && t < (GROUPS[i + 1]?.[0].s ?? 24.3) - 0.03);
  if (gi < 0) return null;
  const g = GROUPS[gi];
  const p = pop(frame, f(g[0].s - 0.03), 6);
  return (
    <div style={{position: 'absolute', left: 80, width: 830, top: 1432, textAlign: 'center', transform: `scale(${0.9 + 0.1 * p})`}}>
      {g.map((w, i) => {
        const on = t >= w.s - 0.03;
        const active = t >= w.s - 0.03 && t < w.e + 0.05;
        return (
          <span key={i} style={{font: `800 56px ${H}`, letterSpacing: '-0.02em', color: active ? TUR : '#fff', WebkitTextStroke: `10px ${NAVY}`, paintOrder: 'stroke fill', margin: '0 8px', opacity: on ? 1 : 0.55, display: 'inline-block', transform: active ? 'translateY(-4px) scale(1.06)' : undefined}}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

const SFX: Sfx[] = [
  [0.0, 'shutter', 0.3],
  [0.08, 'whoosh', 0.14],
  [0.86, 'swipe', 0.16],
  [1.32, 'pop', 0.16],
  [2.14, 'whoosh', 0.18],
  [2.3, 'stamp', 0.28],
  [2.6, 'pop', 0.14],
  [2.92, 'whoosh', 0.16],
  [3.9, 'pop', 0.14],
  [4.0, 'marker', 0.2],
  [4.05, 'click', 0.12],
  [4.2, 'click', 0.12],
  [4.35, 'whoosh', 0.16],
  [5.14, 'pop', 0.14],
  [5.74, 'pop', 0.14],
  [6.82, 'pop', 0.14],
  [7.74, 'ding', 0.2],
  [8.02, 'swipe', 0.18],
  [8.5, 'whoosh', 0.16],
  [9.76, 'pop', 0.14],
  [10.4, 'rise', 0.12],
  [11.12, 'pop', 0.14],
  [11.96, 'notif', 0.18],
  [12.1, 'marker', 0.14],
  [12.6, 'whoosh', 0.16],
  [13.46, 'click', 0.16],
  [14.38, 'click', 0.16],
  [15.26, 'notif', 0.16],
  [16.9, 'swipe', 0.18],
  [17.46, 'whoosh', 0.16],
  [18.2, 'pop', 0.12],
  [20.08, 'pop', 0.16],
  [20.84, 'pop', 0.14],
  [21.74, 'stamp', 0.26],
  [22.0, 'whoosh', 0.16],
  [22.2, 'rise', 0.12],
  [23.1, 'ding', 0.2],
];

const BACKGROUNDS = [BgHook, () => <BgBurst />, BgPaper, BgSky, BgNightShift, BgOffice, BgSun, () => <BgBurst color1="#FFE08A" color2="#FFD45C" />];
const SCENES = [SceneHook, SceneBoleh, SceneJadual, SceneCycle, SceneNightShift, SceneOffice, SceneSun, SceneEnd];

export const V3Infographic: React.FC = () => {
  const frame = useCurrentFrame();
  const i = sceneAt(frame / 30);
  const Bg = BACKGROUNDS[i];
  const Sc = SCENES[i];
  const [dx, dy, s] = placement(frame);
  return (
    <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
      <Bg />
      <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${s})`, transformOrigin: '540px 1920px'}}>
        <SpeakerCut style={{filter: 'drop-shadow(0 0 0 #fff) drop-shadow(0 12px 28px rgba(20,33,61,0.35))'}} />
      </AbsoluteFill>
      <Sc />
      {frame >= f(17.6) && frame < f(20.08) && <FaceCutaway />}
      <Banner at={8.02} until={8.64} />
      <Banner at={16.9} until={17.6} />
      <Captions />
      <Wipe />
      <AbsoluteFill style={{background: '#fff', opacity: ramp(frame, 0, 4, 0.9, 0)}} />
      <AudioMix music="music3.wav" base={0.14} under={0.06} sfx={SFX} />
    </AbsoluteFill>
  );
};
