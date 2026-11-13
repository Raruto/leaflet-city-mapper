import { L } from '../globals/L.js';
import { cameraZeroPadding } from '../globals/cameraZeroPadding.js';
import { pointOf } from './toPoint.js';
import { project } from './projectCameraPoint.js';

/**
 * Project the padded viewport corners onto a height plane and return their ground-space bounds.
 *
 * @param {L.Map} map Map whose viewport is projected.
 * @param {L.Point|number[]} [padding] Total viewport padding.
 * @param {number} [height] Height of the projection plane.
 *
 * @returns {L.Bounds} Bounds of the four projected corners.
 */
export function groundBounds(map, padding = cameraZeroPadding, height = 0) {
  const min = pointOf(padding).divideBy(2), max = map.getSize().subtract(min);
  const bounds = /* alloc */ new L.Bounds();
  const minX = min.x, minY = min.y;
  let i;
  for (i = 0; i < 4; i++) {
    min.x = i % 2 ? max.x : minX;
    min.y = i < 2 ? minY : max.y;
    bounds.extend(project(map, min, true, true, height));
  }
  return bounds;
}
