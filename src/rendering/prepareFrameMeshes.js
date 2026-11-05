import { sortMeshes } from "./sortMeshes.js";
import { roofCoverage } from "../geometry/roofCoverage.js";

export function prepareFrameMeshes(backend, rasters, now, meshes) {
  const candidates = backend._visibleMeshes, shadowMeshes = backend._shadowMeshes, renderer = backend.renderer;
  let appearing = false;
  // Visible meshes: opaque first, transparent surfaces back-to-front.
  let mesh, progress;
  for (mesh of candidates) {
    if (mesh.program.uniforms.roofTexture && !rasters.length) mesh._roofRevealed = true;
    if (mesh.program.uniforms.roofTexture && !mesh._roofRevealed && rasters.length) {
      if (mesh._roofCoverageSignature !== backend._roofRaster?.signature) {
        mesh._roofCoverageSignature = backend._roofRaster?.signature;
        mesh._roofCovered = roofCoverage(mesh, backend, rasters);
      }
      if (!mesh._roofCovered) { mesh._appearance = 0; continue; }
      mesh._roofRevealed = true;
    }
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
