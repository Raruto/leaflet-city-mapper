import { ShiftRotate } from './constants/ShiftRotate.js';
import { PitchDrag } from './constants/PitchDrag.js';
import { Compass } from './constants/Compass.js';
import { ContainerResize } from './constants/ContainerResize.js';
import { TouchMode } from './constants/TouchMode.js';
import { cameraControlsState } from './constants/cameraControlsState.js';
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
import { touchModeAddHooks } from './touchModeAddHooks.js';
import { touchModeRemoveHooks } from './touchModeRemoveHooks.js';
import { startCameraTouch } from './startCameraTouch.js';
import { moveCameraTouch } from './moveCameraTouch.js';
import { endCameraTouchEvent } from './endCameraTouchEvent.js';
import { changeCameraTouch } from './changeCameraTouch.js';
import { cleanupCameraTouch } from './cleanupCameraTouch.js';
import { endAllCameraTouches } from './endAllCameraTouches.js';

cameraControlsState.cameraDrags = new Set();
cameraControlsState.dragStates = new WeakMap();
cameraControlsState.cameraTouchStates = new Set();

L.Control.Rotate = L.Control.extend({
  options: { position: 'topleft', closeOnZeroBearing: true, visualizePitch: true },
  onAdd: rotateOnAdd,
  onRemove: rotateOnRemove,
});

if (L.control) L.control.rotate = rotateControl;

export function cameraControls(map) {
  map.addHandler('trackContainerMutation', ContainerResize);
  if (!map.options.rotate) return;
  map.addHandler('shiftKeyRotate', ShiftRotate);
  map.addHandler('pitchDrag', PitchDrag);
  map.addHandler('compassBearing', Compass);
  map.addHandler('touchRotate', TouchMode);
  map.addHandler('touchPitch', TouchMode);
  const container = map.getContainer();
  const state = map._cameraTouchState = { map, container, touch: null, nativeZoom: undefined };
  container._cameraTouchState = state;
  cameraControlsState.cameraTouchStates.add(state);
  container.addEventListener('touchstart', startCameraTouch, { capture: true, passive: false });
  container.addEventListener('touchmove', moveCameraTouch, { capture: true, passive: false });
  container.addEventListener('touchend', endCameraTouchEvent, true);
  container.addEventListener('touchcancel', endCameraTouchEvent, true);
  window.addEventListener('blur', endAllCameraTouches);
  map.on('cameratouchchange', changeCameraTouch, map);
  if (map.options.rotateControl) {
    map.rotateControl = new L.Control.Rotate(typeof map.options.rotateControl === 'object' ? map.options.rotateControl : {});
    map.rotateControl.addTo(map);
  }
  map.once('unload', cleanupCameraTouch, map);
}
