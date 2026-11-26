import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {BlumeEdit} from './blume/BlumeEdit';
import {DURATION as BLUME_DURATION, FPS as BLUME_FPS} from './blume/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="BlumeEdit" component={BlumeEdit} durationInFrames={BLUME_DURATION} fps={BLUME_FPS} width={1080} height={1920} defaultProps={{variant: 'A' as const}} />
    <Composition id="BlumeEditB" component={BlumeEdit} durationInFrames={BLUME_DURATION} fps={BLUME_FPS} width={1080} height={1920} defaultProps={{variant: 'B' as const}} />
  </>
);
