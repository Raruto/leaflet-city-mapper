import { refreshNativeLayerContract } from '../native/refreshNativeLayerContract.js';

/**
 * Set a marker's rotation and refresh its display and native GPU state.
 *
 * @param {L.Marker} marker Marker to update.
 * @param {number} rotation Rotation value.
 *
 * @returns {L.Marker} The updated marker.
 *
 * @throws {TypeError} If the rotation is not finite.
 */
export function markerSetRotation(marker, rotation) {
  if (!Number.isFinite(rotation)) throw /* alloc */ new TypeError('Marker rotation must be finite');
  marker.options.rotation = rotation;
  marker.update();
  refreshNativeLayerContract(marker);
  return marker;
}
