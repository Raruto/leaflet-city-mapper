import { halfRadians } from '../globals/halfRadians.js';
/** Orthonormal view basis plus perspective matrices, refreshed before projecting/drawing. */

export function updateCamera(camera) {
  camera.x ||= /* alloc */ [0, 0, 0];
  camera.y ||= /* alloc */ [0, 0, 0];
  camera.z ||= /* alloc */ [0, 0, 0];
  camera.viewTransform ||= /* alloc */ new DOMMatrix();
  camera.projectionTransform ||= /* alloc */ new DOMMatrix();
  camera.projectionViewTransform ||= /* alloc */ new DOMMatrix();
  const { position, target, up, x, y, z, viewMatrix, projectionMatrix, projectionViewMatrix } = camera;
  let value;
  z[0] = position[0] - target[0], z[1] = position[1] - target[1], z[2] = position[2] - target[2];
  const zLength = Math.hypot(z[0], z[1], z[2]) || 1;
  z[0] /= zLength, z[1] /= zLength, z[2] /= zLength;
  x[0] = up[1] * z[2] - up[2] * z[1];
  x[1] = up[2] * z[0] - up[0] * z[2];
  x[2] = up[0] * z[1] - up[1] * z[0];
  const xLength = Math.hypot(x[0], x[1], x[2]) || 1;
  x[0] /= xLength, x[1] /= xLength, x[2] /= xLength;
  y[0] = z[1] * x[2] - z[2] * x[1];
  y[1] = z[2] * x[0] - z[0] * x[2];
  y[2] = z[0] * x[1] - z[1] * x[0];
  const viewTransform = camera.viewTransform;
  viewTransform.m11 = x[0], viewTransform.m12 = x[1], viewTransform.m13 = x[2], viewTransform.m14 = 0;
  viewTransform.m21 = y[0], viewTransform.m22 = y[1], viewTransform.m23 = y[2], viewTransform.m24 = 0;
  viewTransform.m31 = z[0], viewTransform.m32 = z[1], viewTransform.m33 = z[2], viewTransform.m34 = 0;
  viewTransform.m41 = position[0], viewTransform.m42 = position[1], viewTransform.m43 = position[2], viewTransform.m44 = 1;
  viewTransform.invertSelf();
  viewMatrix[0] = viewTransform.m11, viewMatrix[1] = viewTransform.m12, viewMatrix[2] = viewTransform.m13, viewMatrix[3] = viewTransform.m14;
  viewMatrix[4] = viewTransform.m21, viewMatrix[5] = viewTransform.m22, viewMatrix[6] = viewTransform.m23, viewMatrix[7] = viewTransform.m24;
  viewMatrix[8] = viewTransform.m31, viewMatrix[9] = viewTransform.m32, viewMatrix[10] = viewTransform.m33, viewMatrix[11] = viewTransform.m34;
  viewMatrix[12] = viewTransform.m41, viewMatrix[13] = viewTransform.m42, viewMatrix[14] = viewTransform.m43, viewMatrix[15] = viewTransform.m44;
  for (value of viewMatrix) {
    if (!Number.isFinite(value)) throw /* alloc */ new Error('Singular 3D transform');
  }
  const f = 1 / Math.tan(camera.fov * halfRadians), n = camera.near, r = camera.far;
  projectionMatrix[0] = f / camera.aspect, projectionMatrix[1] = 0, projectionMatrix[2] = 0, projectionMatrix[3] = 0;
  projectionMatrix[4] = 0, projectionMatrix[5] = f, projectionMatrix[6] = 0, projectionMatrix[7] = 0;
  projectionMatrix[8] = 0, projectionMatrix[9] = 0, projectionMatrix[10] = r / (n - r), projectionMatrix[11] = -1;
  projectionMatrix[12] = 0, projectionMatrix[13] = 0, projectionMatrix[14] = r * n / (n - r), projectionMatrix[15] = 0;
  const projectionTransform = camera.projectionTransform;
  projectionTransform.m11 = projectionMatrix[0], projectionTransform.m12 = projectionMatrix[1], projectionTransform.m13 = projectionMatrix[2], projectionTransform.m14 = projectionMatrix[3];
  projectionTransform.m21 = projectionMatrix[4], projectionTransform.m22 = projectionMatrix[5], projectionTransform.m23 = projectionMatrix[6], projectionTransform.m24 = projectionMatrix[7];
  projectionTransform.m31 = projectionMatrix[8], projectionTransform.m32 = projectionMatrix[9], projectionTransform.m33 = projectionMatrix[10], projectionTransform.m34 = projectionMatrix[11];
  projectionTransform.m41 = projectionMatrix[12], projectionTransform.m42 = projectionMatrix[13], projectionTransform.m43 = projectionMatrix[14], projectionTransform.m44 = projectionMatrix[15];
  const combined = camera.projectionViewTransform;
  combined.m11 = projectionTransform.m11, combined.m12 = projectionTransform.m12, combined.m13 = projectionTransform.m13, combined.m14 = projectionTransform.m14;
  combined.m21 = projectionTransform.m21, combined.m22 = projectionTransform.m22, combined.m23 = projectionTransform.m23, combined.m24 = projectionTransform.m24;
  combined.m31 = projectionTransform.m31, combined.m32 = projectionTransform.m32, combined.m33 = projectionTransform.m33, combined.m34 = projectionTransform.m34;
  combined.m41 = projectionTransform.m41, combined.m42 = projectionTransform.m42, combined.m43 = projectionTransform.m43, combined.m44 = projectionTransform.m44;
  combined.multiplySelf(viewTransform);
  projectionViewMatrix[0] = combined.m11, projectionViewMatrix[1] = combined.m12, projectionViewMatrix[2] = combined.m13, projectionViewMatrix[3] = combined.m14;
  projectionViewMatrix[4] = combined.m21, projectionViewMatrix[5] = combined.m22, projectionViewMatrix[6] = combined.m23, projectionViewMatrix[7] = combined.m24;
  projectionViewMatrix[8] = combined.m31, projectionViewMatrix[9] = combined.m32, projectionViewMatrix[10] = combined.m33, projectionViewMatrix[11] = combined.m34;
  projectionViewMatrix[12] = combined.m41, projectionViewMatrix[13] = combined.m42, projectionViewMatrix[14] = combined.m43, projectionViewMatrix[15] = combined.m44;
}
