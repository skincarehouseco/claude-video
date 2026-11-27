import React from 'react';

let ctx: CanvasRenderingContext2D | null = null;
export const measure = (text: string, font: string) => {
  if (typeof document === 'undefined') return text.length * 30;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  ctx!.font = font;
  return ctx!.measureText(text).width;
};

/**
 * Text laid out on an arc (like the whimsical "arched title" treatment).
 * Each letter can be animated through `letterStyle(i, n)`.
 * bend: radius in px (positive = arch upwards / frown). Centre of the baseline is at (0,0).
 */
export const ArcText: React.FC<{
  text: string;
  font: string; // css font shorthand, e.g. "700 130px Fredoka"
  radius: number;
  tracking?: number;
  style?: React.CSSProperties;
  letterStyle?: (i: number, n: number) => React.CSSProperties;
}> = ({text, font, radius, tracking = 0, style, letterStyle}) => {
  const chars = [...text];
  const widths = chars.map((c) => measure(c, font) + tracking);
  const total = widths.reduce((a, b) => a + b, 0) - tracking;
  let acc = -total / 2;
  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      {chars.map((c, i) => {
        const mid = acc + widths[i] / 2;
        acc += widths[i];
        const theta = mid / radius; // radians
        const x = radius * Math.sin(theta);
        const y = radius - radius * Math.cos(theta);
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              font,
              whiteSpace: 'pre',
              transform: `translate(-50%, -100%) rotate(${theta}rad)`,
              transformOrigin: '50% 100%',
              ...style,
              ...(letterStyle ? letterStyle(i, chars.length) : {}),
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};
