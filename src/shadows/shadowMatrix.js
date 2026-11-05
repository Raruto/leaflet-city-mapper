import { shadowBounds as sharedShadowBounds } from '../globals/shadowBounds.js';
import { shadowCamera } from '../globals/shadowCamera.js';
import { shadowLow } from '../globals/shadowLow.js';
import { shadowHigh } from '../globals/shadowHigh.js';

import { shadowBounds } from './shadowBounds.js';
import { updateCamera } from '../scene/updateCamera.js';

export function shadowMatrix(meshes, sunlight) {
  const { min, max } = shadowBounds(meshes, sharedShadowBounds);
  const camera = shadowCamera;
  camera.viewTransform ||= /* alloc */ new DOMMatrix();
  camera.projectionTransform ||= /* alloc */ new DOMMatrix();
  camera.projectionViewTransform ||= /* alloc */ new DOMMatrix();
  const low = shadowLow, high = shadowHigh;
  let i, axis, x, y, z, value;
  const radius = Math.max(100, Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]));
  for (i = 0; i < 3; i++) {
    camera.target[i] = (min[i] + max[i]) / 2;
    camera.position[i] = camera.target[i] + sunlight.direction[i] * radius * 2;
  }
  camera.far = radius * 5;
  updateCamera(camera);
  const view = camera.viewMatrix;
  low.fill(Infinity); high.fill(-Infinity);
  for (i = 0; i < 8; i++) {
    x = i & 1 ? max[0] : min[0];
    y = i & 2 ? max[1] : min[1];
    z = i & 4 ? max[2] : min[2];
    for (axis = 0; axis < 3; axis++) {
      value = view[axis] * x + view[axis + 4] * y + view[axis + 8] * z + view[axis + 12];
      low[axis] = Math.min(low[axis], value - 20);
      high[axis] = Math.max(high[axis], value + 20);
    }
  }
  const scaleX = 2 / (high[0] - low[0]), scaleY = 2 / (high[1] - low[1]);
  const scaleZ = -1 / (high[2] - low[2]);
  const matrix = /* alloc */ new Float32Array(16);
  for (i = 0; i < 16; i += 4) {
    matrix[i] = view[i] * scaleX;
    matrix[i + 1] = view[i + 1] * scaleY;
    matrix[i + 2] = view[i + 2] * scaleZ;
    matrix[i + 3] = view[i + 3];
  }
  matrix[12] -= (high[0] + low[0]) / (high[0] - low[0]);
  matrix[13] -= (high[1] + low[1]) / (high[1] - low[1]);
  matrix[14] += high[2] / (high[2] - low[2]);
  return matrix;
}
