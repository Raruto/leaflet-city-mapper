import { L } from '../globals/L.js';
import { TILE_SIZE } from '../globals/TILE_SIZE.js';

/**
 * Get the raster tile dimensions.
 *
 * @returns {L.Point} Tile size in pixels.
 */
export function getRasterTileSize() {
  return /* alloc */ new L.Point(TILE_SIZE, TILE_SIZE);
}
