import { state as sharedState } from '../../src/state.js';
import '../../src/index.js';

import { pluginState } from '../../src/core/pluginState.js';

import { mapSetPitchAndBearing } from '../../src/camera/mapSetPitchAndBearing.js';
import { mapStopPitchBearingAnimation } from '../../src/camera/mapStopPitchBearingAnimation.js';
import { mapAnimateCamera } from '../../src/camera/mapAnimateCamera.js';
import { mapUpdateCameraOverlays } from '../../src/camera/mapUpdateCameraOverlays.js';
import { markerCameraIconPoint } from '../../src/core/markerCameraIconPoint.js';

globalThis.cityMapperTestState = sharedState;
globalThis.pluginState = pluginState;
globalThis.sharedState = sharedState;

sharedState.operations = {
  mapSetPitchAndBearing, mapStopPitchBearingAnimation, mapAnimateCamera,
  mapUpdateCameraOverlays, markerCameraIconPoint,
};
