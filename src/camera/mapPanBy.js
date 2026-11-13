import { mapMethods } from '../globals/mapMethods.js';
import { project } from '../projections/projectCameraPoint.js';
import { pointOf } from '../projections/toPoint.js';

/**
 * Convert a screen offset to ground pixels and pan this map.
 *
 * @param {L.Point|Array} offset Screen-space pan offset.
 * @param {Object} options Leaflet pan options.
 *
 * @returns {L.Map} This map.
 */
export function mapPanBy(offset, options) {
  const half = this.getSize().divideBy(2);
  const ground = half.subtract(project(this, half.subtract(pointOf(offset)), true));
  return mapMethods.value.panBy.call(this, ground, options);
}
