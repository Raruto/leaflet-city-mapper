import { shiftRotateWheel } from './shiftRotateWheel.js';
import { state as sharedState } from '../state.js';

export function shiftRotateAddHooks() {
  const container = this._map.getContainer();
  container._cameraShiftRotate = this;
  this._wheel = shiftRotateWheel;
  container.addEventListener('wheel', this._wheel, sharedState.allocationCameraListenerOptions);
}
