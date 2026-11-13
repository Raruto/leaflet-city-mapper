import { cameraAnimationByMap } from './cameraAnimationByMap.js';
import { cameraBearingByMap } from './cameraBearingByMap.js';
import { cameraDraggableByMap } from './cameraDraggableByMap.js';
import { cameraFrameByMap } from './cameraFrameByMap.js';
import { cameraPitchByMap } from './cameraPitchByMap.js';
import { cameraReadyByMap } from './cameraReadyByMap.js';
import { cameraTouchStateByMap } from './cameraTouchStateByMap.js';
import { cameraViewByMap } from './cameraViewByMap.js';
import { nativeGPUBackByMap } from './nativeGPUBackByMap.js';
import { nativeGPUOrderByMap } from './nativeGPUOrderByMap.js';
import { pitchSkyByMap } from './pitchSkyByMap.js';
import { rotateControlByMap } from './rotateControlByMap.js';
import { sunlightByMap } from './sunlightByMap.js';
import { terrain3DByMap } from './terrain3DByMap.js';
import { timeControlByMap } from './timeControlByMap.js';
import { touchPitchByMap } from './touchPitchByMap.js';
import { touchRotateByMap } from './touchRotateByMap.js';

/**
 * Index camera and control state maps by their compatibility field names.
 *
 * @type {Object<string, WeakMap>}
 */
export const cameraFields = {
  "_cameraAnimation": cameraAnimationByMap,
  "_cameraBearing": cameraBearingByMap,
  "_cameraDraggable": cameraDraggableByMap,
  "_cameraFrame": cameraFrameByMap,
  "_cameraPitch": cameraPitchByMap,
  "_cameraTouchState": cameraTouchStateByMap,
  "_cameraView": cameraViewByMap,
  "_nativeGPUBack": nativeGPUBackByMap,
  "_nativeGPUOrder": nativeGPUOrderByMap,
  "_pitchSky": pitchSkyByMap,
  "_sunlight": sunlightByMap,
  "_terrain3D": terrain3DByMap,
  "_timeControl": timeControlByMap,
  "cameraReady": cameraReadyByMap,
  "rotateControl": rotateControlByMap,
  "touchPitch": touchPitchByMap,
  "touchRotate": touchRotateByMap,
};
