import { refreshNativeLayerContract } from './refreshNativeLayerContract.js';

export function markerSetRotation(marker, rotation) {
  if (!Number.isFinite(rotation)) throw /* alloc */ new TypeError('Marker rotation must be finite');
  marker.options.rotation = rotation;
  marker.update();
  refreshNativeLayerContract(marker);
  return marker;
}
