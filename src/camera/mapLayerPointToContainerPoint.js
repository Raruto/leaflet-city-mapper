import { mapMethods } from '../globals/mapMethods.js';
import { project } from '../projections/projectCameraPoint.js';
import { animationPoint } from '../projections/transformZoomAnimationPoint.js';

/**
 * Convert a layer point to a screen point through the camera projection.
 *
 * @param {L.Point|Array} point Layer point.
 *
 * @returns {L.Point} Corresponding container point.
 */
export function mapLayerPointToContainerPoint(point) {
  return project(this, animationPoint(this, mapMethods.value.layerPointToContainerPoint.call(this, point)));
}
