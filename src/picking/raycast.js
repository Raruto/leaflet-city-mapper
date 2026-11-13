import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { raycasterByLayer } from '../weakmaps/raycasterByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { trafficByLayer } from '../weakmaps/trafficByLayer.js';
import { intersectMeshes } from '../collision/intersectMeshes.js';
import { traverse } from '../scene/traverse.js';
import { updateCamera } from '../camera/updateSceneCamera.js';
import { updateWorldMatrix } from '../transforms/updateWorldMatrix.js';
import { collectVisibleMesh } from './collectVisibleMesh.js';
import { placeTraffic } from '../traffic/placeTraffic.js';
import { validateCameraInverse } from './validateCameraInverse.js';

/** Raycasting, hover/click highlight and tooltips. */
/**
 * Finds the objects under a mouse or pointer event, nearest first.
 *
 * @param {L.Layer} layer Layer providing the scene and camera.
 * @param {MouseEvent} event
 * @param {Object[]} [objects] Defaults to this layer's root children, not all map layers.
 * @param {boolean} [recursive] Also test the descendants of `objects`.
 *
 * @returns {Object[]} Nearest hit per mesh: object, shared-world point/distance and triangle faceIndex.
 */
export function raycast(layer, event, objects = rootByLayer.get(layer).children, recursive = true) {
  if (!rendererByLayer.get(layer)) {
    return /* alloc */ [];
  }
  const traffic = trafficByLayer.get(layer);
  if (traffic) placeTraffic(traffic);
  const rect = layer._map.getContainer().getBoundingClientRect();
  updateWorldMatrix(sceneByLayer.get(layer));
  updateCamera(cameraByLayer.get(layer));
  // Unproject the mouse (-1..1) into a world-space ray from the camera.
  const inverseCamera = raycasterByLayer.get(layer).inverse;
  const matrix = cameraByLayer.get(layer).projectionViewMatrix;
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
  validateCameraInverse(inverseCamera);
  raycasterByLayer.get(layer).origin[0] = cameraByLayer.get(layer).position[0];
  raycasterByLayer.get(layer).origin[1] = cameraByLayer.get(layer).position[1];
  raycasterByLayer.get(layer).origin[2] = cameraByLayer.get(layer).position[2];
  raycasterByLayer.get(layer).direction[0] = endX / endW - raycasterByLayer.get(layer).origin[0];
  raycasterByLayer.get(layer).direction[1] = endY / endW - raycasterByLayer.get(layer).origin[1];
  raycasterByLayer.get(layer).direction[2] = endZ / endW - raycasterByLayer.get(layer).origin[2];
  const direction = raycasterByLayer.get(layer).direction;
  const rayLength = Math.hypot(direction[0], direction[1], direction[2]) || 1;
  raycasterByLayer.get(layer).direction[0] /= rayLength;
  raycasterByLayer.get(layer).direction[1] /= rayLength;
  raycasterByLayer.get(layer).direction[2] /= rayLength;
  const meshes = raycasterByLayer.get(layer).meshes;
  meshes.length = 0;
  for (object of objects) {
    if (recursive) traverse(object, collectVisibleMesh, meshes);
    else if (object.geometry && object.visible && object._appearance !== 0) meshes.push(object);
  }
  return intersectMeshes(raycasterByLayer.get(layer), meshes, rendererByLayer.get(layer).uniformData?.[55]);
}
