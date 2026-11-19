import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, SAFE, SAFE_CX } from "../lib/theme";
import { Overlay } from "../lib/types";
import { Sticker } from "./Stickers";

// Solid multi-direction outline (crisp, no blur, no gradient).
export const outline = (color: string, px: number, drop?: string) => {
  const out: string[] = [];
  for (let a = 0; a < 16; a++) {
    const r = (a / 16) * Math.PI * 2;
    out.push(`${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`);
  }
  if (drop) out.push(`0 ${px + 4}px 0 ${drop}`);
  return out.join(",");
};

// Pop-in / pop-out envelope used by every graphic.
const usePop = (dur: number, delay = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame: f - delay, fps, config: { damping: 11, stiffness: 170, mass: 0.6 } });
  const outT = interpolate(f, [dur * fps - 8, dur * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return { scale: inS * (0.6 + 0.4 * outT), opacity: Math.min(1, inS * 1.4) * outT, f, fps };
};

const Float: React.FC<{ children: React.ReactNode; amp?: number; speed?: number; phase?: number }> = ({ children, amp = 6, speed = 1, phase = 0 }) => {
  const f = useCurrentFrame();
  const y = Math.sin((f / 30) * speed * Math.PI + phase) * amp;
  const r = Math.sin((f / 30) * speed * Math.PI * 0.7 + phase) * 3;
  return <div style={{ transform: `translateY(${y}px) rotate(${r}deg)` }}>{children}</div>;
};

const Title: React.FC<{ o: Extract<Overlay, { kind: "title" }> }> = ({ o }) => {
  const { scale, opacity, f } = usePop(o.dur);
  const letters = o.top.split("");
  return (
    <AbsoluteFill style={{ top: o.y ?? SAFE.top + 40, height: 360, left: SAFE.left, width: SAFE.right - SAFE.left, alignItems: "center", opacity }}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div style={{ fontFamily: FONT.pixel, fontSize: 112, lineHeight: 0.95, color: C.cream, textShadow: outline(C.cocoa, 5, C.orange), letterSpacing: 2 }}>
          {letters.map((ch, i) => {
            const d = spring({ frame: f - i * 1.5, fps: 30, config: { damping: 9, stiffness: 200 } });
            return (
              <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - d) * 40}px)`, opacity: d, whiteSpace: "pre" }}>
                {ch}
              </span>
            );
          })}
        </div>
        {o.script ? (
          <div style={{ fontFamily: FONT.script, fontSize: 104, color: C.orange, marginTop: -10, textShadow: outline(C.white, 4), transform: `rotate(-4deg)` }}>{o.script}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const Label: React.FC<{ o: Extract<Overlay, { kind: "label" }> }> = ({ o }) => {
  const { scale, opacity } = usePop(o.dur);
  return (
    <div style={{ position: "absolute", left: o.x, top: o.y, transform: `translate(-50%,-50%) scale(${scale}) rotate(${o.rot ?? -3}deg)`, opacity }}>
      <Float amp={4} speed={0.8}>
        <div style={{ fontFamily: FONT.pixel, fontSize: o.size ?? 72, color: o.color ?? C.cream, textShadow: outline(C.cocoa, 4, C.orange), whiteSpace: "nowrap" }}>{o.text}</div>
      </Float>
    </div>
  );
};

const Step: React.FC<{ o: Extract<Overlay, { kind: "step" }> }> = ({ o }) => {
  const { scale, opacity, f } = usePop(o.dur);
  const slide = interpolate(f, [0, 12], [-60, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
  return (
    <div style={{ position: "absolute", left: SAFE_CX, top: o.y ?? SAFE.top + 60, transform: `translate(-50%,0) translateX(${slide}px) scale(${scale})`, opacity, textAlign: "center" }}>
      <div style={{ display: "inline-block", fontFamily: FONT.pixel, fontSize: 54, color: C.cocoa, background: C.butter, border: `4px solid ${C.cocoa}`, borderRadius: 999, padding: "2px 26px", boxShadow: `0 6px 0 ${C.orange}` }}>
        step {o.n}
      </div>
      <div style={{ fontFamily: FONT.script, fontSize: 92, color: C.white, textShadow: outline(C.cocoa, 3), marginTop: 2, whiteSpace: "nowrap" }}>{o.text}</div>
    </div>
  );
};

const StickerO: React.FC<{ o: Extract<Overlay, { kind: "sticker" }> }> = ({ o }) => {
  const { scale, opacity, f } = usePop(o.dur);
  const twinkle = o.type === "sparkle" ? 0.85 + 0.15 * Math.sin(f / 4) : 1;
  return (
    <div style={{ position: "absolute", left: o.x, top: o.y, transform: `translate(-50%,-50%) scale(${scale * twinkle}) rotate(${(o.rot ?? 0) + (o.type === "sparkle" ? f * 1.2 : 0)}deg)`, opacity }}>
      <Float amp={7} speed={0.9} phase={o.x / 100}>
        <Sticker type={o.type} size={o.size ?? 90} color={o.color} />
      </Float>
    </div>
  );
};

const Checklist: React.FC<{ o: Extract<Overlay, { kind: "checklist" }> }> = ({ o }) => {
  const { scale, opacity, f, fps } = usePop(o.dur);
  const gap = (o.stepGap ?? 0.5) * fps;
  return (
    <div style={{ position: "absolute", left: SAFE_CX, top: o.y ?? SAFE.top + 40, transform: `translate(-50%,0) scale(${scale})`, opacity, width: 640 }}>
      <div style={{ background: C.cream, border: `5px solid ${C.cocoa}`, borderRadius: 28, padding: "18px 30px 22px", boxShadow: `0 10px 0 ${C.orange}`, transform: "rotate(-1.5deg)" }}>
        <div style={{ fontFamily: FONT.pixel, fontSize: 62, color: C.orange, lineHeight: 1, marginBottom: 8 }}>{o.title}</div>
        {o.items.map((it, i) => {
          const p = spring({ frame: f - 8 - i * gap, fps, config: { damping: 12, stiffness: 160 } });
          const tick = spring({ frame: f - 14 - i * gap, fps, config: { damping: 10, stiffness: 220 } });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateX(${(1 - p) * -40}px)`, marginTop: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, border: `4px solid ${C.cocoa}`, background: C.butter, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.pixel, fontSize: 44, color: C.orange }}>
                <span style={{ transform: `scale(${tick})` }}>✓</span>
              </div>
              <div style={{ fontFamily: FONT.caption, fontWeight: 500, fontSize: 40, color: C.cocoa }}>{it}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Bubble: React.FC<{ o: Extract<Overlay, { kind: "bubble" }> }> = ({ o }) => {
  const { scale, opacity } = usePop(o.dur);
  return (
    <div style={{ position: "absolute", left: o.x, top: o.y, transform: `translate(-50%,-50%) scale(${scale})`, opacity }}>
      <Float amp={5} speed={0.7}>
        <div style={{ position: "relative", background: C.white, border: `4px solid ${C.cocoa}`, borderRadius: 40, padding: "10px 28px", fontFamily: FONT.pixel2, fontWeight: 500, fontSize: 46, color: C.cocoa, whiteSpace: "nowrap", boxShadow: `0 6px 0 ${C.blush}` }}>
          {o.text}
          <div style={{ position: "absolute", bottom: -20, [o.flip ? "right" : "left"]: 40, width: 30, height: 30, background: C.white, borderRight: `4px solid ${C.cocoa}`, borderBottom: `4px solid ${C.cocoa}`, transform: "rotate(45deg) skew(8deg,8deg)" }} />
        </div>
      </Float>
    </div>
  );
};

const Cta: React.FC<{ o: Extract<Overlay, { kind: "cta" }> }> = ({ o }) => {
  const { scale, opacity, f } = usePop(o.dur);
  const wob = Math.sin(f / 6) * 2;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: SAFE.top + 120, height: 420, left: SAFE.left, width: SAFE.right - SAFE.left, opacity }}>
      <div style={{ transform: `scale(${scale}) rotate(${wob}deg)`, textAlign: "center" }}>
        <div style={{ fontFamily: FONT.script, fontSize: 110, color: C.white, textShadow: outline(C.cocoa, 4) }}>{o.top}</div>
        <div style={{ display: "inline-block", marginTop: 4, fontFamily: FONT.pixel, fontSize: 84, color: C.cocoa, background: C.butter, border: `5px solid ${C.cocoa}`, borderRadius: 26, padding: "0 30px", boxShadow: `0 8px 0 ${C.orange}` }}>{o.bottom}</div>
      </div>
    </AbsoluteFill>
  );
};

export const OverlayView: React.FC<{ o: Overlay }> = ({ o }) => {
  switch (o.kind) {
    case "title":
      return <Title o={o} />;
    case "label":
      return <Label o={o} />;
    case "step":
      return <Step o={o} />;
    case "sticker":
      return <StickerO o={o} />;
    case "checklist":
      return <Checklist o={o} />;
    case "bubble":
      return <Bubble o={o} />;
    case "cta":
      return <Cta o={o} />;
  }
};
