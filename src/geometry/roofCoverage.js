import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { tileZoomByLayer } from '../weakmaps/tileZoomByLayer.js';
import { roofFootprint } from './roofFootprint.js';
import { subtractRoofTile } from './subtractRoofTile.js';

/**
 * Test the mesh's ground footprint against loaded imagery, including coarse parent tiles.
 *
 * @param {Object} mesh Mesh whose footprint is tested.
 * @param {L.Layer} layer Rendering layer.
 * @param {Array<L.Layer>} rasters Raster layers to inspect.
 *
 * @returns {boolean} Whether the footprint is covered or needs no imagery.
 */
export function roofCoverage(mesh, layer, rasters) {
  let intersectsArchive = false, pending = false;
  let rasterLayer, footprint, remaining, tile;
  for (rasterLayer of rasters) {
    if (!headerByLayer.get(rasterLayer)) { pending = true; continue; }
    footprint = roofFootprint(mesh, layer, rasterLayer);
    if (!footprint) continue;
    intersectsArchive = true;
    remaining = /* alloc */ [footprint];
    for (tile of rasterTilesByLayer.get(rasterLayer).values()) {
      // Failed imagery already reports an error; do not hide the building indefinitely.
      if (!tile.done && !tile.error) continue;
      remaining = subtractRoofTile(remaining, tile, tileZoomByLayer.get(rasterLayer));
      if (!remaining.length) return true;
    }
  }
  return !intersectsArchive && !pending;
}
