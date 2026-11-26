import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {GlowEdit} from './glow/GlowEdit';
import {DURATION as GLOW_DURATION} from './glow/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="GlowEdit" component={GlowEdit} durationInFrames={GLOW_DURATION} fps={30} width={1080} height={1920} />
  </>
);
