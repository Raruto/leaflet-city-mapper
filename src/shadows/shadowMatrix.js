import { shadowBounds } from './shadowBounds.js';
import { updateCamera } from '../scene/updateCamera.js';

export function shadowMatrix(meshes, sunlight) {
  const { min, max } = shadowBounds(meshes);
  const span = [], center = [], position = [];
  for (let i = 0; i < 3; i++) {
    span[i] = max[i] - min[i];
    center[i] = (min[i] + max[i]) / 2;
  }
  const radius = Math.max(100, Math.hypot(...span));
  for (let i = 0; i < 3; i++) position[i] = center[i] + sunlight.direction[i] * radius * 2;
  const lightCamera = {
    position,
    target: center, up: [0, 0, -1], fov: 45, aspect: 1, near: 1, far: radius * 5,
    viewMatrix: [], projectionMatrix: [], projectionViewMatrix: [],
  };
  updateCamera(lightCamera);
  const view = new DOMMatrix(lightCamera.viewMatrix);
  const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < 8; i++) {
    const corner = [];
    for (let axis = 0; axis < 3; axis++) corner[axis] = i & (1 << axis) ? max[axis] : min[axis];
    const point = new DOMPoint(...corner, 1).matrixTransform(view);
    const coordinates = [point.x, point.y, point.z];
    for (let axis = 0; axis < 3; axis++) {
      const value = coordinates[axis];
      low[axis] = Math.min(low[axis], value - 20);
      high[axis] = Math.max(high[axis], value + 20);
    }
  }
  for (let i = 0; i < 3; i++) span[i] = high[i] - low[i];
  const projection = new DOMMatrix([
    2 / span[0], 0, 0, 0, 0, 2 / span[1], 0, 0, 0, 0, -1 / span[2], 0,
    -(high[0] + low[0]) / span[0], -(high[1] + low[1]) / span[1], high[2] / span[2], 1,
  ]);
  return projection.multiply(view).toFloat32Array();
}
