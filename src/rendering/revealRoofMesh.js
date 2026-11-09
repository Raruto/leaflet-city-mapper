import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';
import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';
import { walkByMap } from '../weakmaps/walkByMap.js';

import { roofCoverage } from '../geometry/roofCoverage.js';

export function revealRoofMesh(layer, mesh, rasters, now) {
  if (mesh.program.uniforms.roofTexture && !rasters.length) mesh._roofRevealed = true;
  if (mesh.program.uniforms.roofTexture && !mesh._roofRevealed && rasters.length) {
    if (walkByMap.get(layer._map)?.control?._walk?.saved) {
      mesh._roofRevealed = true;
      mesh.fadeStart = now - (mesh.fadeDuration || 0);
    }
    if (mesh._roofCoverageSignature !== roofRasterByLayer.get(layer)?.signature) {
      mesh._roofCoverageSignature = roofRasterByLayer.get(layer)?.signature;
      mesh._roofCovered = roofCoverage(mesh, layer, rasters);
    }
    if (!mesh._roofRevealed && !mesh._roofCovered &&
      rasters.some(raster => !headerByLayer.get(raster) || loadingTilesByLayer.get(raster) > 0)) {
      mesh._appearance = 0;
      return false;
    }
    mesh._roofRevealed = true;
  }
  return true;
}
