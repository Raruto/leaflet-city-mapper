export function transformNativePoint(target, matrix, x, y, z, w) {
  target.x = matrix.m11 * x + matrix.m21 * y + matrix.m31 * z + matrix.m41 * w;
  target.y = matrix.m12 * x + matrix.m22 * y + matrix.m32 * z + matrix.m42 * w;
  target.z = matrix.m13 * x + matrix.m23 * y + matrix.m33 * z + matrix.m43 * w;
  target.w = matrix.m14 * x + matrix.m24 * y + matrix.m34 * z + matrix.m44 * w;
  return target;
}
