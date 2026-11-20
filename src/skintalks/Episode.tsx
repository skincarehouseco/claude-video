import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {AcneTimeline, PoreSteps, TipCard} from './Infographics';
import {energyAt, Line, Shot, ShotView} from './Shots';
import {c01, FPS, HOSTS, HostId, P, ROUND, SAFE, SAFE_CX, SANS, SANS_MED, sec, SERIF} from './theme';

/* Skin Talks by Skincarehouse — episode composition. Everything comes from the episode JSON produced by
   series/skintalks/tools/build_episode.py, so a new episode only needs a new script + voices. */

type W = {t: string; s: number; e: number};
type EpLine = Line & {words: W[]};
type Cue = {id: string; kind: string; start: number; end: number; title?: string; items?: string[]; label?: string};
export type EpisodeData = {episode: number; title: string; duration: number; durationInFrames: number; intro: number; lines: EpLine[]; shots: Shot[]; infographics: Cue[]};

const pop = (f: number, at: number, d = 12) => (f < sec(at) ? 0 : spring({frame: f - sec(at), fps: FPS, config: {damping: d, stiffness: 200, mass: 0.6}}));
const KEYWORDS = /^(jerawat|overnight|90|hari\??|terbentuk|kulit|minyak|sel|mati|bakteria|meradang|ais|bengkak|doktor|sakit|tersumbat)/i;

/* ---------------- captions: word-synced, max 2 lines, keyword highlight ---------------- */
const chunk = (words: W[]) => {
  const out: W[][] = [];
  let cur: W[] = [];
  for (const w of words) {
    const len = [...cur, w].map((x) => x.t).join(' ').length;
    if (cur.length && (len > 30 || /[.?!,]$/.test(cur[cur.length - 1].t))) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
};

const Captions: React.FC<{lines: EpLine[]}> = ({lines}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const chunks = lines.flatMap((L) => chunk(L.words).map((c, i, arr) => ({words: c, speaker: L.speaker, start: c[0].s, end: Math.min(c[c.length - 1].e + 0.35, arr[i + 1]?.[0].s ?? L.end + 0.2)})));
  const cur = chunks.find((c) => t >= c.start && t < c.end);
  if (!cur) return null;
  const inK = spring({frame: f - sec(cur.start), fps: FPS, config: {damping: 18, stiffness: 200, mass: 0.6}});
  const tint = HOSTS[cur.speaker].tint;
  return (
    <div style={{position: 'absolute', top: 1280, left: SAFE_CX - 420, width: 840, display: 'flex', justifyContent: 'center', opacity: Math.min(1, inK * 1.5), transform: `translateY(${(1 - inK) * 14}px)`}}>
      <div style={{background: 'rgba(255,251,244,0.9)', borderRadius: 32, padding: '12px 30px 16px', boxShadow: `0 10px 26px rgba(90,64,44,0.16), inset 0 0 0 3px ${tint}66`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, maxWidth: 820}}>
        {cur.words.map((w, i) => {
          if (t < w.s) return null; // never before it is spoken
          const k = spring({frame: f - sec(w.s), fps: FPS, config: {damping: 14, stiffness: 240, mass: 0.5}});
          const key = KEYWORDS.test(w.t);
          const hk = Easing.out(Easing.cubic)(c01((f - sec(w.s) - 2) / 8));
          return (
            <span key={i} style={{position: 'relative', zIndex: 0, display: 'inline-block', fontFamily: ROUND, fontWeight: 600, fontSize: 56, lineHeight: 1.22, color: P.cocoa, transform: `translateY(${(1 - k) * 10}px) scale(${0.88 + 0.12 * k})`, opacity: Math.min(1, k * 1.6)}}>
              {key && <span style={{position: 'absolute', left: -6, right: -6, top: '42%', bottom: '6%', background: cur.speaker === 'maya' ? P.blush : P.butter, borderRadius: 10, transform: `scaleX(${hk})`, transformOrigin: '0 50%', zIndex: -1, opacity: 0.85}} />}
              {w.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- speaker tag with live voice bars ---------------- */
const SpeakerTag: React.FC<{lines: EpLine[]; hideDuring: {start: number; end: number}[]}> = ({lines, hideDuring}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const L = lines.find((l) => t >= l.start - 0.1 && t < l.end + 0.1);
  if (!L || hideDuring.some((c) => t >= c.start - 0.1 && t < c.end + 0.25)) return null;
  const h = HOSTS[L.speaker];
  const k = pop(f, L.start - 0.1, 14);
  const e = energyAt(lines, L.speaker, f);
  return (
    <div style={{position: 'absolute', top: 1190, left: SAFE.left + 8, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,251,244,0.92)', borderRadius: 26, padding: '8px 18px 10px', boxShadow: '0 8px 18px rgba(90,64,44,0.15)', opacity: k, transform: `translateY(${(1 - k) * 10}px)`}}>
      <span style={{width: 14, height: 14, borderRadius: 7, background: h.tint, boxShadow: `0 0 0 ${2 + e * 6}px ${h.tint}55`}} />
      <span style={{fontFamily: SANS, fontSize: 30, color: P.cocoa}}>{h.name}</span>
      <span style={{fontFamily: SANS_MED, fontSize: 20, color: P.cocoa, opacity: 0.6, letterSpacing: 2}}>{h.role.toUpperCase()}</span>
      <svg width={70} height={30}>
        {[0, 1, 2, 3, 4].map((i) => {
          const v = energyAt(lines, L.speaker, f - i * 2);
          const hh = 6 + v * 22 * (0.6 + 0.4 * Math.sin(i * 1.7 + f / 3));
          return <rect key={i} x={i * 14} y={15 - hh / 2} width={8} height={hh} rx={4} fill={h.tint} />;
        })}
      </svg>
    </div>
  );
};

/* ---------------- whimsical doodles tied to the dialogue ---------------- */
const STAR = 'M0 -20 C3 -6 6 -3 20 0 C6 3 3 6 0 20 C-3 6 -6 3 -20 0 C-6 -3 -3 -6 0 -20Z';
const Doodles: React.FC<{lines: EpLine[]}> = ({lines}) => {
  const f = useCurrentFrame();
  const at = (id: string, word?: string) => {
    const L = lines.find((l) => l.id === id);
    if (!L) return 1e9;
    if (!word) return L.start;
    return L.words.find((w) => w.t.toLowerCase().startsWith(word))?.s ?? L.start;
  };
  const show = (a: number, b: number) => f >= sec(a) && f <= sec(b);
  const m1 = at('m1', 'overnight');
  const m1end = lines.find((l) => l.id === 'm1')?.end ?? 0;
  const m3 = at('m3');
  const m5 = at('m5');
  const m3end = lines.find((l) => l.id === 'm3')?.end ?? 0;
  const m5end = lines.find((l) => l.id === 'm5')?.end ?? 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "overnight": little moon + stars */}
      {show(m1, Math.min(m1 + 1.6, m1end + 0.15)) && (
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <g transform={`translate(760 360) scale(${pop(f, m1, 9)}) rotate(${Math.sin(f / 10) * 8})`}>
            <path d="M20 -40 A44 44 0 1 0 40 30 A36 36 0 1 1 20 -40Z" fill={P.butter} stroke={P.cocoa} strokeWidth={3.5} />
          </g>
          <path d={STAR} transform={`translate(860 300) scale(${pop(f, m1 + 0.1, 9) * 0.9})`} fill={P.warmWhite} stroke={P.cocoa} strokeWidth={2.5} />
          <path d={STAR} transform={`translate(680 280) scale(${pop(f, m1 + 0.2, 9) * 0.6})`} fill={P.blush} stroke={P.cocoa} strokeWidth={3} />
        </svg>
      )}
      {/* "90 hari?" surprise bubble */}
      {show(m3, m3end + 0.2) && (
        <div style={{position: 'absolute', left: 600, top: 330, transform: `scale(${pop(f, m3, 8)}) rotate(${-6 + Math.sin(f / 7) * 3}deg)`}}>
          <div style={{background: P.warmWhite, borderRadius: '50% 50% 50% 12px', width: 220, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 26px rgba(90,64,44,0.22)', border: `4px solid ${P.blush}`}}>
            <span style={{fontFamily: ROUND, fontWeight: 600, fontSize: 92, color: P.blushDeep}}>90</span>
            <span style={{fontFamily: ROUND, fontWeight: 600, fontSize: 70, color: P.cocoa, marginLeft: 4}}>?!</span>
          </div>
        </div>
      )}
      {/* "Senangnya!": sparkles + heart */}
      {show(m5, m5end + 0.2) && (
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d="M0 22 C-20 8 -32 -4 -28 -16 C-24 -30 -8 -30 0 -17 C8 -30 24 -30 28 -16 C32 -4 20 8 0 22Z" transform={`translate(800 420) scale(${pop(f, m5, 8) * 1.8}) rotate(${Math.sin(f / 8) * 10})`} fill={P.blush} stroke={P.cocoa} strokeWidth={2} />
          {[
            [700, 330, 1.0],
            [900, 520, 0.8],
            [640, 520, 0.6],
          ].map(([x, y, s], i) => (
            <path key={i} d={STAR} transform={`translate(${x} ${y}) scale(${pop(f, m5 + 0.1 * (i + 1), 9) * s})`} fill={i % 2 ? P.butter : P.warmWhite} stroke={P.cocoa} strokeWidth={2.5} />
          ))}
        </svg>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- intro + outro titles ---------------- */
const Titles: React.FC<{ep: EpisodeData}> = ({ep}) => {
  const f = useCurrentFrame();
  const firstLineEnd = ep.lines[0].end;
  const k = pop(f, 0.05, 14);
  const out = 1 - c01((f - sec(firstLineEnd - 0.3)) / 8);
  const endAt = ep.duration - 1.5;
  const ek = pop(f, endAt, 14);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {f < sec(firstLineEnd) && (
        <div style={{position: 'absolute', top: SAFE.top + 10, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center', opacity: k * out, transform: `translateY(${(1 - k) * -16}px)`}}>
          <div style={{display: 'inline-block', background: 'rgba(255,251,244,0.92)', borderRadius: 34, padding: '14px 30px 18px', boxShadow: '0 12px 30px rgba(90,64,44,0.18)'}}>
            <div style={{fontFamily: SANS_MED, fontSize: 24, letterSpacing: 5, color: P.cocoa, opacity: 0.65}}>SKIN TALKS · EP {ep.episode}</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color: P.cocoa, lineHeight: 1.1, marginTop: 4}}>{ep.title}</div>
          </div>
        </div>
      )}
      {f >= sec(endAt) && (
        <div style={{position: 'absolute', top: SAFE.top + 10, left: SAFE.left, width: SAFE.right - SAFE.left, textAlign: 'center', opacity: ek, transform: `scale(${0.9 + 0.1 * ek})`}}>
          <div style={{display: 'inline-block', background: 'rgba(255,251,244,0.94)', borderRadius: 34, padding: '16px 34px 20px', boxShadow: '0 12px 30px rgba(90,64,44,0.18)'}}>
            <div style={{fontFamily: ROUND, fontWeight: 600, fontSize: 64, color: P.cocoa}}>Skin Talks</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 36, color: P.cocoa, opacity: 0.8}}>by Skincarehouse</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- sound: voices first, soft SFX well under them ---------------- */
const Sound: React.FC<{ep: EpisodeData}> = ({ep}) => {
  const sfx: [number, string, number][] = [[0.05, 'sparkle', 0.05]];
  ep.infographics.forEach((c) => {
    sfx.push([c.start - 0.2, 'whoosh', 0.05]);
    sfx.push([c.start + 0.3, 'bubble_pop', 0.04]);
  });
  const L = (id: string) => ep.lines.find((l) => l.id === id);
  const m3 = L('m3');
  if (m3) sfx.push([m3.start, 'pop', 0.05]);
  const m5 = L('m5');
  if (m5) sfx.push([m5.start + 0.1, 'twinkle', 0.04]);
  sfx.push([ep.duration - 1.5, 'plink', 0.05]);
  return (
    <>
      {ep.lines.map((l) => (
        <Sequence key={l.id} from={sec(l.start)} durationInFrames={sec(l.end - l.start) + 6} layout="none">
          <Audio src={staticFile(l.audio)} volume={1} />
        </Sequence>
      ))}
      {sfx.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, sec(at))} durationInFrames={45} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

export const Episode: React.FC<{ep: EpisodeData}> = ({ep}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const shot = ep.shots.find((s) => t >= s.start && t < s.end) ?? ep.shots[ep.shots.length - 1];
  const line = ep.lines.find((l) => l.id === shot.line);
  const nadiaEnergy = (fr: number) => energyAt(ep.lines, 'nadia', fr);
  const cue = (kind: string) => ep.infographics.find((c) => c.kind === kind);
  const timeline = cue('acne-timeline');
  const pore = cue('pore-cross-section');
  const tip = cue('tip-card');
  const lineById = (id: string) => ep.lines.find((l) => l.id === id);
  const wordAt = (id: string, w: string) => lineById(id)?.words.find((x) => x.t.toLowerCase().startsWith(w))?.s ?? 0;
  const poreLine = ep.lines.find((l) => pore && l.start <= pore.start + 0.01 && l.end >= pore.start);
  const tipLine = ep.lines.find((l) => tip && l.start <= tip.start + 0.01 && l.end >= tip.start);
  const fadeOut = interpolate(f, [ep.durationInFrames - 12, ep.durationInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: P.cream}}>
      <ShotView shot={shot} line={line} />
      <Doodles lines={ep.lines} />
      {tip && tipLine && <TipCard start={tip.start} end={tip.end} title="Tuam ais" items={[{text: 'Balut ais dengan kain', at: wordAt(tipLine.id, 'ais')}, {text: 'Tuam sekejap je', at: wordAt(tipLine.id, 'sekejap')}, {text: 'Bantu kurangkan bengkak', at: wordAt(tipLine.id, 'bengkak')}]} />}
      {timeline && <AcneTimeline start={timeline.start} end={timeline.end} energy={nadiaEnergy} />}
      {pore && poreLine && <PoreSteps start={pore.start} end={pore.end} stepTimes={[wordAt(poreLine.id, 'minyak'), wordAt(poreLine.id, 'sel'), wordAt(poreLine.id, 'bakteria'), wordAt(poreLine.id, 'meradang')]} energy={nadiaEnergy} />}
      <SpeakerTag lines={ep.lines} hideDuring={ep.infographics.filter((c) => c.kind !== 'tip-card')} />
      <Captions lines={ep.lines} />
      <Titles ep={ep} />
      <AbsoluteFill style={{background: P.cream, opacity: Math.max(fadeOut, 1 - c01(f / 6))}} />
      <Sound ep={ep} />
    </AbsoluteFill>
  );
};

export const hostOf = (id: HostId) => HOSTS[id];
