import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {RoomBathroom, RoomEvening, RoomGifts, RoomMorning, RoomShopping, RoomStore, RoomStudio, RoomTowel, RoomVanity} from './Rooms';
import {C, FPS, H, HAND, rnd, W} from './theme';

/*
 * Version B background: the same contextual scenes, shown as tilted polaroid photos pinned on pastel paper.
 * Each new scene slides in on top of the previous ones, building a little scrapbook collage behind the speaker.
 * Step labels are written on washi tape stuck to the polaroid.
 */

type Card = {at: number; Room: React.FC<{t: number}>; rot: number; tape?: string; tapeColor?: string};
const VanityHook: React.FC<{t: number}> = ({t}) => <RoomVanity t={t} />;
const VanityTwo: React.FC<{t: number}> = ({t}) => <RoomVanity t={t} packshot={0} />;

const CARDS: Card[] = [
  {at: 0, Room: VanityHook, rot: -2.5},
  {at: 1.93, Room: RoomStudio, rot: 3},
  {at: 5.95, Room: RoomBathroom, rot: -3, tape: 'step 1 · cuci muka', tapeColor: '#BFD7F2'},
  {at: 8.7, Room: RoomTowel, rot: 2.5, tape: 'step 2 · tunggu kering', tapeColor: '#FFE7A8'},
  {at: 10.84, Room: RoomVanity, rot: -2, tape: 'step 3 · toner mist', tapeColor: '#FFC5A8'},
  {at: 13.78, Room: VanityTwo, rot: 3.5, tape: '2 cara!', tapeColor: '#D6C9F3'},
  {at: 15.78, Room: RoomMorning, rot: -3, tape: 'cara 1 · spray direct', tapeColor: '#BFD7F2'},
  {at: 17.85, Room: RoomMorning, rot: 2, tape: 'cara 2 · tangan + pat-pat', tapeColor: '#F6C9D5'},
  {at: 20.8, Room: RoomEvening, rot: -2.5, tape: 'step 4 · moisturizer', tapeColor: '#D6C9F3'},
  {at: 24.3, Room: RoomStore, rot: 3},
  {at: 27.62, Room: RoomGifts, rot: -3},
  {at: 30.1, Room: RoomShopping, rot: 2.5},
];
// moments where a new card lands (used for the shutter SFX)
export const CARD_TIMES = CARDS.slice(1).map((c) => c.at);

// photo window inside the polaroid
const PX = 120;
const PY = 205;
const PW = 840;
const PH = 1010;
const BORDER = 26;
const BOTTOM = 130;
const K = 0.8; // room scale inside the photo

const Photo: React.FC<{card: Card; t: number; enter: number; depth: number}> = ({card, t, enter, depth}) => {
  // slide in from the right with a little spin; older cards sink back and dim slightly
  const x = (1 - enter) * 900 + depth * -18;
  const y = (1 - enter) * 160 + depth * 14;
  const rot = card.rot + (1 - enter) * 14 + depth * (card.rot > 0 ? 1.5 : -1.5);
  const sc = 1 - depth * 0.035;
  const R = card.Room;
  return (
    <div
      style={{
        position: 'absolute',
        left: PX - BORDER,
        top: PY - BORDER,
        width: PW + BORDER * 2,
        height: PH + BORDER + BOTTOM,
        background: '#FFFDF9',
        borderRadius: 10,
        boxShadow: `0 ${18 + depth * 4}px ${50}px rgba(20,22,30,${0.22 + 0.04 * depth})`,
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`,
        filter: depth ? `brightness(${1 - depth * 0.04})` : undefined,
      }}
    >
      <div style={{position: 'absolute', left: BORDER, top: BORDER, width: PW, height: PH, overflow: 'hidden', borderRadius: 4, background: C.cream}}>
        <div style={{position: 'absolute', left: (PW - W * K) / 2, top: -150 * K, width: W, height: H, transform: `scale(${K})`, transformOrigin: '0 0'}}>
          <R t={t} />
        </div>
        {/* glossy photo sheen */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(125deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 35%)'}} />
      </div>
      {/* washi tape on the two top corners */}
      {[-1, 1].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            top: -22,
            left: s < 0 ? -30 : PW + BORDER * 2 - 130,
            width: 160,
            height: 46,
            background: 'rgba(246,201,213,0.75)',
            transform: `rotate(${s * 32}deg)`,
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 10px, transparent 10px 20px)',
          }}
        />
      ))}
    </div>
  );
};

/** step label written on a strip of washi tape, top-left (stays in front of the speaker's background only) */
const TapeLabel: React.FC<{card: Card; t: number}> = ({card, t}) => {
  if (!card.tape) return null;
  const p = spring({frame: (t - card.at - 0.25) * FPS, fps: FPS, config: {damping: 14, stiffness: 160, mass: 0.6}});
  const n = Math.floor(Math.max(0, t - card.at - 0.3) * 26);
  return (
    <div
      style={{
        position: 'absolute',
        left: 62,
        top: 168,
        padding: '10px 30px 12px',
        background: card.tapeColor,
        opacity: 0.95 * Math.min(1, p * 1.4),
        transform: `rotate(-4deg) scaleX(${0.3 + 0.7 * p})`,
        transformOrigin: 'left center',
        boxShadow: '0 6px 14px rgba(20,22,30,0.15)',
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 12px, transparent 12px 24px)',
        clipPath: 'polygon(2% 0, 100% 4%, 98% 100%, 0 96%)',
      }}
    >
      <span style={{fontFamily: HAND, fontStyle: 'italic', fontWeight: 700, fontSize: 33, color: C.ink, whiteSpace: 'nowrap'}}>
        {card.tape.split('').map((ch, i) => (
          <span key={i} style={{opacity: i < n ? 1 : 0}}>
            {ch}
          </span>
        ))}
      </span>
    </div>
  );
};

export const PolaroidBackgrounds: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  let i = 0;
  while (i < CARDS.length - 1 && t >= CARDS[i + 1].at) i++;
  const visible = [i - 2, i - 1, i].filter((k) => k >= 0);
  return (
    <AbsoluteFill style={{background: '#FBF1EA', overflow: 'hidden'}}>
      {/* paper texture: dot grid + soft colour blooms */}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(196,111,136,0.22) 2.4px, transparent 2.8px)', backgroundSize: '44px 44px'}} />
      <div style={{position: 'absolute', left: -200, top: -150, width: 700, height: 700, borderRadius: '50%', background: 'rgba(214,201,243,0.45)', filter: 'blur(60px)'}} />
      <div style={{position: 'absolute', left: 600, top: 1300, width: 700, height: 700, borderRadius: '50%', background: 'rgba(255,214,190,0.55)', filter: 'blur(60px)'}} />
      {/* a few doodles on the paper */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 8}).map((_, k) => {
          const x = 40 + rnd(k * 3 + 1) * 1000;
          const y = 1350 + rnd(k * 5 + 2) * 520;
          return (
            <path
              key={k}
              d={`M${x} ${y - 16} C ${x + 2} ${y - 4}, ${x + 4} ${y - 2}, ${x + 16} ${y} C ${x + 4} ${y + 2}, ${x + 2} ${y + 4}, ${x} ${y + 16} C ${x - 2} ${y + 4}, ${x - 4} ${y + 2}, ${x - 16} ${y} C ${x - 4} ${y - 2}, ${x - 2} ${y - 4}, ${x} ${y - 16} Z`}
              fill={['#F6C9D5', '#FFE7A8', '#D6C9F3'][k % 3]}
              opacity={0.7 + 0.3 * Math.sin(t * 3 + k)}
            />
          );
        })}
      </svg>
      {visible.map((k) => {
        const card = CARDS[k];
        const enter = k === 0 ? 1 : spring({frame: (t - card.at) * FPS, fps: FPS, config: {damping: 16, stiffness: 110, mass: 0.8}});
        return <Photo key={k} card={card} t={t} enter={enter} depth={i - k} />;
      })}
      <TapeLabel card={CARDS[i]} t={t} />
    </AbsoluteFill>
  );
};
