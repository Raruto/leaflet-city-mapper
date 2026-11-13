import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';

/**
 * Collect completed, unaborted raster tiles with images for the roof atlas.
 *
 * @param {Array<L.Layer>} rasters Raster layers to inspect.
 * @param {Array<Object>} tiles Destination for tile and layer entries.
 *
 * @returns {number} Highest collected tile zoom, or negative infinity if none.
 */
export function collectRoofTiles(rasters, tiles) {
  let zoom = -Infinity, layer, tile;
  for (layer of rasters) {
    for (tile of rasterTilesByLayer.get(layer).values()) {
      if (tile.done && !tile.request.signal.aborted && tile.image) {
        tile._roofEntry ||= /* alloc */ { tile, layer };
        tiles.push(tile._roofEntry);
        zoom = Math.max(zoom, tile.coords.z);
      }
    }
  }
  return zoom;
}
