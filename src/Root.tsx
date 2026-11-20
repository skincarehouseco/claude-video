import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {SkinEdit} from './skin/SkinEdit';
import {DURATION_IN_FRAMES as SKIN_FRAMES} from './skin/theme';
import {FoamEdit, FOAM_DURATION} from './foam/FoamEdit';
import {OtmsEdit, OTMS_DURATION} from './otms/OtmsEdit';
import {OtmsBeige, OTMS_BEIGE_DURATION} from './otms2/OtmsBeige';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="OtmsBeige" component={OtmsBeige} durationInFrames={OTMS_BEIGE_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="OtmsEdit" component={OtmsEdit} durationInFrames={OTMS_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="FoamEdit" component={FoamEdit} durationInFrames={FOAM_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="SkinTypesEdit" component={SkinEdit} durationInFrames={SKIN_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
