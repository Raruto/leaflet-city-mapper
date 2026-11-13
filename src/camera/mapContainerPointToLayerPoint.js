import { mapMethods } from '../globals/mapMethods.js';
import { animationPoint } from '../projections/transformZoomAnimationPoint.js';
import { project } from '../projections/projectCameraPoint.js';

/**
 * Convert a screen point to a layer point through the inverse camera projection.
 *
 * @param {L.Point|Array} point Container point.
 *
 * @returns {L.Point} Corresponding layer point.
 */
export function mapContainerPointToLayerPoint(point) {
  return mapMethods.value.containerPointToLayerPoint.call(this, animationPoint(this, project(this, point, true), true));
}
