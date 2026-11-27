import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AudioMix, clamp, ease, f, Footage, PHRASES, pop, ramp, Sfx, SpeakerCut, tokens} from './common';
import {Moon, Sparkle, Sun} from './stickers';
import track from './track.json';

/*
 VIDEO 04 — Creative freestyle "Skincare Girl Talk".
 Beauty-editorial identity (ivory paper, turmeric accents, Instrument Serif + DM Sans + handwriting) with UGC energy:
 magazine cover (masthead tucked BEHIND her head) -> handwritten "BOLEH" punch-in -> speech bubble ->
 pagi / tengah hari / malam triptych -> night-shift collage with layered cut-outs -> magazine spread with
 product reveal + tracked arrow to the real mask -> doodle sun joke -> back-cover closing composition.
*/

const IVORY = '#FBF6EC';
const PAPER = '#F4EBDA';
const TUR = '#E9A91C';
const TUR_D = '#C98A0B';
const INK = '#2A2118';
const SERIF = 'InstrSerif';
const SERIF_I = 'InstrSerifI';
const SANS = 'DMSansM';
const SANS_X = 'DMSansX';
const HAND = 'CaveatS';

const sec = (frame: number) => frame / 30;
const head = (frame: number) => {
  const [cx, top] = (track as number[][])[Math.min(frame, track.length - 1)];
  return {cx, top};
};

/* ---------- helpers ---------- */
const Paper: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 30% 20%, #FFFDF7 0%, ${IVORY} 45%, ${PAPER} 100%)`}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(120,90,40,0.07) 1px, transparent 1px)', backgroundSize: '7px 7px'}} />
  </AbsoluteFill>
);

const Scribble: React.FC<{w: number; progress: number; color?: string; stroke?: number}> = ({w, progress, color = TUR, stroke = 9}) => (
  <svg width={w} height={34} viewBox={`0 0 ${w} 34`} style={{overflow: 'visible'}}>
    <path d={`M4 22 C ${w * 0.25} 8, ${w * 0.5} 30, ${w * 0.75} 14 S ${w - 10} 20, ${w - 4} 12`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
  </svg>
);

const HandArrow: React.FC<{d: string; w: number; h: number; progress: number; color?: string}> = ({d, w, h, progress, color = INK}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
    <path d={d} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
  </svg>
);

const HandText: React.FC<{t: string; at: number; size?: number; color?: string; style?: React.CSSProperties; rot?: number}> = ({t, at, size = 64, color = INK, style, rot = -3}) => {
  const frame = useCurrentFrame();
  if (frame < f(at)) return null;
  // "writing on" reveal from left to right
  const p = ramp(frame, f(at), f(at) + Math.max(6, t.length * 0.9));
  return (
    <div style={{position: 'absolute', font: `600 ${size}px ${HAND}`, color, whiteSpace: 'nowrap', transform: `rotate(${rot}deg)`, clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)`, ...style}}>
      {t}
    </div>
  );
};

/** live footage framed like a magazine page (ivory border) */
const Framed: React.FC<{scale?: number; origin?: string; border?: number; children?: React.ReactNode; over?: React.ReactNode}> = ({scale = 1, origin = '540px 760px', border = 26, children, over}) => (
  <AbsoluteFill style={{background: IVORY}}>
    <div style={{position: 'absolute', left: border, top: border, right: border, bottom: border, overflow: 'hidden', borderRadius: 6}}>
      <div style={{position: 'absolute', left: -border, top: -border, width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: origin}}>
        <Footage />
        {children}
      </div>
    </div>
    {over}
  </AbsoluteFill>
);

/* ---------- A. magazine cover (0 – 2.28) ---------- */
const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 8, 68], [1.2, 1.12, 1.1], clamp);
  const origin = '540px 640px';
  const mast = pop(frame, 1, 10);
  return (
    <AbsoluteFill style={{background: IVORY}}>
      <div style={{position: 'absolute', left: 26, top: 26, right: 26, bottom: 26, overflow: 'hidden', borderRadius: 6}}>
        <div style={{position: 'absolute', left: -26, top: -26, width: 1080, height: 1920, transform: `translateX(120px) scale(${z})`, transformOrigin: origin}}>
          <Footage />
          {/* masthead sits between the room and the speaker -> tucked behind her hijab */}
          <div style={{position: 'absolute', left: 0, width: 1080, top: 330, textAlign: 'center', font: `400 236px ${SERIF}`, letterSpacing: '-0.04em', lineHeight: 0.8, color: TUR, opacity: Math.min(1, mast * 1.4), transform: `translateY(${(1 - mast) * 40}px)`}}>
            mask talk
          </div>
          <SpeakerCut />
        </div>
      </div>
      {/* cover lines */}
      <div style={{position: 'absolute', left: 84, top: 182, font: `500 28px ${SANS}`, letterSpacing: '0.28em', color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.4)', opacity: ramp(frame, 4, 8)}}>
        ISSUE 01 · THE OTMS EDIT
      </div>
      <div style={{position: 'absolute', left: 70, top: 1090, width: 430, opacity: ramp(frame, 10, 14), transform: `translateX(${(1 - pop(frame, 10, 10)) * -60}px)`}}>
        <div style={{font: `500 30px ${SANS}`, letterSpacing: '0.2em', color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.5)'}}>THE BIG QUESTION</div>
        <div style={{font: `italic 400 82px ${SERIF_I}`, lineHeight: 0.92, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,0.45)'}}>
          pakai waktu <span style={{color: '#FFD666'}}>pagi</span>, boleh ke?
        </div>
      </div>
      <HandText t="(yes, mask still on)" at={1.2} size={44} color="#FFE8A3" style={{left: 600, top: 214, textShadow: '0 2px 8px rgba(0,0,0,0.45)'}} rot={-4} />
      {/* barcode doodle */}
      <div style={{position: 'absolute', left: 780, top: 1250, opacity: ramp(frame, 16, 20), display: 'flex', gap: 3, padding: 8, background: '#fff', borderRadius: 4}}>
        {[3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2].map((w, i) => (
          <div key={i} style={{width: w * 2, height: 64, background: INK}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- B/C/E/I: framed talking moments with punch-ins ---------- */
const PUNCH: [number, number, number][] = [
  // [start, end, zoom]
  [2.28, 3.06, 1.28],
  [3.06, 4.48, 1.05],
  [8.02, 8.64, 1.32],
  [16.9, 17.6, 1.3],
  [17.6, 20.08, 1.05],
  [20.08, 22.14, 1.05],
];
const punchZoom = (frame: number) => {
  const t = sec(frame);
  const p = PUNCH.find(([a, b]) => t >= a && t < b);
  if (!p) return 1.05;
  if (p[0] === 20.08) return interpolate(frame, [f(20.08), f(21.74), f(22.14)], [1.05, 1.22, 1.3], clamp); // slow push on "sensitif kepada matahari"
  const k = ease(ramp(frame, f(p[0]), f(p[0]) + 5));
  return 1.05 + (p[2] - 1.05) * k;
};

const BolehNote: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(2.3);
  return (
    <>
      <div style={{position: 'absolute', left: 120, top: 150, transform: `rotate(-6deg) scale(${pop(frame, st, 8)})`}}>
        <div style={{font: `600 150px ${HAND}`, color: TUR, textShadow: '0 3px 10px rgba(0,0,0,0.25)'}}>boleh!</div>
        <div style={{marginTop: -30}}>
          <Scribble w={300} progress={ramp(frame, st + 4, st + 12)} />
        </div>
      </div>
      <HandText t="tak ada masalah ✓" at={2.62} size={58} color="#fff" style={{left: 500, top: 210, textShadow: '0 2px 8px rgba(0,0,0,0.45)'}} rot={-6} />
    </>
  );
};

const Bubble: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(3.2);
  const p = pop(frame, st, 10);
  return (
    <div style={{position: 'absolute', left: 520, top: 230, transform: `scale(${p}) rotate(3deg)`, transformOrigin: '10% 100%'}}>
      <div style={{background: '#fff', borderRadius: 40, padding: '26px 34px', boxShadow: '0 12px 30px rgba(42,33,24,0.25)'}}>
        <div style={{font: `italic 400 66px ${SERIF_I}`, color: INK, lineHeight: 1}}>
          dia tak ada <span style={{color: TUR_D}}>jadual.</span>
        </div>
        <div style={{font: `500 30px ${SANS}`, color: '#8A7A66', marginTop: 8, letterSpacing: '0.04em', opacity: ramp(frame, f(3.95), f(4.05))}}>no rules, no schedule.</div>
      </div>
      <svg width={70} height={60} style={{position: 'absolute', left: 30, bottom: -46}}>
        <path d="M0 0 L60 0 L8 56Z" fill="#fff" />
      </svg>
    </div>
  );
};

const StarBurst: React.FC<{at: number; x: number; y: number; text: string}> = ({at, x, y, text}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, f(at), 8);
  if (frame < f(at)) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${p}) rotate(${-10 + Math.sin(frame * 0.4) * 3}deg)`}}>
      <svg width={420} height={260} viewBox="0 0 420 260" style={{position: 'absolute', left: -40, top: -60}}>
        <path d={Array.from({length: 28}).map((_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const r = i % 2 ? 105 : 130;
          return `${i ? 'L' : 'M'}${210 + Math.cos(a) * r * 1.55} ${130 + Math.sin(a) * r * 0.95}`;
        }).join(' ') + 'Z'} fill={TUR} />
      </svg>
      <div style={{position: 'relative', width: 340, textAlign: 'center', font: `600 64px ${HAND}`, color: INK, lineHeight: 1}}>{text}</div>
    </div>
  );
};

const SunJoke: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(20.84);
  if (frame < st) return null;
  const p = pop(frame, st, 10);
  const wink = frame >= f(21.74);
  return (
    <div style={{position: 'absolute', left: 690, top: 260, transform: `translateX(${(1 - p) * 400}px) rotate(${Math.sin(frame * 0.2) * 6}deg)`}}>
      <Sun size={210} color="#FFC83D" />
      {/* doodle face */}
      <svg width={210} height={210} viewBox="0 0 100 100" style={{position: 'absolute', left: 0, top: 0}}>
        {wink ? <path d="M36 46 Q40 42 44 46" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" /> : <circle cx={40} cy={45} r={3} fill={INK} />}
        <circle cx={60} cy={45} r={3} fill={INK} />
        <path d="M40 57 Q50 64 60 57" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      </svg>
      <HandText t={wink ? 'tak ada drama ✓' : 'sensitif? 👀'.replace('👀', '…')} at={wink ? 21.74 : 20.9} size={54} color="#fff" style={{left: -300, top: -40, textShadow: '0 2px 8px rgba(0,0,0,0.5)'}} rot={-6} />
    </div>
  );
};

/* ---------- D. pagi / tengah hari / malam triptych (4.48 – 8.02) ---------- */
const Triptych: React.FC = () => {
  const frame = useCurrentFrame();
  const t = sec(frame);
  const labels = [
    {t: 'pagi', at: 5.14, icon: <Sun size={70} />},
    {t: 'tengah hari', at: 5.74, icon: <Sun size={70} color="#FFDB6E" />},
    {t: 'malam', at: 6.82, icon: <Moon size={64} />},
  ];
  const all = t >= 7.74;
  const enter = ease(ramp(frame, f(4.48), f(4.48) + 8));
  const {cx} = head(frame);
  const W = 1080 / 3;
  return (
    <AbsoluteFill style={{background: IVORY}}>
      {labels.map((l, i) => {
        const active = all || t < 5.14 || (t >= l.at && (i === 2 || t < labels[i + 1].at));
        const shown = true;
        const s = 0.98;
        const slide = (1 - enter) * (i - 1) * 200;
        return (
          <div key={i} style={{position: 'absolute', left: i * W + 8, top: 26, width: W - 16, bottom: 26, overflow: 'hidden', borderRadius: 6, opacity: shown ? 1 : 0.0, transform: `translateY(${slide}px)`}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${(W - 16) / 2 - cx * s}px, ${-20}px) scale(${s})`, transformOrigin: '0 0', filter: active ? 'none' : 'grayscale(0.85) brightness(0.8)'}}>
              <Footage />
            </div>
            {t >= l.at && (
              <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', transform: `scale(${pop(frame, f(l.at), 8)})`}}>
                <div style={{display: 'inline-block', padding: '6px 22px 12px', background: active ? IVORY : 'rgba(251,246,236,0.7)', borderRadius: 999, font: `italic 400 64px ${SERIF_I}`, color: INK, whiteSpace: 'nowrap'}}>{l.t}</div>
                <div style={{marginTop: 8, display: 'flex', justifyContent: 'center'}}>{l.icon}</div>
              </div>
            )}
          </div>
        );
      })}
      {all && (
        <div style={{position: 'absolute', left: 120, top: 1150, transform: `rotate(-6deg) scale(${pop(frame, f(7.74), 9)})`, padding: '10px 40px 18px', background: TUR, borderRadius: 18, boxShadow: '0 10px 24px rgba(42,33,24,0.3)'}}>
          <span style={{font: `600 92px ${HAND}`, color: INK}}>semua boleh ✓</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- F. night-shift collage (8.64 – 12.74) ---------- */
const Collage: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(8.64);
  const p = ease(ramp(frame, st, st + 10));
  const steps = [
    {t: 'shift malam', at: 9.68, icon: <Moon size={70} color="#E9C46A" />},
    {t: 'pagi: bangun', at: 10.46, icon: <Sun size={74} />},
    {t: 'pakai OTMS ✓', at: 11.96, icon: <Img src={staticFile('otms/otms_jar.png')} style={{width: 110}} />},
  ];
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', left: 84, top: 180, font: `500 28px ${SANS}`, letterSpacing: '0.26em', color: TUR_D, opacity: p}}>CONTOH 01</div>
      <div style={{position: 'absolute', left: 80, top: 214, font: `italic 400 92px ${SERIF_I}`, lineHeight: 0.95, color: INK, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
        for the night-shift
        <br />
        girlies
      </div>
      {/* turmeric disc + layered cut-out (offset silhouette) */}
      <div style={{position: 'absolute', left: 90, top: 820, width: 640, height: 640, borderRadius: 320, background: TUR, transform: `scale(${0.6 + 0.4 * p})`, opacity: 0.95}} />
      <AbsoluteFill style={{transform: `translate(${-190 + (1 - p) * -300}px, 0px) scale(0.86)`, transformOrigin: '540px 1920px'}}>
        <SpeakerCut style={{filter: `drop-shadow(26px 0 0 ${INK}) drop-shadow(0 18px 30px rgba(42,33,24,0.25))`}} />
      </AbsoluteFill>
      {steps.map((s, i) => {
        if (frame < f(s.at)) return null;
        const q = pop(frame, f(s.at), 9);
        return (
          <div key={i} style={{position: 'absolute', left: 600, top: 520 + i * 230, display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${q}) rotate(${i % 2 ? 3 : -3}deg)`, transformOrigin: '0 50%'}}>
            <div style={{width: 110, display: 'flex', justifyContent: 'center'}}>{s.icon}</div>
            <div style={{font: `600 58px ${HAND}`, color: INK, whiteSpace: 'nowrap'}}>{s.t}</div>
            {i < 2 && frame >= f(steps[i + 1].at) - 6 && (
              <div style={{position: 'absolute', left: 40, top: 110}}>
                <HandArrow w={60} h={110} d="M20 4 C34 34 34 64 22 96 M8 80 L22 98 L38 82" progress={ramp(frame, f(steps[i + 1].at) - 6, f(steps[i + 1].at))} />
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- G. magazine spread + product reveal (12.74 – 16.9) ---------- */
const Spread: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(12.74);
  const p = ease(ramp(frame, st, st + 10));
  const s = 0.66;
  const fx = 70;
  const fy = 330;
  const fw = 580;
  const fh = 730;
  const {cx, top} = head(frame);
  // photo keeps her face centred
  const ox = (fw - 28) / 2 - cx * s;
  const oy = 40 - top * s;
  // tracked arrow target (masked cheek) in screen space (photo is rotated -2deg; small error is fine)
  const tx = fx + 14 + ox + (cx + 70) * s;
  const ty = fy + 14 + oy + (top + 500) * s;
  const jar = pop(frame, f(13.2), 12);
  const list = [
    {t: 'kerja pagi', at: 13.46},
    {t: 'balik petang', at: 14.38},
    {t: 'malam: OTMS ✓', at: 15.26},
  ];
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', left: 84, top: 176, font: `500 28px ${SANS}`, letterSpacing: '0.26em', color: TUR_D, opacity: p}}>CONTOH 02</div>
      <div style={{position: 'absolute', left: 80, top: 212, font: `italic 400 84px ${SERIF_I}`, lineHeight: 0.95, color: INK, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, whiteSpace: 'nowrap'}}>for the 9-to-5 girlies</div>
      <div style={{position: 'absolute', left: fx, top: fy, width: fw, height: fh, background: '#fff', padding: 14, boxShadow: '0 18px 40px rgba(42,33,24,0.22)', transform: `rotate(${-2 * p}deg) translateY(${(1 - p) * 80}px)`, opacity: p}}>
        <div style={{position: 'relative', width: fw - 28, height: fh - 28, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: ox, top: oy, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: '0 0'}}>
            <Footage />
          </div>
        </div>
      </div>
      {/* product reveal on a turmeric block, right column */}
      <div style={{position: 'absolute', left: 660, top: 430, width: 250, transform: `translateX(${(1 - jar) * 450}px)`}}>
        <div style={{position: 'absolute', left: 15, top: 0, width: 220, height: 380, borderRadius: 110, background: TUR}} />
        <Img src={staticFile('otms/otms_jar.png')} style={{position: 'absolute', left: -20, top: 110, width: 290, filter: 'drop-shadow(0 16px 18px rgba(42,33,24,0.35))'}} />
        <div style={{position: 'absolute', left: 0, top: 400, width: 250, textAlign: 'center', font: `italic 400 36px ${SERIF_I}`, color: INK, lineHeight: 1.02}}>
          Yello Oatmeal Turmeric Mask &amp; Scrub
        </div>
        <div style={{position: 'absolute', left: 0, top: 532, width: 250, textAlign: 'center', font: `500 22px ${SANS}`, letterSpacing: '0.2em', color: TUR_D}}>(OTMS)</div>
      </div>
      {/* handwritten checklist under the photo */}
      <div style={{position: 'absolute', left: 92, top: 1100}}>
        {list.map((l, i) =>
          frame >= f(l.at) ? (
            <div key={i} style={{position: 'absolute', left: 0, top: i * 84, font: `600 ${i === 2 ? 64 : 58}px ${HAND}`, color: i === 2 ? TUR_D : INK, whiteSpace: 'nowrap', clipPath: `inset(-20% ${(1 - ramp(frame, f(l.at), f(l.at) + 10)) * 100}% -20% -5%)`}}>
              {i + 1}. {l.t}
            </div>
          ) : null,
        )}
      </div>
      {/* "same one on my face" — arrow tracks her masked cheek inside the photo */}
      {frame >= f(15.9) && (
        <>
          <HandText t="the same one" at={15.9} size={46} color={INK} style={{left: 600, top: 1120}} rot={-4} />
          <HandText t="on my face rn" at={15.98} size={46} color={INK} style={{left: 610, top: 1170}} rot={-4} />
          <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <path d={`M 640 1120 C 620 1040, ${tx + 90} ${ty + 110}, ${tx + 14} ${ty + 16}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(frame, f(16.0), f(16.35))} />
            <path d={`M ${tx + 12} ${ty + 54} L ${tx + 12} ${ty + 14} L ${tx + 50} ${ty + 24}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={frame >= f(16.3) ? 1 : 0} />
          </svg>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- J. back-cover close (22.14 – end) ---------- */
const BackCover: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(22.14);
  const p = ease(ramp(frame, st, st + 10));
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', font: `400 200px ${SERIF}`, letterSpacing: '-0.045em', lineHeight: 0.82, color: INK, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
        boleh je
        <br />
        <span style={{font: `italic 400 210px ${SERIF_I}`, color: TUR}}>bila-bila.</span>
      </div>
      <AbsoluteFill style={{transform: `translate(-40px, 0) scale(${0.84 - 0.02 * p})`, transformOrigin: '540px 1920px'}}>
        <SpeakerCut style={{filter: `drop-shadow(-24px 0 0 ${TUR}) drop-shadow(0 18px 30px rgba(42,33,24,0.25))`}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 690, top: 1110, transform: `translateY(${(1 - pop(frame, st + 10, 12)) * 400}px) rotate(6deg)`}}>
        <Img src={staticFile('otms/otms_jar.png')} style={{width: 220, filter: 'drop-shadow(0 14px 16px rgba(42,33,24,0.35))'}} />
      </div>
      <HandText t="pagi · petang · malam ✓" at={22.9} size={50} color={TUR_D} style={{left: 90, top: 200}} rot={-3} />
      {[0, 1, 2, 3].map((i) => {
        const tw = Math.max(0, Math.sin(frame * 0.18 + i * 1.7));
        return (
          <div key={i} style={{position: 'absolute', left: [150, 880, 820, 120][i], top: [720, 650, 960, 1020][i], opacity: tw * p, transform: `scale(${0.6 + tw * 0.6})`}}>
            <Sparkle size={44} color={TUR} glow={false} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- captions: ivory pill, keywords in serif italic turmeric ---------- */
const KEY = new Set(['boleh', 'otms', 'pagi', 'malam', 'tengah', 'hari', 'petang', 'matahari', 'sensitif', 'jadual', 'bila-bila', 'shift']);
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = sec(frame);
  const ph = PHRASES.find((p) => t >= p.s - 0.04 && t < p.e);
  if (!ph) return null;
  const tk = tokens(ph);
  const p = ease(ramp(frame, f(ph.s - 0.04), f(ph.s - 0.04) + 5));
  return (
    <div style={{position: 'absolute', left: 80, width: 830, top: 1408, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 18}px)`}}>
      <div style={{maxWidth: 760, padding: '12px 26px 14px', borderRadius: 26, background: 'rgba(251,246,236,0.94)', boxShadow: '0 8px 22px rgba(42,33,24,0.18)', textAlign: 'center', lineHeight: 1.12}}>
        {tk.map((w, i) => {
          const k = KEY.has(w.t.toLowerCase().replace(/[^a-z-]/g, ''));
          const said = t >= w.s - 0.03;
          return (
            <span key={i} style={{font: k ? `italic 400 50px ${SERIF_I}` : `500 40px ${SANS}`, color: k ? TUR_D : INK, opacity: said ? 1 : 0.38, marginRight: 10}}>
              {w.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const SFX: Sfx[] = [
  [0.0, 'shutter', 0.3],
  [0.06, 'impact', 0.12],
  [0.4, 'pop', 0.1],
  [1.2, 'marker', 0.14],
  [2.28, 'whoosh', 0.12],
  [2.32, 'pop', 0.16],
  [2.4, 'marker', 0.16],
  [3.2, 'bubble', 0.18],
  [4.46, 'swipe', 0.16],
  [5.14, 'click', 0.14],
  [5.74, 'click', 0.14],
  [6.82, 'click', 0.14],
  [7.74, 'pop', 0.16],
  [7.8, 'sparkle', 0.12],
  [8.02, 'boing', 0.12],
  [8.62, 'swipe', 0.16],
  [9.68, 'marker', 0.14],
  [10.46, 'marker', 0.14],
  [11.96, 'pop', 0.16],
  [12.72, 'swipe', 0.16],
  [13.3, 'whoosh', 0.12],
  [13.46, 'marker', 0.12],
  [14.38, 'marker', 0.12],
  [15.26, 'marker', 0.12],
  [16.0, 'marker', 0.12],
  [16.88, 'swipe', 0.14],
  [16.9, 'boing', 0.1],
  [20.84, 'whoosh', 0.1],
  [20.9, 'pop', 0.14],
  [21.74, 'ding', 0.16],
  [22.1, 'swipe', 0.14],
  [22.4, 'pop', 0.12],
  [22.9, 'marker', 0.12],
  [23.3, 'sparkle', 0.14],
];

export const V4Freestyle: React.FC = () => {
  const frame = useCurrentFrame();
  const t = sec(frame);
  let body: React.ReactNode;
  if (t < 2.28) body = <Cover />;
  else if (t >= 4.48 && t < 8.02) body = <Triptych />;
  else if (t >= 8.64 && t < 12.74) body = <Collage />;
  else if (t >= 12.74 && t < 16.9) body = <Spread />;
  else if (t >= 22.14) body = <BackCover />;
  else
    body = (
      <Framed
        scale={punchZoom(frame)}
        origin="540px 820px"
        over={
          <>
        {t >= 2.28 && t < 3.06 && <BolehNote />}
        {t >= 3.06 && t < 4.48 && <Bubble />}
        {t >= 8.02 && t < 8.64 && <StarBurst at={8.04} x={560} y={360} text="tak ada masalah" />}
        {t >= 16.9 && t < 17.6 && <StarBurst at={16.92} x={560} y={360} text="tak ada masalah" />}
        {t >= 17.6 && t < 22.14 && <SunJoke />}
          </>
        }
      />
    );
  return (
    <AbsoluteFill style={{background: IVORY, overflow: 'hidden'}}>
      {body}
      <Captions />
      <AudioMix music="music4.wav" base={0.16} under={0.07} sfx={SFX} />
    </AbsoluteFill>
  );
};
