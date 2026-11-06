import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';

export function readyTerrainOf(map) {
  const terrain = terrain3DByMap.get(map);
  return terrainReadyByLayer.get(terrain) && terrain;
}
