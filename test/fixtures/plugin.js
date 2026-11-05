import * as globals from './globals.js';

import '../../src/index.js';



import { mapSetPitchAndBearing } from '../../src/camera/mapSetPitchAndBearing.js';
import { mapStopPitchBearingAnimation } from '../../src/camera/mapStopPitchBearingAnimation.js';
import { mapAnimateCamera } from '../../src/camera/mapAnimateCamera.js';
import { mapUpdateCameraOverlays } from '../../src/camera/mapUpdateCameraOverlays.js';
import { markerCameraIconPoint } from '../../src/core/markerCameraIconPoint.js';

globalThis.globals = globals;

globalThis.cityMapperTestOperations = {
  mapSetPitchAndBearing, mapStopPitchBearingAnimation, mapAnimateCamera,
  mapUpdateCameraOverlays, markerCameraIconPoint,
};
