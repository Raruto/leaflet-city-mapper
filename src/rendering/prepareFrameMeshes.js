import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { shadowMeshesByLayer } from '../weakmaps/shadowMeshesByLayer.js';
import { visibleMeshesByLayer } from '../weakmaps/visibleMeshesByLayer.js';
import { compareMeshes } from './compareMeshes.js';
import { revealRoofMesh } from './revealRoofMesh.js';

/**
 * Prepare and sort visible meshes, update fades and filter the shadow list.
 *
 * @param {L.Layer} layer Rendering layer.
 * @param {Array<L.Layer>} rasters Raster layers used for roof coverage.
 * @param {number} now Current frame time in milliseconds.
 * @param {Array<Object>} meshes Destination for meshes to draw.
 *
 * @returns {boolean} Whether a mesh is still fading in.
 */
export function prepareFrameMeshes(layer, rasters, now, meshes) {
  const candidates = visibleMeshesByLayer.get(layer), shadowMeshes = shadowMeshesByLayer.get(layer), renderer = rendererByLayer.get(layer);
  let appearing = false;
  // Visible meshes: opaque first, transparent surfaces back-to-front.
  let mesh, progress;
  for (mesh of candidates) {
    if (!revealRoofMesh(layer, mesh, rasters, now)) continue;
    if (mesh.fadeDuration) {
      mesh.fadeStart ??= mesh.tile?.loadedAt ?? now;
      progress = Math.min(1, (now - mesh.fadeStart) / mesh.fadeDuration);
      mesh._appearance = progress * progress * (3 - 2 * progress);
      appearing ||= progress < 1;
    }
    meshes.push(mesh);
  }
  candidates.length = 0;
  meshes.sort(compareMeshes);
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
