import { mapMethods } from '../globals/mapMethods.js';

/**
 * Attempt an animated pan to a center using Leaflet's ground-space offset.
 *
 * @param {L.LatLng} center Target center.
 * @param {Object} [options] Leaflet pan options.
 *
 * @returns {boolean} Whether the pan was started.
 */
export function mapTryAnimatedPan(center, options) {
  // Leaflet's geographic recentering already supplies ground pixels, not screen pixels.
  const offset = this._getCenterOffset(center)._trunc();
  if (options?.animate !== true && !this.getSize().contains(offset)) return false;
  (mapMethods.value._panBy || mapMethods.value.panBy).call(this, offset, options);
  return true;
}
