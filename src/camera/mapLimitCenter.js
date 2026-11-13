import { L } from '../globals/L.js';
import { mapMethods } from '../globals/mapMethods.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';
import { groundBounds } from '../projections/groundBounds.js';

/**
 * Limit a proposed center to bounds using the projected camera footprint.
 *
 * @param {L.LatLng} center Proposed map center.
 * @param {number} zoom Zoom level for the bounds calculation.
 * @param {L.LatLngBounds} bounds Maximum geographic bounds.
 *
 * @returns {L.LatLng} Limited center.
 */
export function mapLimitCenter(center, zoom, bounds) {
  if (!bounds || !this._loaded || !mapGetPitch(this) && !mapGetBearing(this)) {
    return mapMethods.value._limitCenter.call(this, center, zoom, bounds);
  }
  const half = this.getSize().divideBy(2), footprint = groundBounds(this), point = this.project(center, zoom);
  const view = /* alloc */ new L.Bounds(point.add(footprint.min.subtract(half)), point.add(footprint.max.subtract(half)));
  const offset = this._getBoundsOffset(view, bounds, zoom);
  return Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1 ? center : this.unproject(point.add(offset), zoom);
}
