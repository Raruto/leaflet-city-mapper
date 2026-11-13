import { lightScale } from '../globals/lightScale.js';

/**
 * Transform a mesh's point lights to world-space packed records.
 *
 * @param {Object[]} lights Local point lights.
 * @param {number[]|Float32Array} m Column-major world matrix.
 *
 * @returns {Float32Array} Records of [x, y, z, radius, r, g, b, intensity].
 */
export function worldLights(lights, m) {
  const values = /* alloc */ new Float32Array(lights.length * 8);
  let i, x, y, z, radius, color, flux, w;
  for (i = 0; i < lights.length; i++) {
    ({
      position: [x, y, z],
      radius,
      color,
      flux
    } = lights[i]);
    w = m[3] * x + m[7] * y + m[11] * z + m[15];
    values[i * 8] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    values[i * 8 + 1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    values[i * 8 + 2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    values[i * 8 + 3] = radius;
    values[i * 8 + 4] = color[0];
    values[i * 8 + 5] = color[1];
    values[i * 8 + 6] = color[2];
    values[i * 8 + 7] = flux * lightScale;
  }
  return values;
}