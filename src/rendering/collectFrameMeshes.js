import { sceneByLayer } from '../globals/sceneByLayer.js';


import { updateWorldMatrix } from "../scene/updateWorldMatrix.js";
import { collectMeshes } from './collectMeshes.js';

export function collectFrameMeshes(backend, sunlight, sceneChanged) {
  const camera = sceneByLayer.get(backend).camera;
  const projection = camera.projectionViewMatrix;
  const renderer = sceneByLayer.get(backend).renderer;
  const frustum = renderer.frustum ||= /* alloc */ [
    /* alloc */ new Float64Array(4),
    /* alloc */ new Float64Array(4),
    /* alloc */ new Float64Array(4),
    /* alloc */ new Float64Array(4),
    /* alloc */ new Float64Array(4),
    /* alloc */ new Float64Array(4),
  ];
  const frustumLengths = renderer.frustumLengths ||= /* alloc */ new Float64Array(6);
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
  const candidates = sceneByLayer.get(backend)._visibleMeshes ||= /* alloc */ [];
  candidates.length = 0;
  const shadowMeshes = sceneByLayer.get(backend)._shadowMeshes ||= /* alloc */ [];
  shadowMeshes.length = 0;
  if (sceneChanged) updateWorldMatrix(sceneByLayer.get(backend).scene);
  collectMeshes(sceneByLayer.get(backend).scene, sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes);
}
