import { terrainElevation } from '../terrain/terrainElevation.js';
import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';

/**
 * Sample terrain from a current native grid request at the given tile.
 *
 * @param {Object} state Terrain stream state.
 * @param {Object} point Projected point to sample.
 * @param {number} x Tile column.
 * @param {number} y Tile row.
 * @param {number} z Tile zoom.
 *
 * @returns {number|null} Elevation, or null if no current sample is available.
 */
export function nativeTerrainElevation(state, point, x, y, z) {
  let layer, native, request, elevation;
  const key = `${x}:${y}:${z}`;
  for (layer of Object.values(state.map._layers)) {
    native = nativeGPUByLayer.get(layer);
    if (native?.disposed || native?.terrainStream !== state) continue;
    request = native.terrainRequests?.get(key);
    if (!request?.tiles || layer._tiles[key] !== request.tile) continue;
    elevation = terrainElevation(point, request.tiles);
    if (Number.isFinite(elevation)) return elevation;
  }
  return null;
}
