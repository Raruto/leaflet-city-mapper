import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';

import { roofCoverage } from '../geometry/roofCoverage.js';

export function revealRoofMesh(layer, mesh, rasters) {
  if (mesh.program.uniforms.roofTexture && !rasters.length) mesh._roofRevealed = true;
  if (mesh.program.uniforms.roofTexture && !mesh._roofRevealed && rasters.length) {
    if (mesh._roofCoverageSignature !== roofRasterByLayer.get(layer)?.signature) {
      mesh._roofCoverageSignature = roofRasterByLayer.get(layer)?.signature;
      mesh._roofCovered = roofCoverage(mesh, layer, rasters);
    }
    if (!mesh._roofCovered) { mesh._appearance = 0; return false; }
    mesh._roofRevealed = true;
  }
  return true;
}
