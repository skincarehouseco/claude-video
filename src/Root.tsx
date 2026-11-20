import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {SkipcareEdit} from './v2/SkipcareEdit';
import {DURATION_IN_FRAMES as V2_FRAMES} from './v2/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="SkipcareEdit" component={SkipcareEdit} durationInFrames={V2_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
