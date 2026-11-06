export function localRay(ray, mesh, origin, direction) {
  const inverse = /* alloc */ new DOMMatrix(mesh.worldMatrix).invertSelf();
  const inverseValues = inverse.toFloat64Array();
  let value, x, y, z, w;
  for (value of inverseValues) {
    if (!Number.isFinite(value)) throw /* alloc */ new Error('Singular 3D transform');
  }
  x = ray.origin[0], y = ray.origin[1], z = ray.origin[2];
  w = inverseValues[3] * x + inverseValues[7] * y + inverseValues[11] * z + inverseValues[15];
  origin[0] = (inverseValues[0] * x + inverseValues[4] * y + inverseValues[8] * z + inverseValues[12]) / w;
  origin[1] = (inverseValues[1] * x + inverseValues[5] * y + inverseValues[9] * z + inverseValues[13]) / w;
  origin[2] = (inverseValues[2] * x + inverseValues[6] * y + inverseValues[10] * z + inverseValues[14]) / w;
  x = ray.direction[0], y = ray.direction[1], z = ray.direction[2];
  direction[0] = inverseValues[0] * x + inverseValues[4] * y + inverseValues[8] * z;
  direction[1] = inverseValues[1] * x + inverseValues[5] * y + inverseValues[9] * z;
  direction[2] = inverseValues[2] * x + inverseValues[6] * y + inverseValues[10] * z;
  const directionLength = Math.hypot(...direction) || 1;
  direction[0] /= directionLength;
  direction[1] /= directionLength;
  direction[2] /= directionLength;
}
