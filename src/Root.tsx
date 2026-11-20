import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {SkinEdit} from './skin/SkinEdit';
import {DURATION_IN_FRAMES as SKIN_FRAMES} from './skin/theme';
import {FoamEdit, FOAM_DURATION} from './foam/FoamEdit';
import {OtmsEdit, OTMS_DURATION} from './otms/OtmsEdit';
import {OtmsBeige, OTMS_BEIGE_DURATION} from './otms2/OtmsBeige';
import {Episode, EpisodeData} from './skintalks/Episode';
import {BooihWhimsy, BW_DURATION} from './booih2/BooihWhimsy';
import ep01 from './skintalks/episodes/ep01.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BooihWhimsyA" component={BooihWhimsy} defaultProps={{version: 'A' as const}} durationInFrames={BW_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="BooihWhimsyB" component={BooihWhimsy} defaultProps={{version: 'B' as const}} durationInFrames={BW_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="SkinTalksEp01" component={Episode} defaultProps={{ep: ep01 as unknown as EpisodeData}} durationInFrames={(ep01 as unknown as EpisodeData).durationInFrames} fps={30} width={1080} height={1920} />
    <Composition id="OtmsBeige" component={OtmsBeige} durationInFrames={OTMS_BEIGE_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="OtmsHookA" component={OtmsBeige} defaultProps={{hook: 'A' as const}} durationInFrames={OTMS_BEIGE_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="OtmsHookB" component={OtmsBeige} defaultProps={{hook: 'B' as const}} durationInFrames={OTMS_BEIGE_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="OtmsHookC" component={OtmsBeige} defaultProps={{hook: 'C' as const}} durationInFrames={OTMS_BEIGE_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="OtmsHookD" component={OtmsBeige} defaultProps={{hook: 'D' as const}} durationInFrames={OTMS_BEIGE_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="OtmsHookE" component={OtmsBeige} defaultProps={{hook: 'E' as const}} durationInFrames={OTMS_BEIGE_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="OtmsHookF" component={OtmsBeige} defaultProps={{hook: 'F' as const}} durationInFrames={OTMS_BEIGE_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="OtmsEdit" component={OtmsEdit} durationInFrames={OTMS_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="FoamEdit" component={FoamEdit} durationInFrames={FOAM_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="SkinTypesEdit" component={SkinEdit} durationInFrames={SKIN_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
