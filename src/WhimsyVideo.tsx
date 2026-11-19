import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions } from "./components/Captions";
import { OverlayView } from "./components/Overlays";
import { ensureFonts } from "./lib/fonts";
import { GRADE } from "./lib/theme";
import { buildCaptions, overlapIn, overlapOut, segmentStarts } from "./lib/timeline";
import { Cutaway, Edit, Segment } from "./lib/types";

ensureFonts();

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const zoomAt = (seg: Segment, t: number) => {
  const keys = seg.zoom ?? [];
  const drift = 1 + 0.015 * (t / Math.max(1, seg.out - seg.in)); // slow push keeps shots alive
  if (!keys.length) return { s: drift, x: 0.5, y: 0.42 };
  const k = keys.map((q) => ({ t: q.t, s: q.s, x: q.x ?? 0.5, y: q.y ?? 0.4 }));
  if (k[0].t > 0) k.unshift({ ...k[0], t: 0, s: 1 });
  let a = k[k.length - 1];
  let b = a;
  for (let i = 0; i < k.length - 1; i++) {
    if (t >= k[i].t && t <= k[i + 1].t) {
      a = k[i];
      b = k[i + 1];
      break;
    }
  }
  const p = a === b ? 1 : ease(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  return { s: (a.s + (b.s - a.s) * p) * drift, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
};

const CutawayView: React.FC<{ c: Cutaway }> = ({ c }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = c.dur * fps;
  const op = Math.min(interpolate(f, [0, 3], [0, 1], clamp), interpolate(f, [d - 4, d], [1, 0], clamp));
  const sc = (c.s ?? 1) * interpolate(f, [0, d], [1.06, 1.0], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ opacity: op, transform: `scale(${sc})` }}>
      <OffthreadVideo src={staticFile(`clips/${c.clip}.mp4`)} trimBefore={Math.round(c.in * fps)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE }} />
    </AbsoluteFill>
  );
};

const Clip: React.FC<{ seg: Segment; trIn: number; trOut: number }> = ({ seg, trIn, trOut }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = (seg.out - seg.in) * fps;
  const inF = trIn * fps;
  const outF = trOut * fps;
  const fadeIn = inF ? interpolate(f, [0, inF], [0, 1], { ...clamp, easing: ease }) : 1;
  // dissolves settle from a soft push-in; hard jump-cuts get no settle (zoom keys do the punch)
  const settle = inF ? interpolate(f, [0, inF * 1.8], [1.07, 1], { ...clamp, easing: ease }) : 1;
  const z = zoomAt(seg, f / fps);
  const vol = (fr: number) => {
    const a = inF ? interpolate(fr, [0, Math.min(3, inF)], [0, 1], clamp) : 1; // quick in, voice stays crisp
    const b = outF ? interpolate(fr, [dur - outF, dur], [1, 0], clamp) : 1;
    return (seg.voice ?? 1) * Math.min(a, b);
  };
  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z.s * settle})`, transformOrigin: `${z.x * 100}% ${z.y * 100}%` }}>
        <OffthreadVideo src={staticFile(`clips/${seg.clip}.mp4`)} trimBefore={Math.round(seg.in * fps)} muted={seg.mute} volume={vol} style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE }} />
      </AbsoluteFill>
      {(seg.cuts ?? []).map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * fps)} durationInFrames={Math.round(c.dur * fps)} name={`cut ${c.clip}`}>
          <CutawayView c={c} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const editDuration = (e: Edit) => segmentStarts(e).total;

export const WhimsyVideo: React.FC<{ edit: Edit }> = ({ edit }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const { starts } = useMemo(() => segmentStarts(edit), [edit]);
  const lines = useMemo(() => buildCaptions(edit), [edit]);

  // Music sits well under the voice and ducks further while someone talks.
  const base = edit.musicVol ?? 0.12;
  const speech = useMemo(() => {
    const arr = new Float32Array(durationInFrames + 1);
    for (let fr = 0; fr <= durationInFrames; fr++) {
      const sec = fr / fps;
      arr[fr] = lines.some((l) => sec >= l.s - 0.3 && sec <= l.e + 0.3) ? 1 : 0;
    }
    // smooth (~0.4 s) so ducking glides
    const out = new Float32Array(arr.length);
    const r = 6;
    for (let i = 0; i < arr.length; i++) {
      let s = 0;
      let n = 0;
      for (let j = i - r; j <= i + r; j++) if (j >= 0 && j < arr.length) (s += arr[j]), n++;
      out[i] = s / n;
    }
    return out;
  }, [lines, durationInFrames, fps]);
  const musicVolume = (fr: number) => {
    const v = base * (1 - 0.5 * (speech[Math.min(fr, speech.length - 1)] ?? 0));
    const fi = interpolate(fr, [0, 12], [0, 1], clamp);
    const fo = interpolate(fr, [durationInFrames - 40, durationInFrames], [1, 0], clamp);
    return v * fi * fo;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {edit.segments.map((seg, i) => (
        <Sequence key={i} from={Math.round(starts[i] * fps)} durationInFrames={Math.round((seg.out - seg.in) * fps)} name={`${seg.clip} ${seg.in}-${seg.out}`}>
          <Clip seg={seg} trIn={overlapIn(edit, i)} trOut={overlapOut(edit, i)} />
        </Sequence>
      ))}

      {edit.overlays.map((o, i) => (
        <Sequence key={`o${i}`} from={Math.round(o.at * fps)} durationInFrames={Math.round(o.dur * fps)} name={o.kind}>
          <AbsoluteFill>
            <OverlayView o={o} />
          </AbsoluteFill>
        </Sequence>
      ))}

      <Captions lines={lines} />

      <Audio src={staticFile(`music/${edit.music}.wav`)} volume={musicVolume} />
      {edit.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={Math.round(s.at * fps)} durationInFrames={Math.round(1.5 * fps)} name={`sfx ${s.type}`}>
          <Audio src={staticFile(`sfx/${s.type}.wav`)} volume={s.vol ?? 0.2} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
