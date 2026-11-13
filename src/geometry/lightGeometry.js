import { parseColor } from "../colors/parseColor.js";
import { quad } from './quad.js';
import { emitter } from './emitter.js';

/**
 * Generate three crossed emitter quads; illumination is evaluated on receiving surfaces.
 *
 * @param {Object} point Projected position and ground height.
 * @param {Object} style Light radius, height and color.
 * @param {Function} addTriangle Triangle destination callback.
 *
 * @throws {Error} If the light radius is not finite and positive.
 */
export function lightGeometry(point, style, addTriangle) {
  if (!Number.isFinite(style.lightRadius) || style.lightRadius <= 0) throw /* alloc */ new Error('Invalid light radius');
  const color = parseColor(style.color);
  let axis;
  for (axis = 0; axis < 3; axis++) {
    quad(addTriangle, color, emitter(point, -1, -1, axis), emitter(point, 1, -1, axis), emitter(point, 1, 1, axis), emitter(point, -1, 1, axis),
      style.top, axis === 2 ? 1 : 0, axis === 0 ? 1 : 0, axis === 1 ? 1 : 0);
  }
}
