import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';
import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';
import { walkByMap } from '../weakmaps/walkByMap.js';
import { roofCoverage } from '../geometry/roofCoverage.js';

/**
 * Delay revealing a roof mesh while its uncovered raster imagery is still loading.
 *
 * @param {L.Layer} layer Rendering layer.
 * @param {Object} mesh Roof or other mesh being considered.
 * @param {Array<L.Layer>} rasters Raster layers used for roof coverage.
 * @param {number} now Current frame time in milliseconds.
 *
 * @returns {boolean} Whether the mesh may be drawn.
 */
export function revealRoofMesh(layer, mesh, rasters, now) {
  let raster, loading;
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
    loading = false;
    for (raster of rasters) {
      if (!headerByLayer.get(raster) || loadingTilesByLayer.get(raster) > 0) {
        loading = true;
        break;
      }
    }
    if (!mesh._roofRevealed && !mesh._roofCovered && loading) {
      mesh._appearance = 0;
      return false;
    }
    mesh._roofRevealed = true;
  }
  return true;
}
