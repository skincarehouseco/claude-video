import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {AudioMix, BRoll, f, Footage, pop, ramp, Sfx, WORDS} from './common';
import {Sun} from './stickers';

/*
 VIDEO 02 — Reference B editing language (minimal "talking + one big keyword"):
 - real room kept, no background replacement
 - hard jump-cut reframes (punch-in / punch-out) at phrase boundaries — no footage removed
 - ONE large tight-tracked sans keyword above the head, occasionally mixed with a thin upright serif,
   a typewriter reveal with cursor, a coloured word, or a small sticker next to it
 - tiny single-word subtitle on the chest
 - one shrink-to-frame moment with black border, one blurred-background UI moment
*/

const SANS = 'InterX';
const SERIF = 'InstrSerif'; // upright serif (no italics/cursive — clearer)
const RED = '#D7263D';
const BEIGE = '#EFCB86';

type Part = {t: string; serif?: boolean; color?: string};
type Key = {s: number; e: number; lines: Part[][]; type?: boolean; sticker?: 'jar' | 'sun'};
const KEYS: Key[] = [
  {s: 0.34, e: 2.24, type: true, lines: [[{t: 'pakai OTMS'}], [{t: 'waktu pagi?', serif: true}]]},
  {s: 2.28, e: 2.6, lines: [[{t: 'boleh', color: BEIGE}]]},
  {s: 2.6, e: 3.06, lines: [[{t: 'tak ada'}], [{t: 'masalah'}]]},
  {s: 3.62, e: 3.9, lines: [[{t: 'tak ada'}]]},
  {s: 3.9, e: 4.48, lines: [[{t: 'tak ada'}], [{t: 'jadual', serif: true}]]},
  {s: 5.14, e: 5.74, lines: [[{t: 'pagi'}]]},
  {s: 5.74, e: 6.82, lines: [[{t: 'tengah hari'}]]},
  {s: 6.82, e: 7.74, lines: [[{t: 'malam'}]]},
  {s: 7.74, e: 8.02, lines: [[{t: 'boleh', color: RED}]]},
  {s: 8.02, e: 8.64, lines: [[{t: 'tak ada'}], [{t: 'masalah'}]]},
  {s: 9.2, e: 10.46, lines: [[{t: 'shift malam'}]]},
  {s: 10.46, e: 11.12, lines: [[{t: 'pagi'}]]},
  {s: 11.12, e: 11.96, lines: [[{t: 'bangun'}]]},
  {s: 11.96, e: 12.74, lines: [[{t: 'OTMS'}]], sticker: 'jar'},
  {s: 13.46, e: 14.38, lines: [[{t: 'kerja pagi'}]]},
  {s: 14.38, e: 15.26, lines: [[{t: 'balik'}, {t: ' petang', serif: true}]]},
  {s: 15.26, e: 16.12, lines: [[{t: 'malam'}]]},
  {s: 16.12, e: 16.9, lines: [[{t: 'pakai OTMS'}]], sticker: 'jar'},
  {s: 16.9, e: 17.6, lines: [[{t: 'tak ada'}], [{t: 'masalah'}]]},
  {s: 20.08, e: 20.84, lines: [[{t: 'sensitif'}]]},
  {s: 20.84, e: 21.74, lines: [[{t: 'matahari'}]], sticker: 'sun'},
  {s: 21.74, e: 22.14, lines: [[{t: 'tak ada.', color: RED}]]},
  {s: 22.14, e: 24.3, type: true, lines: [[{t: 'boleh je pakai'}], [{t: 'bila-bila', serif: true}]]},
];

// hard jump-cut reframes [start s, scale]; origin on the face
const SHOTS: [number, number][] = [
  [0, 1.0], [2.28, 1.16], [3.06, 1.0], [4.48, 1.1], [5.74, 1.0], [6.82, 1.12], [8.02, 1.22], [8.64, 1.0],
  [10.46, 1.12], [12.74, 1.0], [14.38, 1.1], [15.26, 1.0], [16.9, 1.2], [17.6, 1.0], [20.08, 1.12], [21.74, 1.24], [22.14, 1.0],
];

const shotScale = (t: number) => {
  let s = 1;
  for (const [st, sc] of SHOTS) if (t >= st) s = sc;
  return s;
};

const SHRINK: [number, number] = [9.2, 10.46]; // inset with black border
const BLUR: [number, number] = [18.3, 20.08]; // blurred bg + UI moment

const lineSize = (parts: Part[]) => {
  const len = parts.reduce((a, p) => a + p.t.length * (p.serif ? 0.85 : 1), 0);
  return Math.min(168, Math.floor(840 / (len * 0.56)));
};

const Keyword: React.FC<{k: Key}> = ({k}) => {
  const frame = useCurrentFrame();
  const st = f(k.s);
  const appear = ramp(frame, st, st + 2);
  const sc = 0.97 + 0.03 * ramp(frame, st, st + 4);
  // typewriter: reveal characters across the spoken span of each line
  const totalChars = k.lines.reduce((a, l) => a + l.reduce((b, p) => b + p.t.length, 0), 0);
  const typeEnd = k.type ? Math.min(f(k.e) - 6, st + totalChars * 2.2) : st;
  const shown = k.type ? Math.floor(ramp(frame, st, typeEnd, 0, totalChars + 0.01)) : 99999;
  let used = 0;
  const cursorOn = k.type && Math.floor(frame / 8) % 2 === 0;
  let cursorPlaced = false;
  return (
    <div style={{position: 'absolute', left: 60, width: 920, top: 250, textAlign: 'center', opacity: appear, transform: `scale(${sc})`, transformOrigin: '50% 40%'}}>
      {k.lines.map((parts, li) => {
        const size = lineSize(k.lines.length > 1 ? parts : parts);
        const lineChars = parts.reduce((a, p) => a + p.t.length, 0);
        const lineStart = used;
        used += lineChars;
        if (k.type && shown <= lineStart && li > 0) return null;
        const showCursorHere = k.type && !cursorPlaced && (shown < lineStart + lineChars || li === k.lines.length - 1);
        if (showCursorHere) cursorPlaced = true;
        let local = shown - lineStart;
        return (
          <div key={li} style={{lineHeight: 0.92, whiteSpace: 'pre', marginTop: li ? -6 : 0}}>
            {parts.map((p, pi) => {
              const txt = k.type ? p.t.slice(0, Math.max(0, local)) : p.t;
              local -= p.t.length;
              return (
                <span
                  key={pi}
                  style={{
                    font: p.serif ? `400 ${Math.round(size * 1.1)}px ${SERIF}` : `800 ${size}px ${SANS}`,
                    letterSpacing: p.serif ? '-0.01em' : '-0.065em',
                    color: p.color ?? '#FFFFFF',
                    textShadow: '0 3px 14px rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.25)',
                  }}
                >
                  {txt}
                </span>
              );
            })}
            {showCursorHere && <span style={{display: 'inline-block', width: 6, height: size * 0.8, marginLeft: 6, background: '#fff', opacity: cursorOn ? 1 : 0, verticalAlign: '-0.08em'}} />}
          </div>
        );
      })}
      {k.sticker === 'jar' && (
        <Img src={staticFile('otms/otms_jar.png')} style={{position: 'absolute', right: 90, top: 150, width: 220, transform: `rotate(8deg) scale(${pop(frame, st, 8)})`, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.3))'}} />
      )}
      {k.sticker === 'sun' && (
        <div style={{position: 'absolute', right: 40, top: -50, transform: `scale(${pop(frame, st, 8)}) rotate(${frame * 1.5}deg)`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))'}}>
          <Sun size={150} />
        </div>
      )}
    </div>
  );
};

const MiniSub: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const w = WORDS.find((x, i) => t >= x.s - 0.02 && t < (WORDS[i + 1]?.s ?? x.e + 0.4) && t < x.e + 0.5);
  if (!w) return null;
  return (
    <div style={{position: 'absolute', left: 80, width: 830, top: 1420, textAlign: 'center', font: `600 36px InterS`, color: '#fff', letterSpacing: '-0.01em', textShadow: '0 1px 6px rgba(0,0,0,0.55)'}}>
      {w.w.toLowerCase().replace(/[?]/g, '')}
    </div>
  );
};

const SearchUI: React.FC = () => {
  const frame = useCurrentFrame();
  const st = f(BLUR[0]);
  const items = ['OTMS boleh pakai waktu pagi?', 'muka sensitif kepada matahari?'];
  return (
    <div style={{position: 'absolute', left: 120, width: 780, top: 700}}>
      {items.map((txt, i) => {
        const p = pop(frame, st + i * 10, 8);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, margin: '18px 0', padding: '22px 26px', borderRadius: 22, background: 'rgba(28,28,30,0.92)', color: '#fff', font: '600 36px InterS', transform: `scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2), boxShadow: '0 12px 30px rgba(0,0,0,0.3)'}}>
            <svg width="38" height="38" viewBox="0 0 40 40">
              <circle cx="17" cy="17" r="11" fill="none" stroke="#bbb" strokeWidth="4" />
              <line x1="25" y1="25" x2="35" y2="35" stroke="#bbb" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span style={{flex: 1}}>{txt}</span>
            <div style={{width: 64, height: 40, borderRadius: 12, background: '#25C2E0', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 30px InterX'}}>+</div>
          </div>
        );
      })}
    </div>
  );
};

const SFX: Sfx[] = [
  ...Array.from({length: 7}).map((_, i) => [0.36 + i * 0.09, 'type', 0.1] as Sfx),
  ...Array.from({length: 7}).map((_, i) => [1.18 + i * 0.09, 'type', 0.1] as Sfx),
  [2.28, 'pop', 0.14],
  [3.9, 'click', 0.14],
  [5.14, 'pop', 0.1],
  [5.74, 'pop', 0.1],
  [6.82, 'pop', 0.1],
  [7.74, 'impact', 0.12],
  [9.18, 'swipe', 0.14],
  [10.46, 'whoosh', 0.08],
  [11.96, 'pop', 0.16],
  [16.12, 'pop', 0.16],
  [18.3, 'click', 0.2],
  [18.64, 'click', 0.18],
  [20.84, 'pop', 0.14],
  [21.74, 'impact', 0.12],
  ...Array.from({length: 8}).map((_, i) => [22.16 + i * 0.09, 'type', 0.1] as Sfx),
  ...Array.from({length: 6}).map((_, i) => [23.1 + i * 0.09, 'type', 0.1] as Sfx),
];

export const V2ReferenceB: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const s = (t >= 3.06 && t < 4.48) || (t >= 8.64 && t < 9.2) ? 1 : shotScale(t);
  const shrink = t >= SHRINK[0] && t < SHRINK[1];
  const blur = t >= BLUR[0] && t < BLUR[1];
  const key = KEYS.find((k) => t >= k.s && t < k.e);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: shrink ? 'scale(0.86)' : `scale(${s})`, transformOrigin: shrink ? '50% 50%' : '540px 880px', filter: blur ? 'blur(22px) brightness(0.92)' : undefined, overflow: 'hidden'}}>
        {/* supplied shots as hard-cut cut-aways (voice continues): bowl macro on "yang ni…jadual", face close-up on "shift malam" */}
        {t >= 3.06 && t < 4.48 ? <BRoll clip="bowl" from={3.06} start={0.2} /> : t >= 8.64 && t < 10.46 ? <BRoll clip="face" from={8.64} start={3.4} /> : <Footage />}
      </AbsoluteFill>
      {blur && <SearchUI />}
      {key && !blur && <Keyword k={key} />}
      <MiniSub />
      <AudioMix music="music2.wav" base={0.15} under={0.07} sfx={SFX} />
    </AbsoluteFill>
  );
};
