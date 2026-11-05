import { cross } from './cross.js';

/** Orthonormal view basis plus perspective matrices, refreshed before projecting/drawing. */

export function updateCamera(camera) {
  const z = [];
  for (let i = 0; i < camera.position.length; i++) z.push(camera.position[i] - camera.target[i]);
  const zLength = Math.hypot(...z) || 1;
  for (let i = 0; i < 3; i++) {
    z[i] /= zLength;
  }
  const x = cross(camera.up, z), xLength = Math.hypot(...x) || 1;
  for (let i = 0; i < 3; i++) {
    x[i] /= xLength;
  }
  const y = cross(z, x);
  const view = new DOMMatrix([x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, ...camera.position, 1]).inverse().toFloat64Array();
  for (const value of view) {
    if (!Number.isFinite(value)) throw new Error('Singular 3D transform');
  }
  for (let i = 0; i < 16; i++) {
    camera.viewMatrix[i] = view[i];
  }
  const f = 1 / Math.tan(camera.fov * Math.PI / 360), n = camera.near, r = camera.far;
  const projection = [f / camera.aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, r / (n - r), -1, 0, 0, r * n / (n - r), 0];
  for (let i = 0; i < 16; i++) {
    camera.projectionMatrix[i] = projection[i];
  }
  const projectionView = new DOMMatrix(camera.projectionMatrix).multiply(new DOMMatrix(camera.viewMatrix)).toFloat64Array();
  for (let i = 0; i < 16; i++) {
    camera.projectionViewMatrix[i] = projectionView[i];
  }
}
