import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import edit from './edit.json';
import {C, CX, easeOut, FPS, sans, serifItalic} from './theme';

type Word = {text: string; start: number; end: number};
type Chunk = {start: number; end: number; words: Word[]};

// Keywords get the italic serif accent (like "ada *ininya ya*" in the font references) — same colour, never bold.
const ACCENT = /^(zigzag|mascara|mascara-like|lifted|lentik|bold|100%|pestana|nicely|separate|important|sekata|bergumpal|tinted)$/i;
const clean = (t: string) => t.replace(/[.,?!]+$/, '');

// Group words into short, easy-to-read chunks: <= 4 words / 24 chars, break on punctuation + pauses.
const buildChunks = (words: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({start: cur[0].start, end: cur[cur.length - 1].end, words: cur});
    cur = [];
  };
  words.forEach((w, i) => {
    const next = words[i + 1];
    const len = cur.reduce((n, x) => n + clean(x.text).length + 1, 0) + clean(w.text).length;
    if (cur.length && (cur.length >= 4 || len > 24)) flush();
    cur.push(w);
    const punct = /[.,?!]$/.test(w.text);
    const gap = next ? next.start - w.end : 1;
    if (punct || gap > 0.3) flush();
  });
  flush();
  // keep each chunk on screen until the next one starts (max +0.35 s) so captions never flicker
  return out.map((c, i) => ({...c, end: Math.min(out[i + 1]?.start ?? c.end + 0.6, c.end + 0.35)}));
};

const CHUNKS = buildChunks(edit.words as Word[]);

const Y = 1418; // over the dark hijab, below the chin, above TikTok's bottom UI

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chunk = CHUNKS.find((c) => t >= c.start - 0.06 && t < c.end);
  if (!chunk) return null;
  const k = (t - (chunk.start - 0.06)) * FPS;
  const enter = interpolate(k, [0, 6], [0, 1], {extrapolateRight: 'clamp', easing: easeOut});
  const exit = interpolate((chunk.end - t) * FPS, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: CX - 400,
          width: 800,
          top: Y - 40,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          columnGap: 13,
          opacity: Math.min(enter, exit),
          transform: `translateY(${(1 - enter) * 10}px)`,
        }}
      >
        {chunk.words.map((w, i) => {
          const said = t >= w.start - 0.05;
          const active = said && t < w.end + 0.05;
          const accent = ACCENT.test(clean(w.text));
          const wk = (t - (w.start - 0.05)) * FPS;
          const lift = active ? interpolate(wk, [0, 4, 9], [0, 1, 0.6], {extrapolateRight: 'clamp'}) : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: accent ? serifItalic : sans,
                fontStyle: accent ? 'italic' : 'normal',
                fontWeight: 400,
                fontSize: accent ? 54 : 48,
                lineHeight: 1.25,
                letterSpacing: accent ? 0.2 : 0.4,
                color: C.butter,
                opacity: said ? 1 : 0.55,
                display: 'inline-block',
                transform: `translateY(${-lift * 3}px)`,
                textShadow: '0 2px 2px rgba(25,15,20,0.8), 0 0 10px rgba(25,15,20,0.55), 0 0 22px rgba(25,15,20,0.35)',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
