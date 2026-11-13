import { copyTerrainTile } from './copyTerrainTile.js';

/**
 * Build a Float32 DEM atlas; missing samples retain the shader no-data sentinel.
 *
 * @param {Map} tiles DEM tiles keyed by x/y.
 * @param {L.Bounds} bounds Tile-coordinate bounds.
 *
 * @returns {Object} Atlas elevations and valid minimum and maximum values.
 */
export function terrainAtlas(tiles, bounds) {
  const columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
  const elevations = /* alloc */ new Float32Array(columns * rows * 65536).fill(-1e9);
  const atlas = /* alloc */ { elevations, low: Infinity, high: -Infinity };
  let key, values, coordinates, x, y, start;
  for ([key, values] of tiles) {
    coordinates = key.split('/');
    x = Number(coordinates[0]), y = Number(coordinates[1]);
    start = (y - bounds.min.y) * 256 * columns * 256 + (x - bounds.min.x) * 256;
    copyTerrainTile(atlas, values, start, columns);
  }
  return atlas;
}
