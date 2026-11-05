import { notifyCameraTouchChange } from './notifyCameraTouchChange.js';
import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

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

sharedState.Compass = L.Handler.extend({
  addHooks: compassAddHooks,
  removeHooks: compassRemoveHooks,
});

sharedState.ContainerResize = L.Handler.extend({
  addHooks: containerResizeAddHooks,
  removeHooks: containerResizeRemoveHooks,
});

sharedState.PitchDrag = L.Handler.extend({
  addHooks: pitchDragAddHooks,
  removeHooks: pitchDragRemoveHooks,
});

sharedState.ShiftRotate = L.Handler.extend({
  addHooks: shiftRotateAddHooks,
  removeHooks: shiftRotateRemoveHooks,
});

sharedState.TouchMode = L.Handler.extend({
  addHooks: notifyCameraTouchChange,
  removeHooks: notifyCameraTouchChange,
});

L.Control.Rotate = L.Control.extend({
  options: { position: 'topleft', closeOnZeroBearing: true, visualizePitch: true },
  onAdd: rotateOnAdd,
  onRemove: rotateOnRemove,
});

if (pluginState(L).control) pluginState(L).control.rotate = rotateControl;

export function cameraControls(map) {
  addCameraHandler(map, 'trackContainerMutation', sharedState.ContainerResize);
  if (!map.options.rotate) return;
  addCameraHandler(map, 'shiftKeyRotate', sharedState.ShiftRotate);
  addCameraHandler(map, 'pitchDrag', sharedState.PitchDrag);
  addCameraHandler(map, 'compassBearing', sharedState.Compass);
  addCameraHandler(map, 'touchRotate', sharedState.TouchMode);
  addCameraHandler(map, 'touchPitch', sharedState.TouchMode);
  const container = map.getContainer();
  const state = pluginState(map)._cameraTouchState = /* allocation: required -- Each map owns its touch lifecycle state and handlers. */ { map, container, touch: null, nativeZoom: undefined };
  pluginState(container)._cameraTouchState = state;
  sharedState.cameraTouchStates.add(state);
  container.addEventListener('touchstart', startCameraTouch, sharedState.allocationCameraListenerOptions);
  container.addEventListener('touchmove', moveCameraTouch, sharedState.allocationCameraListenerOptions);
  container.addEventListener('touchend', endCameraTouchEvent, true);
  container.addEventListener('touchcancel', endCameraTouchEvent, true);
  window.addEventListener('blur', endAllCameraTouches);
  map.on('cameratouchchange', changeCameraTouch, map);
  if (map.options.rotateControl) {
    pluginState(map).rotateControl = /* allocation: required -- Each map retains and removes its own rotation control. */ new L.Control.Rotate(typeof map.options.rotateControl === 'object' ? map.options.rotateControl : sharedState.allocationCameraEmptyOptions);
    pluginState(map).rotateControl.addTo(map);
  }
  map.once('unload', cleanupCameraTouch, map);
}
