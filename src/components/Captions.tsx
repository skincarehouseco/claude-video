import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, SAFE, SAFE_CX } from "../lib/theme";
import { CaptionLine } from "../lib/types";

// Clean, non-bold, soft-butter-yellow captions, word-synced.
// Sits inside the TikTok safe zone (above the bottom UI, left of the action rail).
export const CAPTION_SIZE = 50;
const SHADOW = "0 2px 3px rgba(60,32,10,0.95), 0 0 2px rgba(60,32,10,1), 0 0 3px rgba(60,32,10,0.8), 0 0 16px rgba(60,32,10,0.45)";

export const Captions: React.FC<{ lines: CaptionLine[]; y?: number }> = ({ lines, y = SAFE.bottom - 150 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const line = lines.find((l) => t >= l.s - 0.05 && t < l.e);
  if (!line) return null;
  const lf = (t - line.s) * fps;
  const enter = spring({ frame: lf, fps, config: { damping: 14, stiffness: 180 } });
  const exit = interpolate((line.e - t) * fps, [0, 4], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_CX,
        top: y,
        width: SAFE.right - SAFE.left - 40,
        transform: `translate(-50%, ${(1 - enter) * 18}px)`,
        opacity: Math.min(enter * 1.5, 1) * exit,
        textAlign: "center",
        fontFamily: FONT.caption,
        fontWeight: 500,
        fontSize: CAPTION_SIZE,
        lineHeight: 1.18,
        color: C.butter,
        textShadow: SHADOW,
        letterSpacing: 0.3,
      }}
    >
      {line.words.map((w, i) => {
        const on = t >= w.s - 0.03;
        const pop = spring({ frame: (t - w.s) * fps, fps, config: { damping: 10, stiffness: 260, mass: 0.5 } });
        const lift = on ? interpolate(pop, [0, 1], [8, 0], { easing: Easing.out(Easing.quad) }) : 8;
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: on ? 1 : 0.35, transform: `translateY(${lift}px) scale(${on ? 0.92 + 0.08 * pop : 0.92})` }}>
            {w.w}
            {i < line.words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};
