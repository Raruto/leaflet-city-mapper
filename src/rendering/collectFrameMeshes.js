import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { shadowMeshesByLayer } from '../weakmaps/shadowMeshesByLayer.js';
import { visibleMeshesByLayer } from '../weakmaps/visibleMeshesByLayer.js';



import { updateWorldMatrix } from "../scene/updateWorldMatrix.js";
import { collectMeshes } from './collectMeshes.js';

export function collectFrameMeshes(layer, sunlight, sceneChanged) {
  const camera = cameraByLayer.get(layer);
  const projection = camera.projectionViewMatrix;
  const renderer = rendererByLayer.get(layer);
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
  let candidates = visibleMeshesByLayer.get(layer);
  if (!candidates) visibleMeshesByLayer.set(layer, candidates = /* alloc */ []);
  candidates.length = 0;
  let shadowMeshes = shadowMeshesByLayer.get(layer);
  if (!shadowMeshes) shadowMeshesByLayer.set(layer, shadowMeshes = /* alloc */ []);
  shadowMeshes.length = 0;
  if (sceneChanged) updateWorldMatrix(sceneByLayer.get(layer));
  collectMeshes(sceneByLayer.get(layer), sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes);
}
