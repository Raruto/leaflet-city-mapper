/** Cache local AABB and center for ray picking and transparent mesh sorting. */

export function computeBounds(geometry) {
  const min = /* alloc */ [Infinity, Infinity, Infinity];
  const max = /* alloc */ [-Infinity, -Infinity, -Infinity];
  const data = geometry.attributes.position.data;
  let i, x, y, z;
  for (i = 0; i < data.length; i += 3) {
    x = data[i], y = data[i + 1], z = data[i + 2];
    min[0] = Math.min(min[0], x), max[0] = Math.max(max[0], x);
    min[1] = Math.min(min[1], y), max[1] = Math.max(max[1], y);
    min[2] = Math.min(min[2], z), max[2] = Math.max(max[2], z);
  }
  const instances = geometry.attributes.instanceOffset;
  if (instances) {
    let axis, offset, low, high;
    for (axis = 0; axis < 3; axis++) {
      low = Infinity;
      high = -Infinity;
      for (offset = axis; offset < instances.data.length; offset += instances.size) {
        low = Math.min(low, instances.data[offset]);
        high = Math.max(high, instances.data[offset]);
      }
      min[axis] = Math.fround(min[axis] + low);
      max[axis] = Math.fround(max[axis] + high);
    }
  }
  const center = /* alloc */ [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ];
  let radiusSquared = 0;
  for (i = 0; !instances && i < data.length; i += 3) {
    x = data[i] - center[0], y = data[i + 1] - center[1], z = data[i + 2] - center[2];
    radiusSquared = Math.max(radiusSquared, x * x + y * y + z * z);
  }
  let radius = instances ? Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2
    : Math.sqrt(radiusSquared);
  // Preserve hypot's scaling for extreme coordinates in non-Float32 CPU geometry.
  if (!instances && (radiusSquared === Infinity || radiusSquared < Number.MIN_VALUE / Number.EPSILON)) {
    radius = 0;
    for (i = 0; i < data.length; i += 3) {
      radius = Math.max(radius, Math.hypot(
        data[i] - center[0], data[i + 1] - center[1], data[i + 2] - center[2]));
    }
  }
  geometry.bounds = /* alloc */ { min, max, center, radius };
}
