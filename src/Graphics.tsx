import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {between, clamp01, easeOut, life, pop, ramp} from './anim';
import {FaceMap} from './FaceMap';
import {layoutAt} from './Subject';
import {C, CX, DISPLAY, FPS, SANS} from './theme';
import track from './tissue_track.json';
import {Bottle, Check, Chip, Drop, Dropper, Emoji, Jar, Products, Pump, Stamp, Statement, StepTag, Tissue, XMark} from './ui';

const TRACK = track as unknown as Record<string, [number, number]>;
/** tissue position (frame coords) from scripts/track_tissue.py, mapped through the presenter camera */
const tissueAt = (frame: number, t: number): [number, number] | null => {
  const p = TRACK[String(frame)];
  if (!p) return null;
  const {y, s} = layoutAt(t);
  const ox = 540;
  const oy = 1920 * 0.36;
  return [ox + (p[0] - ox) * s, oy + (p[1] - oy) * s + y];
};

/* ---------------------------------------------------------------- behind the presenter */
export const Behind: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const giant = (text: string, a: number, b: number, y: number, color: string, size = 250, stroke?: string) => {
    if (!between(t, a - 0.05, b + 0.05)) return null;
    const p = pop(t, a, 200, 14);
    const out = ramp(t, b - 0.2, 0.2);
    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y,
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: size,
          lineHeight: 0.9,
          color,
          WebkitTextStroke: stroke ? `10px ${stroke}` : undefined,
          paintOrder: 'stroke fill',
          transform: `translateY(${(1 - p) * 120}px) scale(${0.9 + 0.1 * p})`,
          opacity: Math.min(p, 1 - out),
          whiteSpace: 'pre',
          letterSpacing: -2,
        }}
      >
        {text}
      </div>
    );
  };
  return (
    <AbsoluteFill>
      {giant('SKIN\nTYPE?', 6.6, 7.75, 175, '#FFFFFF', 250, C.ink)}
      {giant('RAMAI', 13.14, 14.98, 190, 'rgba(14,27,36,0.85)', 260)}
      {giant('PREVENT', 23.68, 26.25, 230, '#0B6B3A', 200)}
      {giant('01', 27.8, 30.2, 160, 'rgba(14,27,36,0.12)', 420)}
      {giant('02', 32.8, 36.45, 160, 'rgba(255,255,255,0.22)', 420)}
      {giant('04', 42.45, 45.0, 160, 'rgba(14,27,36,0.10)', 420)}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- hook: crossed-out products */
const HookItem: React.FC<{t: number; at: number; x: number; y: number; label: string; icon: React.ReactNode}> = ({t, at, x, y, label, icon}) => {
  const p = pop(t, at, 320, 12);
  if (p < 0.001 || t > 4.75) return null;
  const xp = clamp01((t - at - 0.28) / 0.22);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${-6 + 12 * ((x / 100) % 1)}deg)`}}>
      <div style={{background: '#fff', borderRadius: 30, padding: 14, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', width: 190, textAlign: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>{icon}</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.ink, marginTop: -4}}>{label}</div>
      </div>
      <div style={{position: 'absolute', left: 15, top: 20}}>
        <XMark size={160} progress={xp} />
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- title cut-away (covers the source's draft title box, 9.27-12.2s) */
export const TitleCard: React.FC<{t: number}> = ({t}) => {
  const types: [string, string, React.ReactNode][] = [
    ['OILY', '#F2A900', <Drop key="o" size={70} color="#F2A900" />],
    ['DRY', '#C08A6B', <svg key="d" width={70} height={70} viewBox="0 0 100 100"><path d="M10 50 L35 40 L50 60 L70 35 L90 50" stroke="#C08A6B" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 75 L45 68 L60 82 L85 72" stroke="#C08A6B" strokeWidth="8" fill="none" strokeLinecap="round" /></svg>],
    ['COMBINATION', C.teal, <svg key="c" width={70} height={70} viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#E9DED0" /><path d="M50 10 A40 40 0 0 1 50 90z" fill="#F2A900" /></svg>],
    ['NORMAL', C.green, <Check key="n" size={64} />],
  ];
  return (
    <AbsoluteFill style={{background: `linear-gradient(165deg, ${C.ink2}, ${C.ink})`}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)', backgroundSize: '60px 60px', opacity: 0.05}} />
      <div style={{position: 'absolute', left: 80, top: 230, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.yellow, letterSpacing: 4, opacity: pop(t, 9.4)}}>SKINCAREHOUSE GUIDE</div>
      <Statement t={t} at={9.66} x={CX} y={420} text={'CARA KENAL'} size={128} color="#fff" rotate={-3} />
      <Statement t={t} at={10.56} x={CX} y={560} text={'JENIS KULIT'} size={140} color={C.yellow} rotate={-3} />
      {types.map(([name, col, icon], i) => {
        const p = pop(t, 10.75 + i * 0.12, 300, 13);
        const x = 100 + (i % 2) * 420;
        const y = 720 + Math.floor(i / 2) * 190;
        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 390,
              height: 160,
              background: '#fff',
              borderRadius: 28,
              borderBottom: `10px solid ${col}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '0 22px',
              transform: `scale(${p}) rotate(${i % 2 ? 2 : -2}deg)`,
              boxShadow: '0 14px 30px rgba(0,0,0,0.3)',
            }}
          >
            {icon}
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: name.length > 8 ? 34 : 44, color: C.ink}}>{name}</div>
          </div>
        );
      })}
      <Chip t={t} at={11.32} x={CX} y={1160} bg={C.teal} color="#fff" size={42} rotate={2}>
        sebelum beli any product
      </Chip>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- confused-math meme overlay (13-16.9s) */
const Confused: React.FC<{t: number}> = ({t}) => {
  if (!between(t, 15.3, 16.95)) return null;
  const items = ['oily?', 'dry??', 'pH = ?', 'skin type = x', 'combination?', '???', 'normal?', 'serum + toner = ?'];
  const o = Math.min(ramp(t, 15.3, 0.25), 1 - ramp(t, 16.7, 0.25));
  return (
    <AbsoluteFill style={{opacity: o}}>
      {items.map((s, i) => {
        const a = (i / items.length) * Math.PI * 2 + t * 0.6;
        const r = 330 + 40 * Math.sin(i * 1.7 + t);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 + r * Math.cos(a) - 120,
              top: 700 + r * 0.9 * Math.sin(a),
              width: 240,
              textAlign: 'center',
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 40,
              color: '#fff',
              WebkitTextStroke: '6px rgba(14,27,36,0.8)',
              paintOrder: 'stroke fill',
              transform: `rotate(${((i * 23) % 30) - 15}deg) scale(${pop(t, 15.3 + i * 0.07)})`,
            }}
          >
            {s}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 690, top: 420, transform: `scale(${pop(t, 16.0)}) rotate(10deg)`}}>
        <Emoji code="1f635-200d-1f4ab" size={150} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- consequences list (16.9-22.5) */
const Consequence: React.FC<{t: number; at: number; y: number; text: string; icon?: 'x' | 'inf'}> = ({t, at, y, text, icon = 'x'}) => {
  const p = pop(t, at, 260, 14);
  if (p < 0.001 || t > 22.55) return null;
  const out = ramp(t, 22.3, 0.2);
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        top: y,
        width: 830,
        height: 104,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        background: 'rgba(255,255,255,0.96)',
        borderRadius: 26,
        padding: '0 22px',
        transform: `translateX(${(1 - p) * -900 + out * 900}px)`,
        boxShadow: '0 10px 0 rgba(0,0,0,0.35)',
      }}
    >
      {icon === 'x' ? (
        <div style={{width: 70, height: 70, borderRadius: 18, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <XMark size={48} color="#fff" stroke={18} progress={clamp01((t - at - 0.1) / 0.25)} />
        </div>
      ) : (
        <svg width={70} height={70} viewBox="0 0 100 60">
          <path
            d="M50 30 C35 5 5 5 5 30 C5 55 35 55 50 30 C65 5 95 5 95 30 C95 55 65 55 50 30z"
            fill="none"
            stroke={C.red}
            strokeWidth="10"
            strokeDasharray="60 250"
            strokeDashoffset={-(t - at) * 260}
            strokeLinecap="round"
          />
          <path d="M50 30 C35 5 5 5 5 30 C5 55 35 55 50 30 C65 5 95 5 95 30 C95 55 65 55 50 30z" fill="none" stroke={C.red} strokeWidth="4" opacity="0.3" />
        </svg>
      )}
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: C.ink, lineHeight: 1.1}}>{text}</div>
    </div>
  );
};

/* ---------------------------------------------------------------- 60 second timer (mirror composite 30.2-32.8) */
const Timer60: React.FC<{t: number}> = ({t}) => {
  const p = pop(t, 30.6, 260, 13);
  if (p < 0.001 || t > 32.8) return null;
  const sweep = clamp01((t - 30.6) / 1.9);
  const secs = Math.round(sweep * 60);
  const r = 120;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{position: 'absolute', left: 110, top: 200, transform: `scale(${p})`, transformOrigin: 'left top'}}>
      <svg width={300} height={300} viewBox="0 0 300 300">
        <circle cx="150" cy="150" r={r + 18} fill={C.ink} />
        <circle cx="150" cy="150" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="22" />
        <circle cx="150" cy="150" r={r} fill="none" stroke={C.yellow} strokeWidth="22" strokeDasharray={circ} strokeDashoffset={circ * (1 - sweep)} transform="rotate(-90 150 150)" strokeLinecap="round" />
        <text x="150" y="168" textAnchor="middle" fontFamily={DISPLAY} fontSize="78" fill="#fff">
          {secs}s
        </text>
      </svg>
      <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#fff', marginTop: -8, WebkitTextStroke: '6px #0E1B24', paintOrder: 'stroke fill'}}>
        cuci muka
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- the cover label for the source's baked caption (36.5-42.5)
   rendered INSIDE the presenter transform so it stays locked over the burned-in text */
export const BakedTextCover: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // burned-in caption is on frames 1065-1276: cover from 1063 (full size on its first frame, settles from 108%)
  if (frame < 1063 || frame > 1278) return null;
  const first = t < 37.94;
  const p = 1 + 0.08 * (1 - pop(t, 35.43, 320, 14));
  const swap = pop(t, 37.94, 380, 12);
  return (
    <div
      style={{
        position: 'absolute',
        left: 188,
        top: 512,
        width: 666,
        height: 160,
        borderRadius: 34,
        background: first ? C.white : C.ink,
        boxShadow: '0 12px 0 rgba(0,0,0,0.25), 0 20px 40px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        transform: `scale(${p * (first ? 1 : 0.9 + 0.1 * swap)})`,
      }}
    >
      {first ? (
        <>
          <div style={{position: 'relative', width: 90, height: 90}}>
            <Products size={90} />
            <div style={{position: 'absolute', left: -6, top: -6}}>
              <XMark size={100} progress={clamp01((t - 35.55) / 0.3)} />
            </div>
          </div>
          <div style={{fontFamily: DISPLAY, fontSize: 62, color: C.ink, lineHeight: 1}}>
            NO PRODUCT
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.mute}}>{t < 36.44 ? 'tak perlu pakai any product' : 'biar je muka macam tu'}</div>
          </div>
        </>
      ) : (
        <>
          <svg width={96} height={96} viewBox="0 0 100 100">
            <circle cx="50" cy="54" r="40" fill="#fff" />
            <rect x="42" y="4" width="16" height="10" rx="3" fill="#fff" />
            <line x1="50" y1="54" x2="50" y2="24" stroke={C.red} strokeWidth="7" strokeLinecap="round" transform={`rotate(${(t - 37.94) * 360} 50 54)`} />
            <circle cx="50" cy="54" r="6" fill={C.ink} />
          </svg>
          <div style={{fontFamily: DISPLAY, fontSize: 60, color: C.yellow, lineHeight: 1, whiteSpace: 'nowrap'}}>
            TUNGGU 10 MINIT
          </div>
        </>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- arrow that tracks the tissue */
const TissuePointer: React.FC<{t: number; frame: number; a: number; b: number; text: string}> = ({t, frame, a, b, text}) => {
  if (!between(t, a, b)) return null;
  const pos = tissueAt(frame, t);
  if (!pos) return null;
  const v = life(t, a, b);
  const [x, y] = pos;
  const left = x > 540;
  const lx = left ? Math.max(130, x - 330) : Math.min(860, x + 330);
  const ly = Math.max(260, y - 260);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, v * 1.4)}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <circle cx={x} cy={y} r={120 + 6 * Math.sin(t * 8)} fill="none" stroke={C.yellow} strokeWidth="10" strokeDasharray="30 18" transform={`rotate(${t * 60} ${x} ${y})`} />
        <path d={`M${lx} ${ly + 40} Q${(lx + x) / 2} ${ly - 30} ${x + (left ? -70 : 70)} ${y - 90}`} stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d={`M${lx} ${ly + 40} Q${(lx + x) / 2} ${ly - 30} ${x + (left ? -70 : 70)} ${y - 90}`} stroke={C.ink} strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
      <Chip t={t} at={a} until={b} x={lx} y={ly} size={50} rotate={left ? -4 : 4}>
        {text}
      </Chip>
    </div>
  );
};

/* ---------------------------------------------------------------- recap card */
const RecapCard: React.FC<{t: number; at: number; i: number; cond: string; result: string; color: string; face: React.ReactNode}> = ({t, at, i, cond, result, color, face}) => {
  const p = pop(t, at, 280, 13);
  const x = 80 + (i % 2) * 425;
  const y = 180 + Math.floor(i / 2) * 285;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 405,
        height: 268,
        background: '#fff',
        borderRadius: 30,
        borderTop: `14px solid ${color}`,
        padding: '14px 20px',
        transform: `scale(${p})`,
        boxShadow: '0 14px 30px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{height: 118, display: 'flex', alignItems: 'center'}}>{face}</div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 25, color: C.mute, textAlign: 'center', lineHeight: 1.15}}>{cond}</div>
      <div style={{fontFamily: DISPLAY, fontSize: 46, color: C.ink, marginTop: 4}}>{result}</div>
    </div>
  );
};

/* ---------------------------------------------------------------- follow button */
const Follow: React.FC<{t: number}> = ({t}) => {
  const p = pop(t, 84.4, 260, 14);
  if (p < 0.001) return null;
  const clicked = t >= 85.85;
  const press = clicked ? 1 - 0.08 * Math.max(0, 1 - (t - 85.85) / 0.15) : 1;
  const cursorP = easeOut(clamp01((t - 85.3) / 0.5));
  return (
    <div style={{position: 'absolute', left: CX, top: 330, transform: `translate(-50%,-50%) scale(${p})`}}>
      <div style={{background: '#fff', borderRadius: 40, padding: '28px 40px', width: 760, boxShadow: '0 16px 40px rgba(0,0,0,0.3)', textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.mute}}>nak tahu lagi banyak</div>
        <div style={{fontFamily: DISPLAY, fontSize: 84, color: C.ink, lineHeight: 1.05}}>SKINCARE TIPS?</div>
        <div
          style={{
            margin: '18px auto 0',
            width: 440,
            padding: '16px 0',
            borderRadius: 18,
            background: clicked ? '#E9ECEF' : '#FE2C55',
            color: clicked ? C.ink : '#fff',
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 44,
            transform: `scale(${press})`,
          }}
        >
          {clicked ? 'Following ✓' : '+ Follow'}
        </div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: C.teal, marginTop: 14}}>Skincarehouse</div>
      </div>
      {t < 86.4 && (
        <svg width={90} height={90} viewBox="0 0 100 100" style={{position: 'absolute', left: 520 - 260 * (1 - cursorP), top: 300 + 200 * (1 - cursorP), opacity: cursorP}}>
          <path d="M20 10 L20 80 L38 64 L52 92 L64 86 L50 58 L74 58z" fill="#fff" stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- the whole front layer */
export const Front: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const zones = (on: Record<string, number>) => on;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* HOOK 0-4.72 */}
      <HookItem t={t} at={0.24} x={210} y={330} label="toner" icon={<Bottle size={110} />} />
      <HookItem t={t} at={1.16} x={790} y={330} label="moisturizer" icon={<Jar size={110} />} />
      <HookItem t={t} at={2.56} x={200} y={760} label="serum" icon={<Dropper size={110} />} />
      <HookItem t={t} at={3.8} x={800} y={760} label="products" icon={<Products size={110} />} />
      <Statement t={t} at={4.3} until={4.72} x={CX} y={1255} text="TAK PAYAH!" size={140} color="#fff" stroke={C.red} shake />

      {/* 4.72-7.72 "Before you beli skincare... kenal tak skin type you apa?" */}
      <Chip t={t} at={5.3} until={6.5} x={730} y={420} size={50} rotate={5}>
        beli skincare? 🛒
      </Chip>
      <Chip t={t} at={6.22} until={7.72} x={CX} y={1200} bg={C.ink} color={C.yellow} size={56} rotate={-3}>
        kenal tak skin type you?
      </Chip>

      {/* 8.1-9.25 Hello everyone */}
      {between(t, 8.08, 9.3) && (
        <>
          <Statement t={t} at={8.12} until={9.3} x={CX} y={330} text={'HELLO\nEVERYONE!'} size={120} color={C.yellow} />
          <div style={{position: 'absolute', left: 760, top: 470, transform: `scale(${pop(t, 8.3)}) rotate(${15 * Math.sin(t * 12)}deg)`, transformOrigin: '50% 90%'}}>
            <Emoji code="1f44b" size={130} />
          </div>
        </>
      )}

      {/* 12.25-16.9 Ramai ... dah beli skincare products tapi tak tahu skin type */}
      <Chip t={t} at={14.12} until={15.3} x={CX} y={1190} bg="#fff" size={50} rotate={-2}>
        dah beli skincare ✅
      </Chip>
      <Chip t={t} at={15.32} until={16.95} x={CX} y={1190} bg={C.red} color="#fff" size={50} rotate={2}>
        tapi tak tahu skin type ❓
      </Chip>
      <Confused t={t} />

      {/* 16.9-22.5 consequences */}
      <Consequence t={t} at={17.5} y={190} text="Tak dapat effect yang dia nak" />
      <Consequence t={t} at={18.6} y={310} text="Product tak bertindak dengan baik" />
      <Consequence t={t} at={20.0} y={430} text="Never ending skin problem" icon="inf" />

      {/* 22.5-26.25 prevent */}
      {between(t, 23.6, 26.3) && (
        <div style={{position: 'absolute', left: 740, top: 470, transform: `scale(${life(t, 23.68, 26.25)})`}}>
          <svg width={160} height={180} viewBox="0 0 100 112">
            <path d="M50 4 L92 20 V52 C92 80 72 98 50 108 C28 98 8 80 8 52 V20z" fill={C.green} stroke="#fff" strokeWidth="6" />
            <path d="M30 56 L45 71 L72 40" stroke="#fff" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - clamp01((t - 23.9) / 0.3))} />
          </svg>
        </div>
      )}
      <Chip t={t} at={24.24} until={26.25} x={250} y={560} bg={C.ink} color="#fff" size={46} rotate={-4}>
        dari awal ✓
      </Chip>
      <Chip t={t} at={25.04} until={26.25} x={CX} y={1200} bg={C.green} color="#fff" size={50} rotate={2}>
        kalau tahu skin type kita
      </Chip>

      {/* 26.25-27.5 So, macam mana? */}
      {between(t, 26.6, 27.6) && (
        <>
          <Statement t={t} at={26.74} until={27.55} x={CX} y={300} text={'MACAM\nMANA?'} size={150} color="#fff" stroke={C.ink} />
          <div style={{position: 'absolute', left: 720, top: 520, transform: `scale(${pop(t, 26.9)}) rotate(12deg)`}}>
            <Emoji code="1f914" size={150} />
          </div>
        </>
      )}

      {/* STEP 1 28.1-32.8 */}
      <StepTag t={t} at={28.1} until={32.8} n={1} title="Cuci muka" />
      {between(t, 28.5, 30.25) && (
        <div style={{position: 'absolute', left: 700, top: 330, transform: `scale(${life(t, 28.58, 30.2)}) rotate(${6 * Math.sin(t * 3)}deg)`}}>
          <Pump size={190} />
        </div>
      )}
      <Chip t={t} at={28.58} until={30.2} x={790} y={560} size={40} rotate={4}>
        gentle cleanser
      </Chip>
      <Timer60 t={t} />
      <Chip t={t} at={31.94} until={32.8} x={720} y={330} bg={C.blue} color="#fff" size={46} rotate={-3}>
        <Drop size={50} color="#fff" /> rinse it off
      </Chip>

      {/* STEP 2 32.8-36.45 */}
      <StepTag t={t} at={32.85} until={36.45} n={2} title="Bilas" />
      {between(t, 33.1, 36.5) && (
        <div style={{position: 'absolute', left: 720, top: 330, transform: `scale(${life(t, 33.22, 34.0)})`}}>
          <Drop size={150} />
        </div>
      )}
      <Chip t={t} at={33.22} until={34.1} x={790} y={530} bg="#fff" size={44} rotate={4}>
        air biasa
      </Chip>
      {between(t, 35.1, 36.5) &&
        (
          [
            [Bottle, 660, 0],
            [Jar, 780, 0.12],
            [Dropper, 900, 0.24],
          ] as const
        ).map(([Ic, x, d], i) => {
          const p = life(t, 35.16 + d, 36.45);
          return (
            <div key={i} style={{position: 'absolute', left: x - 70, top: 340, transform: `scale(${p})`}}>
              <div style={{background: '#fff', borderRadius: 24, padding: 6}}>
                <Ic size={100} />
              </div>
              <div style={{position: 'absolute', left: 0, top: 0}}>
                <XMark size={112} progress={clamp01((t - 35.3 - d) / 0.25)} />
              </div>
            </div>
          );
        })}

      {/* STEP 3 36.45-42.45 — big clock is in the background, label rides on the presenter */}
      <StepTag t={t} at={36.5} until={42.45} n={3} title="Tunggu" y={190} />
      <Chip t={t} at={40.66} until={41.3} x={235} y={900} bg={C.green} color="#fff" size={46} rotate={-4}>
        dah kering ✓
      </Chip>
      <Statement t={t} at={41.86} until={42.45} x={CX} y={1170} text={'PALING\nPENTING!'} size={130} color={C.yellow} stroke={C.ink} shake />

      {/* STEP 4 42.45-45.0 tissue */}
      <StepTag t={t} at={42.5} until={45.0} n={4} title="Dab tisu" />
      <TissuePointer t={t} frame={frame} a={43.44} b={44.95} text="tisu" />
      <Statement t={t} at={44.3} until={44.95} x={780} y={560} text="DAB!" size={110} color="#fff" stroke={C.teal} rotate={8} />

      {/* 45.0-48.5 face map */}
      {between(t, 45.0, 48.55) && (
        <div style={{position: 'absolute', left: CX - 190, top: 175, transform: `scale(${life(t, 45.05, 48.5)})`, transformOrigin: '50% 0%'}}>
          <FaceMap
            size={380}
            on={zones({
              dahi: pop(t, 45.8),
              pipi: pop(t, 46.44),
              hidung: pop(t, 47.04),
              dagu: pop(t, 48.1),
            })}
            color={{dahi: C.yellow, pipi: C.yellow, hidung: C.yellow, dagu: C.yellow}}
          />
        </div>
      )}

      {/* 48.5-51.8 check the tissue for oil */}
      {between(t, 48.5, 51.85) && (
        <div style={{position: 'absolute', left: CX - 170, top: 160, transform: `scale(${life(t, 48.56, 51.8)}) rotate(-4deg)`}}>
          <Tissue size={340} oil={clamp01((t - 51.02) / 0.3)} />
          <svg width={220} height={220} viewBox="0 0 100 100" style={{position: 'absolute', left: 150 + 60 * Math.sin(t * 2), top: 40 + 30 * Math.cos(t * 2.4)}}>
            <circle cx="40" cy="40" r="28" fill="rgba(200,230,255,0.35)" stroke={C.ink} strokeWidth="8" />
            <line x1="60" y1="60" x2="90" y2="90" stroke={C.ink} strokeWidth="12" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <Chip t={t} at={49.64} until={51.0} x={790} y={560} bg={C.ink} color="#fff" size={44} rotate={4}>
        check tisu 🔍
      </Chip>
      <Chip t={t} at={51.02} until={51.85} x={790} y={560} bg={C.gold} color={C.ink} size={48} rotate={4}>
        ada minyak?
      </Chip>

      {/* 51.8-59.1 combination */}
      <Chip t={t} at={53.44} until={59.1} x={290} y={200} bg={C.gold} color={C.ink} size={42} rotate={-3}>
        T-ZONE: ada minyak
      </Chip>
      <Chip t={t} at={54.66} until={59.1} x={790} y={200} bg="#fff" size={40} rotate={3}>
        pipi & dagu: tak ada
      </Chip>
      {between(t, 52.6, 58.3) && (
        <div style={{position: 'absolute', left: CX - 120, top: 255, transform: `scale(${life(t, 52.68, 58.25)})`, transformOrigin: '50% 0%'}}>
          <FaceMap size={240} labels={false} shine on={{dahi: pop(t, 53.62), hidung: pop(t, 53.96), pipi: 0, dagu: 0}} color={{dahi: C.gold, hidung: C.gold}} />
        </div>
      )}
      <Stamp t={t} at={58.22} until={59.4} x={CX} y={400} title="COMBINATION" />

      {/* 59.1-64.3 dry or normal */}
      {between(t, 59.1, 64.35) && (
        <div style={{position: 'absolute', left: 120, top: 180, transform: `scale(${life(t, 60.32, 64.3)}) rotate(-5deg)`}}>
          <Tissue size={260} oil={0} />
          <div style={{position: 'absolute', left: 60, top: 70}}>
            <Check size={110} progress={clamp01((t - 60.9) / 0.3)} />
          </div>
        </div>
      )}
      <Chip t={t} at={60.92} until={64.3} x={660} y={250} bg="#fff" size={40} rotate={3}>
        tak ada langsung minyak
      </Chip>
      <Chip t={t} at={62.7} until={64.3} x={600} y={400} bg="#C08A6B" color="#fff" size={56} rotate={-4} font={DISPLAY}>
        DRY
      </Chip>
      <Chip t={t} at={63.08} until={64.3} x={720} y={400} bg="transparent" color={C.ink} size={34} rotate={0}>
        atau
      </Chip>
      <Chip t={t} at={63.6} until={64.3} x={840} y={400} bg={C.green} color="#fff" size={56} rotate={4} font={DISPLAY}>
        NORMAL
      </Chip>

      {/* 64.3-68.3 oily */}
      {between(t, 64.3, 67.7) && (
        <div style={{position: 'absolute', left: CX - 120, top: 175, transform: `scale(${life(t, 65.0, 67.66)})`, transformOrigin: '50% 0%'}}>
          <FaceMap size={240} labels={false} shine on={{dahi: pop(t, 65.52), hidung: pop(t, 65.6), pipi: pop(t, 65.68), dagu: pop(t, 65.76)}} color={{dahi: C.gold, hidung: C.gold, pipi: C.gold, dagu: C.gold}} />
        </div>
      )}
      <Chip t={t} at={65.52} until={67.66} x={790} y={300} bg={C.gold} size={40} rotate={4}>
        setiap part ada minyak
      </Chip>
      <Stamp t={t} at={67.64} until={68.5} x={CX} y={400} title="OILY" color={C.gold} />

      {/* 68.3-73.75 look closely */}
      <Chip t={t} at={68.38} until={70.0} x={250} y={230} bg={C.ink} color={C.yellow} size={46} rotate={-4}>
        and last...
      </Chip>
      {between(t, 70.0, 72.9) && (
        <div style={{position: 'absolute', left: CX - 120, top: 175, transform: `scale(${life(t, 70.08, 72.86)})`, transformOrigin: '50% 0%'}}>
          <FaceMap size={240} labels={false} on={{dahi: 0.3, hidung: 0.3, pipi: 0.3, dagu: 0.3}} color={{dahi: '#fff', hidung: '#fff', pipi: '#fff', dagu: '#fff'}} />
        </div>
      )}
      <Chip t={t} at={71.22} until={72.86} x={790} y={300} bg="#fff" size={38} rotate={4}>
        tak ada minyak
      </Chip>
      {between(t, 72.86, 73.8) && (
        <AbsoluteFill style={{opacity: life(t, 72.86, 73.75)}}>
          <div
            style={{
              position: 'absolute',
              left: 540 - 400,
              top: 690 - 400,
              width: 800,
              height: 800,
              borderRadius: '50%',
              border: `18px solid ${C.ink}`,
              boxShadow: '0 0 0 2000px rgba(14,27,36,0.45), inset 0 0 0 6px rgba(255,255,255,0.6)',
            }}
          />
          <div style={{position: 'absolute', left: 740, top: 1010, width: 60, height: 300, background: C.ink, borderRadius: 30, transform: 'rotate(-35deg)', transformOrigin: 'top'}} />
          <div style={{position: 'absolute', left: 120, top: 230, transform: `scale(${pop(t, 72.95)}) rotate(-10deg)`}}>
            <Emoji code="1f9d0" size={150} />
          </div>
          <Statement t={t} at={72.9} x={640} y={250} text="LOOK CLOSELY" size={80} color={C.yellow} rotate={4} />
        </AbsoluteFill>
      )}

      {/* 73.75-79.4 dry */}
      <Chip t={t} at={74.06} until={78.86} x={250} y={240} bg="#fff" size={44} rotate={-5}>
        〰 garis-garis
      </Chip>
      <Chip t={t} at={76.22} until={78.86} x={760} y={330} bg={C.blue} color="#fff" size={44} rotate={4}>
        dehydrated
      </Chip>
      <Chip t={t} at={77.04} until={78.86} x={270} y={420} bg="#C08A6B" color="#fff" size={46} rotate={-3}>
        flaky
      </Chip>
      <Stamp t={t} at={78.84} until={79.42} x={CX} y={400} title="DRY" color="#E7B48F" />

      {/* 79.4-83.55 recap */}
      {between(t, 79.4, 83.6) && (
        <AbsoluteFill style={{opacity: 1 - ramp(t, 83.4, 0.2)}}>
          <RecapCard t={t} at={79.5} i={0} cond="T-zone ada minyak, pipi & dagu tak ada" result="COMBINATION" color={C.teal} face={<FaceMap size={96} labels={false} on={{dahi: 1, hidung: 1}} color={{dahi: C.gold, hidung: C.gold}} />} />
          <RecapCard t={t} at={79.7} i={1} cond="tak ada langsung minyak" result="DRY / NORMAL" color={C.green} face={<FaceMap size={96} labels={false} on={{}} />} />
          <RecapCard t={t} at={79.9} i={2} cond="setiap part ada minyak" result="OILY" color={C.gold} face={<FaceMap size={96} labels={false} on={{dahi: 1, hidung: 1, pipi: 1, dagu: 1}} color={{dahi: C.gold, hidung: C.gold, pipi: C.gold, dagu: C.gold}} />} />
          <RecapCard t={t} at={80.1} i={3} cond="tak ada minyak + garis / flaky" result="DRY" color="#C08A6B" face={<FaceMap size={96} labels={false} on={{pipi: 1, dagu: 1, dahi: 1, hidung: 1}} color={{dahi: '#D9C3B0', hidung: '#D9C3B0', pipi: '#D9C3B0', dagu: '#D9C3B0'}} />} />
          <Chip t={t} at={80.92} until={83.55} x={CX} y={790} bg={C.yellow} size={42} rotate={-2}>
            🛍️ senang nak purchase skincare!
          </Chip>
        </AbsoluteFill>
      )}

      {/* 83.55-86.62 follow */}
      {t < 86.85 && (
        <AbsoluteFill style={{opacity: 1 - ramp(t, 86.55, 0.25), transform: `translateY(${-160 * ramp(t, 86.55, 0.3)}px)`}}>
          <Follow t={t} />
        </AbsoluteFill>
      )}

      {/* 86.62- Bye */}
      {t >= 86.62 && (
        <>
          <Statement t={t} at={86.7} x={CX} y={360} text="BYE!" size={190} color="#fff" stroke={C.ink} rotate={-6} />
          <div style={{position: 'absolute', left: 700, top: 470, transform: `scale(${pop(t, 86.75)}) rotate(${18 * Math.sin(t * 14)}deg)`, transformOrigin: '50% 90%'}}>
            <Emoji code="1f44b" size={150} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- full-screen covers (hide the draft artefacts baked into the source) */
const Panel: React.FC<{t: number; a: number; b: number; color: string; children?: React.ReactNode; dir?: 1 | -1}> = ({t, a, b, color, children, dir = 1}) => {
  // fully opaque from a to b; slides in over 0.18s before a and out over 0.2s after b
  if (t < a - 0.2 || t > b + 0.22) return null;
  const inP = easeOut(clamp01((t - (a - 0.18)) / 0.18));
  const outP = easeOut(clamp01((t - b) / 0.2));
  const x = dir * ((1 - inP) * 1100 - outP * 1100);
  return <AbsoluteFill style={{transform: `translateX(${x}px)`, background: color}}>{children}</AbsoluteFill>;
};

export const Covers: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill>
      {/* source colour bars: frames 232-241 */}
      <Panel t={t} a={7.7} b={8.08} color={C.yellow}>
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Emoji code="1f44b" size={260} />
        </AbsoluteFill>
      </Panel>
      {/* source draft title box with editor handles + cursor: frames 278-366 */}
      <Panel t={t} a={9.18} b={12.24} color={C.ink} dir={-1}>
        <TitleCard t={t} />
      </Panel>
      {/* source glitch transition: frames 826-842 */}
      <Panel t={t} a={27.5} b={28.08} color={C.teal}>
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: '#fff', letterSpacing: 6}}>JOM TEST</div>
          <div style={{fontFamily: DISPLAY, fontSize: 150, color: C.yellow, WebkitTextStroke: `14px ${C.ink}`, paintOrder: 'stroke fill', lineHeight: 1}}>STEP 1</div>
        </AbsoluteFill>
      </Panel>
      {/* end card over the source's black tail frames (87.37s+) */}
      {t >= 87.2 && (
        <AbsoluteFill style={{background: C.ink, opacity: ramp(t, 87.2, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
          <div style={{fontFamily: DISPLAY, fontSize: 110, color: C.yellow}}>Skincarehouse</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#fff'}}>follow untuk skincare tips</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
