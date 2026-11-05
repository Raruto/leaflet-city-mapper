import { mapCameraState } from '../constants/mapCameraState.js';

export function markerUpdateZIndex(offset) {
  mapCameraState.markerMethods._updateZIndex.call(this, offset);
  const changed = this._cameraZIndexOffset !== offset;
  this._cameraZIndexOffset = offset;
  if (changed) this._nativeGPU?.refresh?.();
}
