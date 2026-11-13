import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';
import { addRasterTile } from './addRasterTile.js';

/**
 * Register a current loaded raster tile with its terrain layer, reporting attachment errors.
 *
 * @param {L.Layer} layer Raster layer.
 * @param {Object} coords Tile coordinates.
 * @param {Object} tile Loaded raster tile.
 *
 * @returns {Promise<void>} Completion of the registration attempt.
 */
export async function registerTerrainTile(layer, coords, tile) {
  if (terrain3DByLayer.get(layer) && tile.done && !tile.request.signal.aborted &&
    rasterTilesByLayer.get(layer).get(`${coords.z}/${coords.x}/${coords.y}`) === tile) {
    try {
      await addRasterTile(terrain3DByLayer.get(layer), layer, coords, tile);
    } catch (error) {
      layer.fire('tileerror', /* alloc */ { tile, coords, error });
    }
  }
}
