import transcript from "../data/transcript.json";
import { CaptionLine, Edit, Segment, Word } from "./types";

type T = Record<string, { words: Array<{ w: string; s: number; e: number }> }>;
const TR = transcript as unknown as T;

export const DEFAULT_TR = 0.3;
// overlap between segment i-1 and i
export const overlapIn = (e: Edit, i: number) => (i === 0 ? 0 : e.segments[i].transIn ?? e.transition ?? DEFAULT_TR);
export const overlapOut = (e: Edit, i: number) => (i === e.segments.length - 1 ? 0 : overlapIn(e, i + 1));

export const segmentStarts = (e: Edit) => {
  const starts: number[] = [];
  let t = 0;
  e.segments.forEach((s, i) => {
    t -= overlapIn(e, i);
    starts.push(t);
    t += s.out - s.in;
  });
  return { starts, total: t };
};

// Helper for authoring: timeline time of a moment `rel` seconds into segment i.
export const at = (segments: Segment[], transition = DEFAULT_TR) => {
  const e = { id: "", music: "", segments, overlays: [], sfx: [], transition } as Edit;
  const { starts } = segmentStarts(e);
  return (i: number, rel: number) => +(starts[i] + rel).toFixed(3);
};
// moment of a source timestamp inside segment i
export const atSrc = (segments: Segment[], transition = DEFAULT_TR) => {
  const f = at(segments, transition);
  return (i: number, src: number) => f(i, src - segments[i].in);
};

const clean = (w: string) => w.replace(/^\s+|\s+$/g, "");

export const buildCaptions = (e: Edit): CaptionLine[] => {
  const { starts } = segmentStarts(e);
  const words: Word[] = [];
  e.segments.forEach((seg, i) => {
    if (seg.mute) return;
    const src = TR[seg.clip]?.words ?? [];
    const lo = seg.in + overlapIn(e, i) / 2;
    const hi = seg.out - overlapOut(e, i) / 2;
    src.forEach((w, idx) => {
      const key = `${seg.clip}:${idx}`;
      if (e.drop?.includes(key)) return;
      const mid = (w.s + w.e) / 2;
      if (mid < lo || mid > hi) return;
      let text = clean(w.w);
      const fix = e.fixes?.[key] ?? e.fixes?.[text.toLowerCase()];
      if (fix !== undefined) text = fix;
      if (!text) return;
      const off = starts[i] - seg.in;
      const last = words[words.length - 1];
      if (text.startsWith("-") && last) {
        // whisper splits reduplication ("apa -apa") — rejoin as "apa-apa"
        last.w += text;
        last.e = Math.min(w.e, hi) + off;
        return;
      }
      words.push({ w: text, s: Math.max(w.s, lo) + off, e: Math.min(w.e, hi) + off });
    });
  });

  // 1) split into sentences (punctuation or a real pause)
  const sentences: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (cur.length && prev && w.s - prev.e > 0.6) (sentences.push(cur), (cur = []));
    cur.push(w);
    if (/[.?!]$/.test(w.w)) (sentences.push(cur), (cur = []));
  });
  if (cur.length) sentences.push(cur);

  // 2) within a sentence: short lines (≤22 chars / 4 words), prefer breaking after commas;
  //    never leave a lonely last word.
  const MAX = 22;
  const lines: CaptionLine[] = [];
  const txt = (ws: Word[]) => ws.map((x) => x.w).join(" ");
  sentences.forEach((sent) => {
    const chunks: Word[][] = [];
    let c: Word[] = [];
    sent.forEach((w, i) => {
      const prev = sent[i - 1];
      if (c.length && (txt([...c, w]).length > MAX || c.length >= 4 || (prev && w.s - prev.e > 0.45))) (chunks.push(c), (c = []));
      c.push(w);
      if (/,$/.test(w.w) && c.length >= 2 && i < sent.length - 1) (chunks.push(c), (c = []));
    });
    if (c.length) chunks.push(c);
    const last = chunks[chunks.length - 1];
    const prev = chunks[chunks.length - 2];
    if (prev && last.length === 1 && txt([...prev, ...last]).length <= 30) chunks.splice(-2, 2, [...prev, ...last]);
    chunks.forEach((ch) => lines.push({ s: ch[0].s, e: ch[ch.length - 1].e, words: ch }));
  });
  lines.forEach((l, i) => {
    const next = lines[i + 1];
    l.e = Math.min(next ? next.s : l.e + 0.6, l.e + 0.6);
  });
  return lines;
};
