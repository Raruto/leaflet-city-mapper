import { cameraZIndexOffsetByLayer } from '../weakmaps/cameraZIndexOffsetByLayer.js';
import { markerMethods } from '../globals/markerMethods.js';
import { refreshNativeLayerContract } from '../native/refreshNativeLayerContract.js';

/**
 * Update this marker's Leaflet z-index and refresh native state when its offset changes.
 *
 * @param {number} offset Z-index offset.
 */
export function markerUpdateZIndex(offset) {
  markerMethods.value._updateZIndex.call(this, offset);
  const changed = cameraZIndexOffsetByLayer.get(this) !== offset;
  cameraZIndexOffsetByLayer.set(this, offset);
  if (changed) refreshNativeLayerContract(this);
}
