/** Cache local AABB and center for ray picking and transparent mesh sorting. */

export function computeBounds(geometry) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], data = geometry.attributes.position.data;
  for (let i = 0; i < data.length; i++) {
    min[i % 3] = Math.min(min[i % 3], data[i]);
    max[i % 3] = Math.max(max[i % 3], data[i]);
  }
  const center = min.map((v, i) => (v + max[i]) / 2);
  let radius = 0;
  for (let i = 0; i < data.length; i += 3) {
    radius = Math.max(radius, Math.hypot(
      data[i] - center[0], data[i + 1] - center[1], data[i + 2] - center[2]
    ));
  }
  geometry.bounds = { min, max, center, radius };
}
