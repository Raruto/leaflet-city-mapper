import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';

/**
 * Find the map's archive terrain if it is ready.
 *
 * @param {L.Map} map Map to inspect.
 *
 * @returns {L.Layer|false|undefined} Ready terrain or a falsy value.
 */
export function readyTerrainOf(map) {
  const terrain = terrain3DByMap.get(map);
  return terrainReadyByLayer.get(terrain) && terrain;
}
