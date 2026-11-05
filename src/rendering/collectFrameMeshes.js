import { updateWorldMatrix } from "../scene/updateWorldMatrix.js";
import { collectMeshes } from './collectMeshes.js';

export function collectFrameMeshes(backend, sunlight, sceneChanged) {
  const camera = backend.camera;
  const projection = camera.projectionViewMatrix;
  const renderer = backend.renderer;
  const frustum = renderer.frustum ||= [
    new Float64Array(4), new Float64Array(4), new Float64Array(4),
    new Float64Array(4), new Float64Array(4), new Float64Array(4),
  ];
  const frustumLengths = renderer.frustumLengths ||= new Float64Array(6);
  let i, axis, plane, j, offset;
  for (i = 0; i < 6; i++) {
    axis = Math.floor(i / 2);
    plane = frustum[i];
    for (j = 0; j < 4; j++) {
      offset = j * 4;
      plane[j] = i === 4 ? projection[offset + 2]
        : i % 2 ? projection[offset + 3] - projection[offset + axis]
        : projection[offset + 3] + projection[offset + axis];
    }
    frustumLengths[i] = Math.hypot(plane[0], plane[1], plane[2]);
  }
  const candidates = backend._visibleMeshes ||= [];
  candidates.length = 0;
  const shadowMeshes = backend._shadowMeshes ||= [];
  shadowMeshes.length = 0;
  if (sceneChanged) updateWorldMatrix(backend.scene);
  collectMeshes(backend.scene, sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes);
}
