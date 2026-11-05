import { pluginState } from './pluginState.js';
export function markerSetRotation(marker, rotation) {
  if (!Number.isFinite(rotation)) throw /* allocation: required -- Invalid marker rotations need a call-specific error stack. */ new TypeError('Marker rotation must be finite');
  marker.options.rotation = rotation;
  marker.update();
  pluginState(marker)._nativeGPU?.refresh?.();
  return marker;
}
