import { parseColor } from "./parseColor.js";

/** Three crossed emitter discs; illumination itself is evaluated on receiving surfaces. */

export function lightGeometry(point, style, addTriangle) {
  if (!Number.isFinite(style.lightRadius) || style.lightRadius <= 0) throw new Error('Invalid light radius');
  const color = parseColor(style.color);
  const quad = (a, b, c, d, height, normal) => {
    addTriangle(a, height, b, height, c, height, ...normal, color);
    addTriangle(a, height, c, height, d, height, ...normal, color);
  };
  const r = 0.65;
  const emitter = (u, v, axis) => ({
    x: point.x + (axis === 2 ? 0 : u * r),
    y: point.y + (axis === 1 ? 0 : axis === 2 ? u * r : v * r),
    ground: point.ground + (axis === 0 ? 0 : v * r), uv: [u, v],
  });
  for (let axis = 0; axis < 3; axis++) {
    quad(emitter(-1, -1, axis), emitter(1, -1, axis), emitter(1, 1, axis), emitter(-1, 1, axis),
      style.top, axis === 0 ? [0, 1, 0] : axis === 1 ? [0, 0, 1] : [1, 0, 0]);
  }
}
