
/** World-space [x, y, z, radius, r, g, b, intensity] for one mesh's point lights. */
export function worldLights(lights, m) {
  const values = /* allocation: required -- Each mesh cache retains independent transformed light data. */ new Float32Array(lights.length * 8);
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
    values[i * 8 + 7] = flux / (4 * Math.PI) * 0.03;
  }
  return values;
}