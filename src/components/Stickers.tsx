import React from "react";
import { C } from "../lib/theme";
import { StickerType } from "../lib/types";

// Flat, outlined, hand-made feeling stickers. Solid fills only (no gradients).
const INK = C.cocoa;

export const Sticker: React.FC<{ type: StickerType; size: number; color?: string }> = ({ type, size, color }) => {
  const s = size;
  switch (type) {
    case "sparkle":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M50 4 C54 38 62 46 96 50 C62 54 54 62 50 96 C46 62 38 54 4 50 C38 46 46 38 50 4Z" fill={color ?? C.white} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        </svg>
      );
    case "heart":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88Z" fill={color ?? C.blush} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={30} cy={28} rx={8} ry={5} fill={C.white} opacity={0.8} transform="rotate(-30 30 28)" />
        </svg>
      );
    case "pixelHeart": {
      const g = ["01100110", "11111111", "11111111", "11111111", "01111110", "00111100", "00011000"];
      return (
        <svg width={s} height={s * 0.875} viewBox="0 0 8 7" shapeRendering="crispEdges">
          {g.flatMap((row, y) =>
            row.split("").map((v, x) => (v === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={(x === 1 && y === 1) || (x === 2 && y === 1) ? C.white : color ?? C.blush} /> : null)),
          )}
        </svg>
      );
    }
    case "star":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M50 6 L62 36 L94 38 L69 58 L78 92 L50 73 L22 92 L31 58 L6 38 L38 36Z" fill={color ?? C.butter} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </svg>
      );
    case "daisy":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse key={i} cx={50} cy={24} rx={12} ry={20} fill={C.white} stroke={INK} strokeWidth={3} transform={`rotate(${i * 45} 50 50)`} />
          ))}
          <circle cx={50} cy={50} r={14} fill={color ?? C.butterDeep} stroke={INK} strokeWidth={3} />
        </svg>
      );
    case "cursor":
      return (
        <svg width={s} height={s} viewBox="0 0 12 16" shapeRendering="crispEdges">
          <path d="M0 0h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H7v1h1v2h1v2H7v-2H6v-2H5v1H4v1H3v1H1v1H0Z" fill={INK} />
          <path d="M1 2h1v1h1v1h1v1h1v1h1v1h1v1h1v1H6v1h1v2h1v1H7v-2H6v-2H5v1H4v1H3v1H1Z" fill={C.white} />
        </svg>
      );
    case "oat":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <ellipse cx={50} cy={50} rx={22} ry={38} fill={C.cream} stroke={INK} strokeWidth={4} transform="rotate(25 50 50)" />
          <path d="M40 28 Q50 50 58 74" stroke={C.turmeric} strokeWidth={4} fill="none" strokeLinecap="round" />
        </svg>
      );
    case "drop":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M50 6 C66 32 82 48 82 64 C82 82 68 94 50 94 C32 94 18 82 18 64 C18 48 34 32 50 6Z" fill={color ?? C.sky} stroke={INK} strokeWidth={4} />
          <ellipse cx={38} cy={62} rx={6} ry={10} fill={C.white} opacity={0.85} />
        </svg>
      );
    case "clock":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx={50} cy={52} r={40} fill={C.cream} stroke={INK} strokeWidth={5} />
          <path d="M50 52 V28 M50 52 L66 62" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <circle cx={50} cy={52} r={5} fill={C.orange} />
        </svg>
      );
  }
};
