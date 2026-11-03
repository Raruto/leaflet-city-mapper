import { intersectMeshes } from './intersectMeshes.js';
import { traverse } from './traverse.js';
import { updateCamera } from './updateCamera.js';
import { updateWorldMatrix } from './updateWorldMatrix.js';

/** Raycasting, hover/click highlight and tooltips. */
/**
 * Finds the objects under a mouse or pointer event, nearest first.
 *
 * @param {MouseEvent} event
 * @param {Object[]} [objects] Defaults to this layer's root children, not all map layers.
 * @param {boolean} [recursive] Also test the descendants of `objects`.
 * @returns {Object[]} Nearest hit per mesh: object, shared-world point/distance and triangle faceIndex.
 */

export function raycast(backend, event, objects = backend.root.children, recursive = true) {
  if (!backend.renderer) {
    return [];
  }
  backend._beforeRaycast?.();
  const rect = backend._map.getContainer().getBoundingClientRect();
  updateWorldMatrix(backend.scene);
  updateCamera(backend.camera);
  // Unproject the mouse (-1..1) into a world-space ray from the camera.
  const inverseCamera = new DOMMatrix(backend.camera.projectionViewMatrix).inverse();
  const inverseCameraValues = inverseCamera.toFloat64Array();
  if (![...inverseCameraValues].every(Number.isFinite)) {
    throw new Error('Singular 3D transform');
  }
  backend.raycaster.origin[0] = backend.camera.position[0];
  backend.raycaster.origin[1] = backend.camera.position[1];
  backend.raycaster.origin[2] = backend.camera.position[2];
  const unprojected = new DOMPoint(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
    0,
    1
  ).matrixTransform(inverseCamera);
  const end = [
    unprojected.x / unprojected.w,
    unprojected.y / unprojected.w,
    unprojected.z / unprojected.w
  ];
  backend.raycaster.direction[0] = end[0] - backend.raycaster.origin[0];
  backend.raycaster.direction[1] = end[1] - backend.raycaster.origin[1];
  backend.raycaster.direction[2] = end[2] - backend.raycaster.origin[2];
  const rayLength = Math.hypot(...backend.raycaster.direction) || 1;
  backend.raycaster.direction[0] /= rayLength;
  backend.raycaster.direction[1] /= rayLength;
  backend.raycaster.direction[2] /= rayLength;
  const meshes = [];
  for (const object of objects) {
    if (recursive) traverse(object, mesh => {
      if (mesh.geometry && mesh.visible) meshes.push(mesh);
    });
    else if (object.geometry && object.visible) meshes.push(object);
  }
  return intersectMeshes(backend.raycaster, meshes, backend.renderer.uniformData?.[55]);
}
