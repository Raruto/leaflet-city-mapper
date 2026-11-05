import { Compass } from '../globals/Compass.js';
import { ContainerResize } from '../globals/ContainerResize.js';
import { PitchDrag } from '../globals/PitchDrag.js';
import { ShiftRotate } from '../globals/ShiftRotate.js';
import { TouchMode } from '../globals/TouchMode.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { touchByContainer } from '../globals/touchByContainer.js';
import { cameraTouchStates } from '../globals/cameraTouchStates.js';
import { cameraListenerOptions } from '../globals/cameraListenerOptions.js';
import { cameraEmptyOptions } from '../globals/cameraEmptyOptions.js';
import { notifyCameraTouchChange } from './notifyCameraTouchChange.js';



import { rotateOnAdd } from './rotateOnAdd.js';
import { rotateOnRemove } from './rotateOnRemove.js';
import { rotateControl } from './rotateControl.js';
import { shiftRotateAddHooks } from './shiftRotateAddHooks.js';
import { shiftRotateRemoveHooks } from './shiftRotateRemoveHooks.js';
import { pitchDragAddHooks } from './pitchDragAddHooks.js';
import { pitchDragRemoveHooks } from './pitchDragRemoveHooks.js';
import { compassAddHooks } from './compassAddHooks.js';
import { compassRemoveHooks } from './compassRemoveHooks.js';
import { containerResizeAddHooks } from './containerResizeAddHooks.js';
import { containerResizeRemoveHooks } from './containerResizeRemoveHooks.js';
import { startCameraTouch } from './startCameraTouch.js';
import { moveCameraTouch } from './moveCameraTouch.js';
import { endCameraTouchEvent } from './endCameraTouchEvent.js';
import { changeCameraTouch } from './changeCameraTouch.js';
import { cleanupCameraTouch } from './cleanupCameraTouch.js';
import { endAllCameraTouches } from './endAllCameraTouches.js';
import { addCameraHandler } from './addCameraHandler.js';

Compass.value = L.Handler.extend({
  addHooks: compassAddHooks,
  removeHooks: compassRemoveHooks,
});

ContainerResize.value = L.Handler.extend({
  addHooks: containerResizeAddHooks,
  removeHooks: containerResizeRemoveHooks,
});

PitchDrag.value = L.Handler.extend({
  addHooks: pitchDragAddHooks,
  removeHooks: pitchDragRemoveHooks,
});

ShiftRotate.value = L.Handler.extend({
  addHooks: shiftRotateAddHooks,
  removeHooks: shiftRotateRemoveHooks,
});

TouchMode.value = L.Handler.extend({
  addHooks: notifyCameraTouchChange,
  removeHooks: notifyCameraTouchChange,
});

L.Control.Rotate = L.Control.extend({
  options: { position: 'topleft', closeOnZeroBearing: true, visualizePitch: true },
  onAdd: rotateOnAdd,
  onRemove: rotateOnRemove,
});

if (L.control) L.control.rotate = rotateControl;

export function cameraControls(map) {
  addCameraHandler(map, 'trackContainerMutation', ContainerResize.value);
  if (!map.options.rotate) return;
  addCameraHandler(map, 'shiftKeyRotate', ShiftRotate.value);
  addCameraHandler(map, 'pitchDrag', PitchDrag.value);
  addCameraHandler(map, 'compassBearing', Compass.value);
  addCameraHandler(map, 'touchRotate', TouchMode.value);
  addCameraHandler(map, 'touchPitch', TouchMode.value);
  const container = map.getContainer();
  const state = cameraByMap.get(map)._cameraTouchState = /* allocation: required -- Each map owns its touch lifecycle state and handlers. */ { map, container, touch: null, nativeZoom: undefined };
  touchByContainer.set(container, state);
  cameraTouchStates.add(state);
  container.addEventListener('touchstart', startCameraTouch, cameraListenerOptions);
  container.addEventListener('touchmove', moveCameraTouch, cameraListenerOptions);
  container.addEventListener('touchend', endCameraTouchEvent, true);
  container.addEventListener('touchcancel', endCameraTouchEvent, true);
  window.addEventListener('blur', endAllCameraTouches);
  map.on('cameratouchchange', changeCameraTouch, map);
  if (map.options.rotateControl) {
    cameraByMap.get(map).rotateControl = /* allocation: required -- Each map retains and removes its own rotation control. */ new L.Control.Rotate(typeof map.options.rotateControl === 'object' ? map.options.rotateControl : cameraEmptyOptions);
    cameraByMap.get(map).rotateControl.addTo(map);
  }
  map.once('unload', cleanupCameraTouch, map);
}
