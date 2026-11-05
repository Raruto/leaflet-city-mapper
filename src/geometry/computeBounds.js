/** Cache local AABB and center for ray picking and transparent mesh sorting. */

export function computeBounds(geometry) {
  const min = /* allocation: required -- Each bounds snapshot retains its independent minimum coordinates. */ [Infinity, Infinity, Infinity];
  const max = /* allocation: required -- Each bounds snapshot retains its independent maximum coordinates. */ [-Infinity, -Infinity, -Infinity];
  const data = geometry.attributes.position.data;
  let i;
  for (i = 0; i < data.length; i++) {
    min[i % 3] = Math.min(min[i % 3], data[i]);
    max[i % 3] = Math.max(max[i % 3], data[i]);
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
  const center = /* allocation: required -- Each bounds snapshot retains its independent center coordinates. */ [];
  for (i = 0; i < min.length; i++) center.push((min[i] + max[i]) / 2);
  let radius = instances ? Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2 : 0;
  for (i = 0; !instances && i < data.length; i += 3) {
    radius = Math.max(radius, Math.hypot(
      data[i] - center[0], data[i + 1] - center[1], data[i + 2] - center[2]
    ));
  }
  geometry.bounds = /* allocation: required -- Recomputing a geometry must not mutate previously retained bounds snapshots. */ { min, max, center, radius };
}
