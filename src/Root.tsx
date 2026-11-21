import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {HyalumelonEdit} from './hyalumelon/Edit';
import {DURATION_IN_FRAMES as HM_FRAMES} from './hyalumelon/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="HyalumelonEdit" component={HyalumelonEdit} durationInFrames={HM_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
