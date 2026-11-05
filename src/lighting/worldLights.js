
/** World-space [x, y, z, radius, r, g, b, intensity] for one mesh's point lights. */
export function worldLights(lights, m) {
  const values = new Float32Array(lights.length * 8);
  let i, x, y, z, radius, color, flux, w;
  for (i = 0; i < lights.length; i++) {
    ({
      position: [x, y, z],
      radius,
      color,
      flux
    } = lights[i]);
    w = m[3] * x + m[7] * y + m[11] * z + m[15];
    values.set(
      [
        (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
        (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
       (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
       radius,
       ...color,
       flux / (4 * Math.PI) * 0.03
      ],
       i * 8
    );
  }
  return values;
}