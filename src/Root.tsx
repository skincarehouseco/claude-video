import React from 'react';
import {Composition} from 'remotion';
import {WhimsyEdit} from './WhimsyEdit';
import {DURATION_IN_FRAMES, FPS} from './theme';
import {DUR, FPS as OFPS} from './otms/common';
import {V1ReferenceA} from './otms/V1ReferenceA';
import {V2ReferenceB} from './otms/V2ReferenceB';
import {V3Infographic} from './otms/V3Infographic';
import {V4Freestyle} from './otms/V4Freestyle';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhimsyEdit" component={WhimsyEdit} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="YELLO-OTMS-01-Reference-A" component={V1ReferenceA} durationInFrames={DUR} fps={OFPS} width={1080} height={1920} />
    <Composition id="YELLO-OTMS-02-Reference-B" component={V2ReferenceB} durationInFrames={DUR} fps={OFPS} width={1080} height={1920} />
    <Composition id="YELLO-OTMS-03-Original-Infographic" component={V3Infographic} durationInFrames={DUR} fps={OFPS} width={1080} height={1920} />
    <Composition id="YELLO-OTMS-04-Creative-Freestyle" component={V4Freestyle} durationInFrames={DUR} fps={OFPS} width={1080} height={1920} />
  </>
);
