import { pluginState } from '../core/pluginState.js';
import { intersectMeshes } from '../collision/intersectMeshes.js';
import { traverse } from '../scene/traverse.js';
import { updateCamera } from '../scene/updateCamera.js';
import { updateWorldMatrix } from '../scene/updateWorldMatrix.js';
import { collectVisibleMesh } from './collectVisibleMesh.js';

/** Raycasting, hover/click highlight and tooltips. */
/**
 * Finds the objects under a mouse or pointer event, nearest first.
 *
 * @param {MouseEvent} event
 * @param {Object[]} [objects] Defaults to this layer's root children, not all map layers.
 * @param {boolean} [recursive] Also test the descendants of `objects`.
 * @returns {Object[]} Nearest hit per mesh: object, shared-world point/distance and triangle faceIndex.
 */

export function raycast(backend, event, objects = pluginState(backend).root.children, recursive = true) {
  if (!pluginState(backend).renderer) {
    return /* allocation: required -- Keep each caller's mutable hit list independent. */ [];
  }
  pluginState(backend)._beforeRaycast?.();
  const rect = backend._map.getContainer().getBoundingClientRect();
  updateWorldMatrix(pluginState(backend).scene);
  updateCamera(pluginState(backend).camera);
  // Unproject the mouse (-1..1) into a world-space ray from the camera.
  const inverseCamera = pluginState(backend).raycaster.inverse;
  const matrix = pluginState(backend).camera.projectionViewMatrix;
  inverseCamera.m11 = matrix[0], inverseCamera.m12 = matrix[1], inverseCamera.m13 = matrix[2], inverseCamera.m14 = matrix[3];
  inverseCamera.m21 = matrix[4], inverseCamera.m22 = matrix[5], inverseCamera.m23 = matrix[6], inverseCamera.m24 = matrix[7];
  inverseCamera.m31 = matrix[8], inverseCamera.m32 = matrix[9], inverseCamera.m33 = matrix[10], inverseCamera.m34 = matrix[11];
  inverseCamera.m41 = matrix[12], inverseCamera.m42 = matrix[13], inverseCamera.m43 = matrix[14], inverseCamera.m44 = matrix[15];
  inverseCamera.invertSelf();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  const endX = inverseCamera.m11 * x + inverseCamera.m21 * y + inverseCamera.m41;
  const endY = inverseCamera.m12 * x + inverseCamera.m22 * y + inverseCamera.m42;
  const endZ = inverseCamera.m13 * x + inverseCamera.m23 * y + inverseCamera.m43;
  const endW = inverseCamera.m14 * x + inverseCamera.m24 * y + inverseCamera.m44;
  let object;
  if (!Number.isFinite(inverseCamera.m11) || !Number.isFinite(inverseCamera.m12) ||
      !Number.isFinite(inverseCamera.m13) || !Number.isFinite(inverseCamera.m14) ||
      !Number.isFinite(inverseCamera.m21) || !Number.isFinite(inverseCamera.m22) ||
      !Number.isFinite(inverseCamera.m23) || !Number.isFinite(inverseCamera.m24) ||
      !Number.isFinite(inverseCamera.m31) || !Number.isFinite(inverseCamera.m32) ||
      !Number.isFinite(inverseCamera.m33) || !Number.isFinite(inverseCamera.m34) ||
      !Number.isFinite(inverseCamera.m41) || !Number.isFinite(inverseCamera.m42) ||
      !Number.isFinite(inverseCamera.m43) || !Number.isFinite(inverseCamera.m44)) {
    throw /* allocation: required -- Give each singular query its own failure stack. */ new Error('Singular 3D transform');
  }
  pluginState(backend).raycaster.origin[0] = pluginState(backend).camera.position[0];
  pluginState(backend).raycaster.origin[1] = pluginState(backend).camera.position[1];
  pluginState(backend).raycaster.origin[2] = pluginState(backend).camera.position[2];
  pluginState(backend).raycaster.direction[0] = endX / endW - pluginState(backend).raycaster.origin[0];
  pluginState(backend).raycaster.direction[1] = endY / endW - pluginState(backend).raycaster.origin[1];
  pluginState(backend).raycaster.direction[2] = endZ / endW - pluginState(backend).raycaster.origin[2];
  const direction = pluginState(backend).raycaster.direction;
  const rayLength = Math.hypot(direction[0], direction[1], direction[2]) || 1;
  pluginState(backend).raycaster.direction[0] /= rayLength;
  pluginState(backend).raycaster.direction[1] /= rayLength;
  pluginState(backend).raycaster.direction[2] /= rayLength;
  const meshes = pluginState(backend).raycaster.meshes;
  meshes.length = 0;
  for (object of objects) {
    if (recursive) traverse(object, collectVisibleMesh, meshes);
    else if (object.geometry && object.visible && object._appearance !== 0) meshes.push(object);
  }
  return intersectMeshes(pluginState(backend).raycaster, meshes, pluginState(backend).renderer.uniformData?.[55]);
}
