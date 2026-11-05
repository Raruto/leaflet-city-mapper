import { parseColor } from "../utils/parseColor.js";
import { ring } from './lampRing.js';

/** Schematic support and lamp head; wall-mounted fixtures do not get an invented pole. */

export function lampPostGeometry(point, style, addTriangle) {
  const color = parseColor(0x50565a), radius = style.poleRadius;
  if (!Number.isFinite(radius) || radius <= 0) {
    throw /* allocation: required -- Validation errors retain their own message and stack. */ new Error('Invalid lamp pole radius');
  }
  const center = /* allocation: required -- Triangle callbacks may retain the pole center independently of the input point. */ {
    ...point, uv: /* allocation: required -- The retained center owns its editable pole UV coordinate. */ [3, 3],
  };
  let r, low, high, points, i, a, b, angle, nx, nz, section;
  for (section = 0; section < 2; section++) {
    r = section ? radius * 2.5 : radius;
    low = section ? style.top - 0.25 : 0;
    high = section ? style.top + 0.15 : style.top;
    points = ring(point, r);
    for (i = 0; i < 6; i++) {
      a = points[i], b = points[(i + 1) % 6], angle = (i + 0.5) * Math.PI / 3;
      nx = Math.cos(angle), nz = -Math.sin(angle);
      addTriangle(a, low, b, low, b, high, nx, 0, nz, color);
      addTriangle(a, low, b, high, a, high, nx, 0, nz, color);
      addTriangle(center, high, a, high, b, high, 0, 1, 0, color);
      addTriangle(center, low, b, low, a, low, 0, -1, 0, color);
    }
  }
}
