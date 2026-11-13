import { parseColor } from "../colors/parseColor.js";
import { ring } from './createLampRing.js';
import { lampDirections } from '../globals/lampDirections.js';

/**
 * Generate a schematic support and lamp head.
 *
 * @param {Object} point Projected position and ground height.
 * @param {Object} style Lamp height and pole radius.
 * @param {Function} addTriangle Triangle destination callback.
 *
 * @throws {Error} If the pole radius is not finite and positive.
 */
export function lampPostGeometry(point, style, addTriangle) {
  const color = parseColor(0x50565a), radius = style.poleRadius;
  if (!Number.isFinite(radius) || radius <= 0) {
    throw /* alloc */ new Error('Invalid lamp pole radius');
  }
  const center = /* alloc */ {
    ...point, uv: /* alloc */ [3, 3],
  };
  let r, low, high, points, i, a, b, nx, nz, section;
  for (section = 0; section < 2; section++) {
    r = section ? radius * 2.5 : radius;
    low = section ? style.top - 0.25 : 0;
    high = section ? style.top + 0.15 : style.top;
    points = ring(point, r);
    for (i = 0; i < 6; i++) {
      a = points[i], b = points[(i + 1) % 6];
      nx = lampDirections[i].nx, nz = lampDirections[i].nz;
      addTriangle(a, low, b, low, b, high, nx, 0, nz, color);
      addTriangle(a, low, b, high, a, high, nx, 0, nz, color);
      addTriangle(center, high, a, high, b, high, 0, 1, 0, color);
      addTriangle(center, low, b, low, a, low, 0, -1, 0, color);
    }
  }
}
