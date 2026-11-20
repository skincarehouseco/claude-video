import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {PagiMalam} from './pagimalam/PagiMalam';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {DURATION as PM_DURATION} from './pagimalam/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="PagiMalam" component={PagiMalam} durationInFrames={PM_DURATION} fps={30} width={1080} height={1920} />
  </>
);
