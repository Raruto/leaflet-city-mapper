import { sceneByLayer } from '../globals/sceneByLayer.js';
import { roofCoverage } from '../geometry/roofCoverage.js';

export function revealRoofMesh(backend, mesh, rasters) {
  if (mesh.program.uniforms.roofTexture && !rasters.length) mesh._roofRevealed = true;
  if (mesh.program.uniforms.roofTexture && !mesh._roofRevealed && rasters.length) {
    if (mesh._roofCoverageSignature !== sceneByLayer.get(backend)._roofRaster?.signature) {
      mesh._roofCoverageSignature = sceneByLayer.get(backend)._roofRaster?.signature;
      mesh._roofCovered = roofCoverage(mesh, backend, rasters);
    }
    if (!mesh._roofCovered) { mesh._appearance = 0; return false; }
    mesh._roofRevealed = true;
  }
  return true;
}
