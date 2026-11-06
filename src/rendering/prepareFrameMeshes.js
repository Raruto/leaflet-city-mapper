import { sceneByLayer } from '../globals/sceneByLayer.js';


import { sortMeshes } from "./sortMeshes.js";
import { revealRoofMesh } from './revealRoofMesh.js';

export function prepareFrameMeshes(backend, rasters, now, meshes) {
  const candidates = sceneByLayer.get(backend)._visibleMeshes, shadowMeshes = sceneByLayer.get(backend)._shadowMeshes, renderer = sceneByLayer.get(backend).renderer;
  let appearing = false;
  // Visible meshes: opaque first, transparent surfaces back-to-front.
  let mesh, progress;
  for (mesh of candidates) {
    if (!revealRoofMesh(backend, mesh, rasters)) continue;
    if (mesh.fadeDuration) {
      mesh.fadeStart ??= mesh.tile?.loadedAt ?? now;
      progress = Math.min(1, (now - mesh.fadeStart) / mesh.fadeDuration);
      mesh._appearance = progress * progress * (3 - 2 * progress);
      appearing ||= progress < 1;
    }
    meshes.push(mesh);
  }
  candidates.length = 0;
  sortMeshes(meshes);
  let minGroundZoom = Infinity, maxGroundZoom = -Infinity;
  for (mesh of meshes) {
    if (!mesh.ground) continue;
    minGroundZoom = Math.min(minGroundZoom, mesh.tile.coords.z);
    maxGroundZoom = Math.max(maxGroundZoom, mesh.tile.coords.z);
  }
  renderer.groundOverlap = minGroundZoom !== maxGroundZoom;
  let shadowCount = 0;
  for (mesh of shadowMeshes) {
    if (mesh.visible && mesh._appearance !== 0) shadowMeshes[shadowCount++] = mesh;
  }
  shadowMeshes.length = shadowCount;
  return appearing;
}
