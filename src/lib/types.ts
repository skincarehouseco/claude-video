// Edit-decision-list types. Times are in seconds.

export type ZoomKey = {
  t: number; // seconds from segment start
  s: number; // scale
  x?: number; // transform-origin x (0..1)
  y?: number; // transform-origin y (0..1)
};

export type Segment = {
  clip: string; // proxy name in public/clips (without .mp4)
  in: number; // source in (s)
  out: number; // source out (s)
  zoom?: ZoomKey[];
  voice?: number; // voice gain multiplier (default 1)
  mute?: boolean; // B-roll: keep ambience out
  transIn?: number; // overlap with previous segment (s). 0 = hard jump-cut
  cuts?: Cutaway[]; // B-roll laid over this segment while its audio keeps playing
};

export type Cutaway = { at: number; dur: number; clip: string; in: number; s?: number };

export type Word = { w: string; s: number; e: number };
export type CaptionLine = { s: number; e: number; words: Word[] };

export type Overlay =
  | { kind: "title"; at: number; dur: number; top: string; script?: string; y?: number }
  | { kind: "label"; at: number; dur: number; text: string; x: number; y: number; rot?: number; color?: string; size?: number }
  | { kind: "step"; at: number; dur: number; n: number; text: string; y?: number }
  | { kind: "sticker"; at: number; dur: number; type: StickerType; x: number; y: number; size?: number; color?: string; rot?: number }
  | { kind: "checklist"; at: number; dur: number; title: string; items: string[]; y?: number; stepGap?: number }
  | { kind: "bubble"; at: number; dur: number; text: string; x: number; y: number; flip?: boolean }
  | { kind: "cta"; at: number; dur: number; top: string; bottom: string };

export type StickerType =
  | "sparkle"
  | "heart"
  | "pixelHeart"
  | "star"
  | "daisy"
  | "cursor"
  | "oat"
  | "drop"
  | "clock";

export type Sfx = { at: number; type: "pop" | "sparkle" | "whoosh" | "ding" | "click" | "boing" | "magic"; vol?: number };

export type Edit = {
  id: string;
  music: string;
  musicVol?: number;
  segments: Segment[];
  // word-level text fixes applied to transcript words, keyed "clip:index" or plain lowercase word
  fixes?: Record<string, string>;
  // drop transcript words (e.g. off-mic chatter) keyed "clip:index"
  drop?: string[];
  overlays: Overlay[];
  sfx: Sfx[];
  transition?: number; // overlap in seconds
};
