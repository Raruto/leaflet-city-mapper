import { updateWorldMatrix } from "../scene/updateWorldMatrix.js";
import { collectMeshes } from './collectMeshes.js';

export function collectFrameMeshes(backend, sunlight, sceneChanged) {
  const camera = backend.camera;
  const projection = camera.projectionViewMatrix;
  const frustum = [
    [projection[3] + projection[0], projection[7] + projection[4], projection[11] + projection[8], projection[15] + projection[12]],
    [projection[3] - projection[0], projection[7] - projection[4], projection[11] - projection[8], projection[15] - projection[12]],
    [projection[3] + projection[1], projection[7] + projection[5], projection[11] + projection[9], projection[15] + projection[13]],
    [projection[3] - projection[1], projection[7] - projection[5], projection[11] - projection[9], projection[15] - projection[13]],
    [projection[2], projection[6], projection[10], projection[14]],
    [projection[3] - projection[2], projection[7] - projection[6], projection[11] - projection[10], projection[15] - projection[14]],
  ];
  const frustumLengths = [
    Math.hypot(frustum[0][0], frustum[0][1], frustum[0][2]),
    Math.hypot(frustum[1][0], frustum[1][1], frustum[1][2]),
    Math.hypot(frustum[2][0], frustum[2][1], frustum[2][2]),
    Math.hypot(frustum[3][0], frustum[3][1], frustum[3][2]),
    Math.hypot(frustum[4][0], frustum[4][1], frustum[4][2]),
    Math.hypot(frustum[5][0], frustum[5][1], frustum[5][2]),
  ];
  const candidates = backend._visibleMeshes ||= [];
  candidates.length = 0;
  const shadowMeshes = backend._shadowMeshes ||= [];
  shadowMeshes.length = 0;
  if (sceneChanged) updateWorldMatrix(backend.scene);
  collectMeshes(backend.scene, sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes);
}
