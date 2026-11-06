import * as globals from './globals.js';

import '../../src/index.js';



import { mapSetPitchAndBearing } from '../../src/camera/mapSetPitchAndBearing.js';
import { mapStopPitchBearingAnimation } from '../../src/animations/mapStopPitchBearingAnimation.js';
import { mapAnimateCamera } from '../../src/animations/mapAnimateCamera.js';
import { mapUpdateCameraOverlays } from '../../src/camera/mapUpdateCameraOverlays.js';
import { markerCameraIconPoint } from '../../src/projections/markerCameraIconPoint.js';
import { ready } from '../../src/core/whenReady.js';
import { callLayer } from '../../src/scene/callLayer.js';
import { getLocation } from '../../src/scene/getLocation.js';
import { mapGetPitch } from '../../src/camera/mapGetPitch.js';
import { mapGetBearing } from '../../src/camera/mapGetBearing.js';
import { mapSetPitch } from '../../src/camera/mapSetPitch.js';
import { mapSetBearing } from '../../src/camera/mapSetBearing.js';
import { mapResetNorth } from '../../src/camera/mapResetNorth.js';
import { mapResetNorthPitch } from '../../src/camera/mapResetNorthPitch.js';
import { markerSetRotation } from '../../src/core/markerSetRotation.js';

globalThis.globals = globals;

globalThis.testOperations = {
  ready, getLocation,
  getPitch: mapGetPitch, getBearing: mapGetBearing,
  setPitch: mapSetPitch, setBearing: mapSetBearing,
  resetNorth: mapResetNorth, resetNorthPitch: mapResetNorthPitch,
  setRotation: markerSetRotation,
  setData: callLayer.bind(null, 'setData'),
  getHeader: callLayer.bind(null, 'getHeader'),
  getZxy: callLayer.bind(null, 'getZxy'),
  getTileSize: callLayer.bind(null, 'getTileSize'),
  isLoading: callLayer.bind(null, 'isLoading'),
  setOpacity: callLayer.bind(null, 'setOpacity'),
  setZIndex: callLayer.bind(null, 'setZIndex'),
};

globalThis.cityMapperTestOperations = {
  mapSetPitchAndBearing, mapStopPitchBearingAnimation, mapAnimateCamera,
  mapUpdateCameraOverlays, markerCameraIconPoint,
};
