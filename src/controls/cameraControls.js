import { cameraTouchStateByMap } from '../weakmaps/cameraTouchStateByMap.js';
import { cameraHandlersByMap } from '../weakmaps/cameraHandlersByMap.js';
import { rotateControlByMap } from '../weakmaps/rotateControlByMap.js';
import { touchPitchByMap } from '../weakmaps/touchPitchByMap.js';
import { touchRotateByMap } from '../weakmaps/touchRotateByMap.js';
import { L } from '../globals/L.js';
import { Compass } from '../globals/Compass.js';
import { ContainerResize } from '../globals/ContainerResize.js';
import { PitchDrag } from '../globals/PitchDrag.js';
import { ShiftRotate } from '../globals/ShiftRotate.js';
import { TouchMode } from '../globals/TouchMode.js';
import { touchByContainer } from '../weakmaps/touchByContainer.js';
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
import { extendLeafletClass } from '../core/extendLeafletClass.js';

class CompassHandler extends extendLeafletClass(L.Handler) {}
Object.assign(CompassHandler.prototype, { addHooks: compassAddHooks, removeHooks: compassRemoveHooks });
Compass.value = CompassHandler;

class ContainerResizeHandler extends extendLeafletClass(L.Handler) {}
Object.assign(ContainerResizeHandler.prototype, {
  addHooks: containerResizeAddHooks, removeHooks: containerResizeRemoveHooks,
});
ContainerResize.value = ContainerResizeHandler;

class PitchDragHandler extends extendLeafletClass(L.Handler) {}
Object.assign(PitchDragHandler.prototype, { addHooks: pitchDragAddHooks, removeHooks: pitchDragRemoveHooks });
PitchDrag.value = PitchDragHandler;

class ShiftRotateHandler extends extendLeafletClass(L.Handler) {}
Object.assign(ShiftRotateHandler.prototype, {
  addHooks: shiftRotateAddHooks, removeHooks: shiftRotateRemoveHooks,
});
ShiftRotate.value = ShiftRotateHandler;

class TouchModeHandler extends extendLeafletClass(L.Handler) {}
Object.assign(TouchModeHandler.prototype, {
  addHooks: notifyCameraTouchChange, removeHooks: notifyCameraTouchChange,
});
TouchMode.value = TouchModeHandler;

class RotateControl extends extendLeafletClass(L.Control) {
  static defaultOptions = { position: 'topleft', closeOnZeroBearing: true, visualizePitch: true };
}
Object.assign(RotateControl.prototype, { onAdd: rotateOnAdd, onRemove: rotateOnRemove });
if (L.version.startsWith('1.')) {
  RotateControl.prototype.options = Object.assign(Object.create(L.Control.prototype.options), RotateControl.defaultOptions);
}
L.Control.Rotate = RotateControl;

if (L.control) L.control.rotate = rotateControl;

/**
 * Install camera handlers, touch listeners and the optional rotate control.
 *
 * @param {L.Map} map Map receiving the controls.
 */
export function cameraControls(map) {
  addCameraHandler(map, 'trackContainerMutation', ContainerResize.value);
  if (!map.options.rotate) return;
  addCameraHandler(map, 'shiftKeyRotate', ShiftRotate.value);
  addCameraHandler(map, 'pitchDrag', PitchDrag.value);
  addCameraHandler(map, 'compassBearing', Compass.value);
  addCameraHandler(map, 'touchRotate', TouchMode.value);
  addCameraHandler(map, 'touchPitch', TouchMode.value);
  touchRotateByMap.set(map, cameraHandlersByMap.get(map).get('touchRotate'));
  touchPitchByMap.set(map, cameraHandlersByMap.get(map).get('touchPitch'));
  const container = map.getContainer();
  const state = /* alloc */ { map, container, touch: null, nativeZoom: undefined };
  cameraTouchStateByMap.set(map, state);
  touchByContainer.set(container, state);
  cameraTouchStates.add(state);
  container.addEventListener('touchstart', startCameraTouch, cameraListenerOptions);
  container.addEventListener('touchmove', moveCameraTouch, cameraListenerOptions);
  container.addEventListener('touchend', endCameraTouchEvent, true);
  container.addEventListener('touchcancel', endCameraTouchEvent, true);
  window.addEventListener('blur', endAllCameraTouches);
  map.on('cameratouchchange', changeCameraTouch, map);
  changeCameraTouch.call(map);
  if (map.options.rotateControl) {
    rotateControlByMap.set(map, /* alloc */ new L.Control.Rotate(typeof map.options.rotateControl === 'object' ? map.options.rotateControl : cameraEmptyOptions));
    rotateControlByMap.get(map).addTo(map);
  }
  map.once('unload', cleanupCameraTouch, map);
}
