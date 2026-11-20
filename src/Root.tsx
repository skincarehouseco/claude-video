import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {HydrationEdit} from './hydration/HydrationEdit';
import {DURATION_IN_FRAMES as HY_FRAMES, FPS as HY_FPS} from './hydration/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="HydrationEdit" component={HydrationEdit} durationInFrames={HY_FRAMES} fps={HY_FPS} width={1080} height={1920} />
  </>
);
