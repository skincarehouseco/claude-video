import React from 'react';
import {C, SANS} from './theme';

export type Zone = 'dahi' | 'pipi' | 'hidung' | 'dagu';
type Props = {
  size?: number;
  /** 0..1 highlight per zone */
  on: Partial<Record<Zone, number>>;
  /** fill colour per zone when highlighted */
  color?: Partial<Record<Zone, string>>;
  labels?: boolean;
  /** oil shine dots on highlighted zones */
  shine?: boolean;
};

/** Simple illustrative face diagram with the four dab zones she names: dahi, pipi, hidung, dagu. */
export const FaceMap: React.FC<Props> = ({size = 340, on, color = {}, labels = true, shine = false}) => {
  const z = (k: Zone) => on[k] ?? 0;
  const col = (k: Zone) => color[k] ?? C.yellow;
  const zoneStyle = (k: Zone) => ({fill: col(k), opacity: 0.15 + 0.75 * z(k), transition: 'none'});
  const label = (k: Zone, x: number, y: number, text: string, anchor: 'start' | 'end' | 'middle') =>
    labels && z(k) > 0.05 ? (
      <g opacity={Math.min(1, z(k) * 1.5)}>
        <text x={x} y={y} fontFamily={SANS} fontWeight={800} fontSize="13" textAnchor={anchor} fill="#fff" stroke={C.ink} strokeWidth="4" paintOrder="stroke">
          {text}
        </text>
      </g>
    ) : null;
  const dots = (cx: number, cy: number, k: Zone) =>
    shine && z(k) > 0.5 ? (
      <g opacity={z(k)}>
        <circle cx={cx} cy={cy} r="3" fill="#fff" opacity="0.9" />
        <circle cx={cx + 7} cy={cy + 5} r="1.8" fill="#fff" opacity="0.8" />
      </g>
    ) : null;
  return (
    <svg width={size} height={size * 1.15} viewBox="-30 0 160 184" style={{overflow: 'visible'}}>
      {/* head */}
      <ellipse cx="50" cy="92" rx="56" ry="76" fill="#F3D2BD" stroke={C.ink} strokeWidth="4" />
      {/* zones */}
      <path d="M8 62 Q50 8 92 62 Q50 50 8 62z" style={zoneStyle('dahi')} />
      <ellipse cx="18" cy="104" rx="16" ry="20" style={zoneStyle('pipi')} />
      <ellipse cx="82" cy="104" rx="16" ry="20" style={zoneStyle('pipi')} />
      <path d="M42 70 L58 70 L62 116 Q50 124 38 116z" style={zoneStyle('hidung')} />
      <ellipse cx="50" cy="152" rx="20" ry="12" style={zoneStyle('dagu')} />
      {dots(40, 40, 'dahi')}
      {dots(46, 98, 'hidung')}
      {dots(12, 100, 'pipi')}
      {dots(78, 100, 'pipi')}
      {dots(44, 150, 'dagu')}
      {/* features */}
      <path d="M26 74 q8 -6 16 0 M58 74 q8 -6 16 0" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M38 132 q12 9 24 0" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {label('dahi', 50, 34, 'DAHI', 'middle')}
      {label('pipi', -6, 136, 'PIPI', 'middle')}
      {label('pipi', 106, 136, 'PIPI', 'middle')}
      {label('hidung', 50, 92, 'HIDUNG', 'middle')}
      {label('dagu', 50, 180, 'DAGU', 'middle')}
    </svg>
  );
};
