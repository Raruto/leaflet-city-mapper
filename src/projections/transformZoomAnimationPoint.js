import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';

/**
 * Apply or invert the current camera zoom-animation transform to a container point.
 *
 * @param {L.Map} map Map providing the current animation view.
 * @param {L.Point} point Container point.
 * @param {boolean} [inverse] Apply the inverse transform.
 *
 * @returns {L.Point} Transformed point, or the input when no animation view exists.
 */
export function animationPoint(map, point, inverse = false) {
  const view = cameraViewByMap.get(map);
  if (!view) return point;
  const half = map.getSize().divideBy(2), scale = map.getZoomScale(view.zoom);
  const shift = map.project(map.getCenter(), view.zoom).subtract(map.project(view.center, view.zoom));
  return inverse ? point.subtract(half).subtract(shift).divideBy(scale).add(half) :
    point.subtract(half).multiplyBy(scale).add(shift).add(half);
}
