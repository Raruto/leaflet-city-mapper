import { mapMethods } from '../globals/mapMethods.js';
import { cameraZeroPadding } from '../globals/cameraZeroPadding.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';
import { pointOf } from '../projections/toPoint.js';

/**
 * Pan this map until a location lies inside the padded camera viewport.
 *
 * @param {L.LatLng|Array} latlng Geographic location.
 * @param {Object} [options] Padding and pan options.
 *
 * @returns {L.Map} This map.
 */
export function mapPanInside(latlng, options = /* alloc */ {}) {
  if (!mapGetPitch(this) && !mapGetBearing(this)) return mapMethods.value.panInside.call(this, latlng, options);
  const min = pointOf(options.paddingTopLeft || options.padding || cameraZeroPadding);
  const max = this.getSize().subtract(pointOf(options.paddingBottomRight || options.padding || cameraZeroPadding));
  const screen = this.latLngToContainerPoint(latlng);
  const safe = min;
  safe.x = Math.max(min.x, Math.min(max.x, screen.x));
  safe.y = Math.max(min.y, Math.min(max.y, screen.y));
  if (safe.equals(screen)) return this;
  const delta = this.latLngToLayerPoint(latlng).subtract(this.containerPointToLayerPoint(safe));
  return this.panTo(this.unproject(this.project(this.getCenter()).add(delta)), options);
}
