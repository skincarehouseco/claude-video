import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AudioMix, clamp, DUR, f, Footage, PHRASES, pop, ramp, Sfx, SpeakerCut} from './common';
import {Bow, Check, Flower, Heart, MarkerArrow, MarkerCircle, Moon, Sparkle, Sun, SunsetIcon} from './stickers';
import {ArcText} from './text';

/*
 VIDEO 01 — Reference A editing language (dreamy "whimsical tutorial" look):
 - opens in the real room with an arched, multi-font title stack + glossy stickers
 - hard cut to a clean removed background (soft lilac-blush gradient); speaker cut out, bottom-left
 - two-tier section headers (script label + chunky rounded title + pink sub-line)
 - content "screenshot" cards with hand-drawn red circles / arrows
 - thin lowercase italic captions, twinkling sparkles, soft music-box bed
 - closes back in the real room with an arched sign-off
*/

const INTRO_END = f(2.28);
const OUTRO = f(22.14);
const CREAM = '#FFF6D9';
const PINK = '#F6A3C5';
const LILAC = '#B99BDF';

/* ---------- letter-by-letter "launch in" + gentle "tremble" loop ---------- */
const launch = (frame: number, start: number, i: number, step = 1.2) => {
  const p = pop(frame, start + i * step, 10);
  const wob = Math.sin((frame + i * 7) * 0.35) * 1.6 * Math.min(1, p);
  return {
    opacity: Math.min(1, p * 1.4),
    transform: `translate(-50%, -100%) translateY(${(1 - p) * 50}px) scale(${0.3 + 0.7 * p}) rotate(${wob}deg)`,
  } as React.CSSProperties;
};

const Twinkles: React.FC<{n?: number; seed?: number; area?: [number, number, number, number]}> = ({n = 26, seed = 1, area = [40, 140, 1040, 1800]}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const r = (k: number) => {
          const x = Math.sin((i + 1) * 12.9898 * (k + seed) + seed * 78.233) * 43758.5453;
          return x - Math.floor(x);
        };
        const x = area[0] + r(1) * (area[2] - area[0]);
        const y = area[1] + r(2) * (area[3] - area[1]) - ((frame * (0.3 + r(3) * 0.6)) % 140);
        const tw = Math.max(0, Math.sin(frame * (0.08 + r(4) * 0.12) + r(5) * 6.28));
        const s = 10 + r(6) * 26;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: tw * 0.95, transform: `scale(${0.5 + tw * 0.6}) rotate(${frame * 2}deg)`}}>
            <Sparkle size={s} color={i % 3 === 0 ? '#FFF2B8' : '#FFFFFF'} />
          </div>
        );
      })}
    </>
  );
};

const StickerAt: React.FC<{x: number; y: number; start: number; rot?: number; children: React.ReactNode}> = ({x, y, start, rot = 0, children}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, start, 10);
  const bob = Math.sin((frame + x) * 0.09) * 6;
  return (
    <div style={{position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot + Math.sin(frame * 0.07 + y) * 5}deg)`, filter: 'drop-shadow(0 6px 10px rgba(120,60,90,0.25))'}}>
      {children}
    </div>
  );
};

/* ---------- Intro title stack (real room) ---------- */
const IntroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = '0 0 18px rgba(255,190,220,0.55)';
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 520 - 120, top: 250}}>
        <ArcText text="pakai" font="italic 400 96px InstrSerifI" radius={900} style={{color: PINK, textShadow: `2px 3px 0 #7A5A8A, ${glow}`}} letterStyle={(i) => launch(frame, 0, i, 0.8)} />
      </div>
      <div style={{position: 'absolute', left: 520 + 115, top: 246}}>
        <ArcText text="OTMS" font="400 96px InstrSerif" radius={900} tracking={4} style={{color: CREAM, textShadow: `2px 3px 0 #7A5A8A, ${glow}`}} letterStyle={(i) => launch(frame, 3, i, 0.8)} />
      </div>
      <div style={{position: 'absolute', left: 520, top: 410}}>
        <ArcText
          text="waktu pagi"
          font="700 140px Fredoka"
          radius={620}
          tracking={-2}
          style={{color: '#FFF0F6', WebkitTextStroke: '3px #F2A9C8', textShadow: `5px 6px 0 ${LILAC}, ${glow}`}}
          letterStyle={(i) => launch(frame, 5, i, 1.0)}
        />
      </div>
      <div style={{position: 'absolute', left: 520, top: 598}}>
        <ArcText text="boleh ke?" font="700 88px Pixel" radius={-1400} tracking={6} style={{color: '#FFF4BF', textShadow: '4px 4px 0 #6B5A7A'}} letterStyle={(i) => launch(frame, 15, i, 0.8)} />
      </div>
      <StickerAt x={135} y={330} start={6} rot={-14}><Heart size={96} /></StickerAt>
      <StickerAt x={845} y={330} start={10} rot={12}><Sparkle size={64} color="#fff" /></StickerAt>
      <StickerAt x={150} y={590} start={18} rot={-8}><Bow size={150} /></StickerAt>
      <StickerAt x={850} y={600} start={22} rot={10}><Flower size={110} /></StickerAt>
      {/* lower-left stack (mirrors the reference's "for whimsical social media content" block) */}
      <div style={{position: 'absolute', left: 84, top: 1150, opacity: ramp(frame, 30, 36)}}>
        <div style={{font: '400 76px Sacramento', color: CREAM, textShadow: '2px 3px 0 #6B5A7A', transform: `translateY(${(1 - pop(frame, 30)) * 30}px)`}}>skincare</div>
        <div style={{font: '700 98px Fredoka', color: '#FFF0F6', WebkitTextStroke: '3px #F2A9C8', textShadow: `5px 5px 0 ${LILAC}`, marginTop: -30, transform: `scale(${pop(frame, 36)})`, transformOrigin: 'left center'}}>Q&amp;A</div>
      </div>
      <Twinkles n={14} seed={3} area={[60, 160, 1000, 1300]} />
    </AbsoluteFill>
  );
};

/* ---------- Outro (real room) ---------- */
const OutroTitle: React.FC = () => {
  const frame = useCurrentFrame() - OUTRO;
  const q = (x: number, y: number, s: number, d: number, size = 70) => (
    <div style={{position: 'absolute', left: x, top: y + Math.sin((frame + d) * 0.15) * 8, font: `400 ${size}px Sacramento`, color: CREAM, textShadow: '2px 2px 0 #6B5A7A', opacity: ramp(frame, s, s + 4), transform: `scale(${pop(frame, s)}) rotate(${Math.sin(frame * 0.1 + d) * 8}deg)`}}>?</div>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 500, top: 262}}>
        <ArcText text="pagi? petang? malam?" font="400 76px Sacramento" radius={700} style={{color: CREAM, textShadow: '2px 3px 0 #7A5A8A'}} letterStyle={(i) => launch(frame, 0, i, 0.5)} />
      </div>
      <div style={{position: 'absolute', left: 500, top: 410}}>
        <ArcText text="boleh je pakai" font="700 120px Fredoka" radius={620} style={{color: '#FFF0F6', WebkitTextStroke: '3px #F2A9C8', textShadow: `5px 6px 0 ${LILAC}`}} letterStyle={(i) => launch(frame, 6, i, 0.9)} />
      </div>
      <div style={{position: 'absolute', left: 500, top: 520}}>
        <ArcText text="bila-bila" font="700 96px Pixel" radius={-1600} tracking={5} style={{color: '#FFF4BF', textShadow: '4px 4px 0 #6B5A7A'}} letterStyle={(i) => launch(frame, 20, i, 1.2)} />
      </div>
      {q(120, 250, 10, 0)}
      {q(170, 360, 14, 20, 56)}
      {q(830, 240, 12, 40)}
      {q(860, 380, 16, 60, 56)}
      <StickerAt x={130} y={520} start={18} rot={-12}><Heart size={100} /></StickerAt>
      <StickerAt x={860} y={540} start={22} rot={14}><Bow size={150} /></StickerAt>
      <StickerAt x={500} y={150 + 30} start={4}><Flower size={70} /></StickerAt>
      <Twinkles n={16} seed={9} area={[60, 160, 1000, 1300]} />
    </AbsoluteFill>
  );
};

/* ---------- clean removed-background scene (plain soft gradient, no scenery) ---------- */
const PlainBg: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame * 0.02) * 6;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${172 + shift}deg, #C7B3DD 0%, #E3BFD8 52%, #F4D8CF 100%)`}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 18%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%)'}} />
    </AbsoluteFill>
  );
};

// speaker "keyframe" zoom accents (in & out on emphasis words)
const ACCENTS = [2.28, 7.74, 11.96 + 0.38, 16.5, 21.74];
const speakerTransform = (frame: number) => {
  let s = 0.72;
  ACCENTS.forEach((a) => {
    const d = frame - f(a);
    if (d >= 0 && d < 16) s += 0.045 * Math.sin((d / 16) * Math.PI);
  });
  const drift = Math.sin(frame * 0.03) * 4;
  return `translate(-170px, ${-140 + drift}px) scale(${s})`;
};

/* ---------- section headers ---------- */
type Header = {from: number; to: number; script: string; bold: string; pink?: string; pinkAt?: number};
const HEADERS: Header[] = [
  {from: 2.28, to: 3.06, script: 'jawapan dia:', bold: 'boleh je!', pink: 'tak ada masalah', pinkAt: 2.6},
  {from: 3.06, to: 4.48, script: 'sebab', bold: 'tak ada jadual', pink: 'yang ni kan…', pinkAt: 3.1},
  {from: 4.48, to: 5.74, script: 'waktu #1:', bold: 'pagi', pink: 'boleh', pinkAt: 7.74},
  {from: 5.74, to: 6.82, script: 'waktu #2:', bold: 'tengah hari', pink: 'boleh', pinkAt: 7.74},
  {from: 6.82, to: 8.64, script: 'waktu #3:', bold: 'malam', pink: 'semua boleh! tak ada masalah', pinkAt: 7.74},
  {from: 8.64, to: 12.74, script: 'contoh #1:', bold: 'shift malam', pink: 'pagi bangun → pakai OTMS', pinkAt: 10.46},
  {from: 12.74, to: 17.6, script: 'contoh #2:', bold: 'kerja pagi', pink: 'balik petang → malam pakai OTMS', pinkAt: 14.38},
  {from: 17.6, to: 22.14, script: 'pro tip:', bold: 'tak buat muka sensitif', pink: 'kepada matahari', pinkAt: 20.08},
];

const HeaderBlock: React.FC<{h: Header}> = ({h}) => {
  const frame = useCurrentFrame();
  const st = f(h.from);
  const out = ramp(frame, f(h.to) - 3, f(h.to), 1, 0);
  const letters = (txt: string, start: number, font: string, style: React.CSSProperties, step = 0.9) => (
    <div style={{display: 'flex', justifyContent: 'center', whiteSpace: 'pre'}}>
      {[...txt].map((c, i) => {
        const p = pop(frame, start + i * step, 9);
        return (
          <span key={i} style={{font, ...style, display: 'inline-block', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) scale(${0.4 + 0.6 * p}) rotate(${Math.sin((frame + i * 9) * 0.3) * 1.2}deg)`}}>
            {c}
          </span>
        );
      })}
    </div>
  );
  const boldSize = h.bold.length > 16 ? 76 : h.bold.length > 11 ? 92 : 110;
  return (
    <div style={{position: 'absolute', left: 80, width: 830, top: 186, textAlign: 'center', opacity: out}}>
      {letters(h.script, st, '400 86px Sacramento', {color: '#FFFFFF', WebkitTextStroke: '1.5px #7C5C9E', textShadow: '2px 3px 0 #7C5C9E, 0 0 6px rgba(70,50,95,0.7)'}, 0.6)}
      <div style={{marginTop: -18}}>
        {letters(h.bold, st + 4, `700 ${boldSize}px Fredoka`, {color: '#FFFFFF', WebkitTextStroke: '2px #EFB2CC', textShadow: `4px 5px 0 ${LILAC}, 0 0 16px rgba(255,200,225,0.6)`}, 0.8)}
      </div>
      {h.pink && frame >= f(h.pinkAt ?? h.from) && (
        <div style={{marginTop: -4}}>
          {letters(h.pink, f(h.pinkAt ?? h.from), '600 54px Fredoka', {color: '#F27FAE', WebkitTextStroke: '2px #FFF', textShadow: '2px 3px 0 #7C5C9E, 0 0 6px rgba(70,50,95,0.5)'}, 0.45)}
        </div>
      )}
    </div>
  );
};

/* ---------- content cards (the reference's "screenshot cards") ---------- */
const CARD = {x: 560, y: 610, w: 360};
const cardIn = (frame: number, start: number, end: number, mode: 'slide' | 'click') => {
  const p = pop(frame, start, 11);
  const o = ramp(frame, end - 4, end, 1, 0);
  if (mode === 'slide') return {opacity: o * Math.min(1, p * 2), transform: `translateX(${(1 - p) * 420}px) rotate(${(1 - p) * 8}deg)`};
  return {opacity: o * Math.min(1, p * 2), transform: `scale(${0.55 + 0.45 * p})`, clipPath: `circle(${p * 110}% at 50% 50%)`};
};

const UiRow: React.FC<{icon: React.ReactNode; label: string; on: boolean; frame: number; at: number}> = ({icon, label, on, frame, at}) => {
  const p = pop(frame, at, 8);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', margin: '8px 0', borderRadius: 14, background: on ? '#2C2C30' : '#232326', opacity: 0.35 + 0.65 * Math.min(1, p), transform: `scale(${0.9 + 0.1 * Math.min(1, p)})`}}>
      <div style={{width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
      <div style={{font: '600 30px Fredoka', color: '#F4F4F6', flex: 1}}>{label}</div>
      <div style={{width: 58, height: 32, borderRadius: 16, background: on && p > 0.5 ? '#46C37B' : '#4A4A50', position: 'relative'}}>
        <div style={{position: 'absolute', top: 3, left: on && p > 0.5 ? 29 : 3, width: 26, height: 26, borderRadius: 13, background: '#fff'}} />
      </div>
    </div>
  );
};

const DarkCard: React.FC<{title: string; children: React.ReactNode; style: React.CSSProperties}> = ({title, children, style}) => (
  <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, padding: 18, borderRadius: 26, background: '#18181B', border: '5px solid #fff', boxShadow: '0 18px 40px rgba(70,40,80,0.3)', ...style}}>
    <div style={{display: 'flex', gap: 8, marginBottom: 6}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />)}
    </div>
    <div style={{font: '600 28px Fredoka', color: '#9A9AA2', marginBottom: 4}}>{title}</div>
    {children}
  </div>
);

const Cards: React.FC = () => {
  const frame = useCurrentFrame();
  const red = '#E8322B';
  const show = (a: number, b: number) => frame >= f(a) && frame < f(b);
  return (
    <AbsoluteFill>
      {/* A — product card */}
      {show(2.28, 3.06) && (
        <div style={{position: 'absolute', left: CARD.x, top: CARD.y + 20, width: CARD.w, height: 330, borderRadius: 26, background: 'linear-gradient(160deg,#FFF9EE,#FCE9C8)', border: '6px solid #fff', boxShadow: '0 18px 40px rgba(70,40,80,0.3)', ...cardIn(frame, f(2.3), f(3.06), 'slide')}}>
          <Img src={staticFile('otms/otms_jar.png')} style={{position: 'absolute', left: 30, top: 70, width: 290}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 18, textAlign: 'center', font: '600 30px Fredoka', color: '#8A6A3A'}}>Yello OTMS</div>
          <div style={{position: 'absolute', left: 4, top: 46}}>
            <MarkerCircle w={350} h={240} progress={ramp(frame, f(2.4), f(2.75))} color={red} />
          </div>
        </div>
      )}
      {/* B — "no schedule" card */}
      {show(3.06, 4.48) && (
        <DarkCard title="jadual pemakaian" style={cardIn(frame, f(3.06), f(4.48), 'click')}>
          <UiRow icon={<Sun size={44} />} label="pagi" on frame={frame} at={f(3.2)} />
          <UiRow icon={<Sun size={44} color="#FFDF6B" />} label="tengah hari" on frame={frame} at={f(3.35)} />
          <UiRow icon={<Moon size={40} />} label="malam" on frame={frame} at={f(3.5)} />
          <div style={{position: 'absolute', left: -14, top: 72}}>
            <MarkerCircle w={392} h={250} progress={ramp(frame, f(3.9), f(4.3))} color={red} />
          </div>
          <div style={{position: 'absolute', right: -6, top: 4, font: '700 34px Fredoka', color: red, transform: `rotate(8deg) scale(${pop(frame, f(4.0))})`}}>bila-bila!</div>
        </DarkCard>
      )}
      {/* C — pagi / tengah hari / malam tiles */}
      {show(4.48, 8.64) && (
        <div style={{position: 'absolute', left: CARD.x, top: CARD.y - 20, width: CARD.w, ...cardIn(frame, f(4.5), f(8.64), 'slide')}}>
          {[
            {at: 5.14, label: 'pagi', bg: 'linear-gradient(180deg,#FFD9A8,#FFF1D6)', icon: <SunsetIcon size={96} />, c: '#8A5A2A'},
            {at: 5.74, label: 'tengah hari', bg: 'linear-gradient(180deg,#9FD3FF,#E3F3FF)', icon: <Sun size={92} />, c: '#245B8A'},
            {at: 6.82, label: 'malam', bg: 'linear-gradient(180deg,#253A6B,#3D5A96)', icon: <Moon size={84} />, c: '#F6E7A8'},
          ].map((t, i) => {
            const p = pop(frame, f(t.at) - 2, 9);
            const ok = ramp(frame, f(7.74) + i * 3, f(7.74) + i * 3 + 8);
            return (
              <div key={i} style={{position: 'relative', height: 150, marginBottom: 14, borderRadius: 22, background: t.bg, border: '5px solid #fff', boxShadow: '0 10px 24px rgba(70,40,80,0.28)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 18, opacity: Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})`}}>
                {t.icon}
                <div style={{font: '700 44px Fredoka', color: t.c}}>{t.label}</div>
                <div style={{position: 'absolute', right: 14, top: 26}}>
                  <Check size={86} color={red} progress={ok} stroke={13} />
                </div>
              </div>
            );
          })}
          {/* arrow follows the time she is naming */}
          {frame < f(7.74) && (
            <div style={{position: 'absolute', left: -120, top: frame < f(5.74) ? 10 : frame < f(6.82) ? 174 : 338, transform: 'scaleX(-1) rotate(-20deg)'}}>
              <MarkerArrow size={110} progress={ramp(frame % 1000, f(5.14), f(5.14) + 8)} />
            </div>
          )}
        </div>
      )}
      {/* D — night-shift routine */}
      {show(8.64, 12.74) && (
        <DarkCard title="contoh: shift malam" style={cardIn(frame, f(8.66), f(12.74), 'click')}>
          <UiRow icon={<Moon size={40} />} label="kerja shift malam" on frame={frame} at={f(9.7)} />
          <UiRow icon={<SunsetIcon size={48} />} label="pagi: bangun" on frame={frame} at={f(10.5)} />
          <UiRow icon={<Img src={staticFile('otms/otms_jar.png')} style={{width: 50}} />} label="pakai OTMS" on frame={frame} at={f(11.96)} />
          <div style={{position: 'absolute', left: -6, top: 252}}>
            <MarkerCircle w={380} h={110} progress={ramp(frame, f(12.0), f(12.4))} color={red} />
          </div>
          <div style={{position: 'absolute', right: 0, top: 360, font: '700 40px Fredoka', color: red, transform: `rotate(-6deg) scale(${pop(frame, f(12.34))})`}}>boleh ✓</div>
        </DarkCard>
      )}
      {/* E — 9-to-evening routine */}
      {show(12.74, 17.6) && (
        <DarkCard title="contoh: kerja pagi" style={cardIn(frame, f(12.76), f(17.6), 'slide')}>
          <UiRow icon={<Sun size={44} />} label="kerja pagi" on frame={frame} at={f(13.46)} />
          <UiRow icon={<SunsetIcon size={48} />} label="balik petang" on frame={frame} at={f(14.38)} />
          <UiRow icon={<Moon size={40} />} label="malam: pakai OTMS" on frame={frame} at={f(15.3)} />
          <div style={{position: 'absolute', left: -6, top: 252}}>
            <MarkerCircle w={380} h={110} progress={ramp(frame, f(16.1), f(16.5))} color={red} />
          </div>
          <div style={{position: 'absolute', right: 0, top: 360, font: '700 40px Fredoka', color: red, transform: `rotate(-6deg) scale(${pop(frame, f(16.5))})`}}>boleh ✓</div>
        </DarkCard>
      )}
      {/* F — sun sensitivity */}
      {show(17.6, 22.14) && (
        <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: 400, borderRadius: 26, background: 'linear-gradient(180deg,#BFE3FF,#FFF4D8)', border: '6px solid #fff', boxShadow: '0 18px 40px rgba(70,40,80,0.3)', overflow: 'visible', ...cardIn(frame, f(17.62), f(22.14), 'click')}}>
          <div style={{position: 'absolute', left: 110, top: 40, transform: `rotate(${frame * 0.6}deg)`}}>
            <Sun size={140} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', font: '700 34px Fredoka', color: '#4A3A5A', lineHeight: 1.1}}>
            muka jadi sensitif
            <br />
            kepada matahari?
          </div>
          <div style={{position: 'absolute', left: 30, top: 196, opacity: frame >= f(21.74) ? 1 : 0}}>
            <MarkerCircle w={300} h={110} progress={ramp(frame, f(21.74), f(22.0))} color={red} />
          </div>
          <div style={{position: 'absolute', right: -30, top: 318, font: '700 54px Fredoka', color: red, WebkitTextStroke: '2px #fff', transform: `rotate(-8deg) scale(${pop(frame, f(21.8))})`}}>tak ada!</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- captions: thin lowercase italic, two short lines ---------- */
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const p = PHRASES.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!p) return null;
  const o = ramp(frame, f(p.s - 0.04), f(p.s - 0.04) + 3);
  return (
    <div style={{position: 'absolute', left: 245, width: 500, top: 1392, textAlign: 'center', font: 'italic 500 40px PoppinsMI', lineHeight: 1.12, color: '#FFF8E3', textShadow: '0 0 2px rgba(60,45,35,0.95), 0 0 4px rgba(60,45,35,0.8), 0 2px 8px rgba(60,45,35,0.6)', opacity: o}}>
      {p.text.toLowerCase().replace(/[.]/g, '')}
    </div>
  );
};

const SFX: Sfx[] = [
  [0.03, 'sparkle', 0.22],
  [0.2, 'pop', 0.12],
  [0.45, 'pop', 0.12],
  [0.9, 'pop', 0.12],
  [1.0, 'sparkle', 0.14],
  [1.2, 'pop', 0.1],
  [2.24, 'whoosh', 0.2],
  [2.28, 'sparkle', 0.24],
  [2.34, 'swipe', 0.14],
  [2.42, 'marker', 0.18],
  [3.06, 'click', 0.22],
  [3.9, 'marker', 0.16],
  [4.48, 'swipe', 0.14],
  [5.12, 'pop', 0.15],
  [5.72, 'pop', 0.15],
  [6.8, 'pop', 0.15],
  [7.74, 'ding', 0.18],
  [7.84, 'sparkle', 0.12],
  [8.62, 'click', 0.2],
  [9.7, 'pop', 0.12],
  [10.5, 'pop', 0.12],
  [11.96, 'pop', 0.13],
  [12.0, 'marker', 0.16],
  [12.74, 'swipe', 0.14],
  [13.46, 'pop', 0.12],
  [14.38, 'pop', 0.12],
  [15.3, 'pop', 0.12],
  [16.1, 'marker', 0.16],
  [17.58, 'click', 0.2],
  [21.74, 'marker', 0.18],
  [21.8, 'pop', 0.14],
  [22.1, 'whoosh', 0.18],
  [22.14, 'sparkle', 0.24],
  [22.5, 'pop', 0.12],
  [22.9, 'pop', 0.12],
  [23.3, 'sparkle', 0.14],
];

export const V1ReferenceA: React.FC = () => {
  const frame = useCurrentFrame();
  const inScene = frame >= INTRO_END && frame < OUTRO;
  const introPush = interpolate(frame, [0, INTRO_END], [1.0, 1.06], clamp);
  const outroPush = interpolate(frame, [OUTRO, DUR], [1.04, 1.0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {!inScene && (
        <AbsoluteFill style={{transform: `scale(${frame < INTRO_END ? introPush : outroPush})`, transformOrigin: '50% 42%'}}>
          <Footage />
          {/* soft warm haze over the room, like the reference's dim intro */}
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(60,40,50,0.38) 0%, rgba(60,40,50,0.12) 30%, rgba(0,0,0,0) 45%)'}} />
        </AbsoluteFill>
      )}
      {inScene && (
        <>
          <PlainBg />
          <Twinkles n={22} seed={5} />
          <AbsoluteFill style={{transform: speakerTransform(frame), transformOrigin: '540px 1920px', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, #000 14%)'}}>
            <SpeakerCut style={{filter: 'drop-shadow(0 0 18px rgba(255,250,225,0.35))'}} />
          </AbsoluteFill>
          {HEADERS.filter((h) => frame >= f(h.from) && frame < f(h.to)).map((h) => (
            <HeaderBlock key={h.from} h={h} />
          ))}
          <Cards />
        </>
      )}
      {frame < INTRO_END && <IntroTitle />}
      {frame >= OUTRO && <OutroTitle />}
      <Captions />
      {/* light flash on the two hard cuts */}
      <AbsoluteFill style={{background: '#FFFDF2', opacity: frame >= OUTRO ? ramp(frame, OUTRO, OUTRO + 6, 0.7, 0) : frame >= INTRO_END ? ramp(frame, INTRO_END, INTRO_END + 6, 0.7, 0) : 0}} />
      <AudioMix music="music1.wav" base={0.15} under={0.065} sfx={SFX} />
    </AbsoluteFill>
  );
};
