import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';
import { rasterVersionByLayer } from '../weakmaps/rasterVersionByLayer.js';
import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';
import { L } from '../globals/L.js';
import { roofSignatures } from '../globals/roofSignatures.js';
import { rebuildRoofAtlas } from './rebuildRoofAtlas.js';

/**
 * Rebuild a changed roof atlas, throttling updates while raster tiles are loading.
 *
 * @param {L.Layer} layer Rendering layer owning the atlas.
 * @param {Array<L.Layer>} rasters Raster layers included in the atlas.
 * @param {number} now Current frame time in milliseconds.
 */
export function updateRoofAtlas(layer, rasters, now) {
  const signatures = roofSignatures;
  signatures.length = 0;
  let loading = false, rasterLayer;
  for (rasterLayer of rasters) {
    signatures.push(`${L.Util.stamp(rasterLayer)}:${rasterVersionByLayer.get(rasterLayer) || 0}:${rasterLayer.options.opacity}:${rasterLayer.options.zIndex}`);
    loading ||= Boolean(loadingTilesByLayer.get(rasterLayer));
  }
  const signature = signatures.join('|');
  signatures.length = 0;
  if (!roofRasterByLayer.get(layer) || roofRasterByLayer.get(layer).signature !== signature &&
    (!loading || now - roofRasterByLayer.get(layer).updatedAt >= 50)) {
    rebuildRoofAtlas(layer, rasters, signature, now);
  }
}
