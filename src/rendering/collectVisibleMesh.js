import { computeBounds } from '../geometry/computeBounds.js';
import { nativeStrokeExpansion } from './nativeStrokeExpansion.js';

export function collectVisibleMesh(mesh, projection, frustum, frustumLengths, candidates) {
  if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
  const bounds = mesh.geometry.bounds;
  const world = mesh.worldMatrix;
  let sphere = mesh._cullingSphere;
  if (!sphere || sphere.bounds !== bounds || sphere.matrix !== world ||
      sphere.version !== mesh._worldMatrixVersion || mesh._worldMatrixVersion === undefined) {
    sphere ||= mesh._cullingSphere = /* alloc */ {};
    const center = bounds.center;
    sphere.x = world[0] * center[0] + world[4] * center[1] + world[8] * center[2] + world[12];
    sphere.y = world[1] * center[0] + world[5] * center[1] + world[9] * center[2] + world[13];
    sphere.z = world[2] * center[0] + world[6] * center[1] + world[10] * center[2] + world[14];
    sphere.scale = Math.max(
      Math.hypot(world[0], world[1], world[2]),
      Math.hypot(world[4], world[5], world[6]),
      Math.hypot(world[8], world[9], world[10])
    );
    sphere.radius = bounds.radius * sphere.scale;
    sphere.bounds = bounds;
    sphere.matrix = world;
    sphere.version = mesh._worldMatrixVersion;
  }
  const { x, y, z } = sphere;
  const radius = sphere.radius + nativeStrokeExpansion(mesh) * sphere.scale;
  const clipZ = projection[2] * x + projection[6] * y + projection[10] * z + projection[14];
  const clipW = projection[3] * x + projection[7] * y + projection[11] * z + projection[15];
  mesh._sortDepth = clipZ / clipW;
  mesh._visibleInFrame =
    frustum[0][0] * x + frustum[0][1] * y + frustum[0][2] * z + frustum[0][3] >= -radius * frustumLengths[0] &&
    frustum[1][0] * x + frustum[1][1] * y + frustum[1][2] * z + frustum[1][3] >= -radius * frustumLengths[1] &&
    frustum[2][0] * x + frustum[2][1] * y + frustum[2][2] * z + frustum[2][3] >= -radius * frustumLengths[2] &&
    frustum[3][0] * x + frustum[3][1] * y + frustum[3][2] * z + frustum[3][3] >= -radius * frustumLengths[3] &&
    frustum[4][0] * x + frustum[4][1] * y + frustum[4][2] * z + frustum[4][3] >= -radius * frustumLengths[4] &&
    frustum[5][0] * x + frustum[5][1] * y + frustum[5][2] * z + frustum[5][3] >= -radius * frustumLengths[5];
  if (mesh._visibleInFrame) candidates.push(mesh);
}
