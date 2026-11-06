import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { terrainPromiseByLayer } from '../weakmaps/terrainPromiseByLayer.js';

export function terrainPromiseOf(map) {
  return terrainPromiseByLayer.get(terrain3DByMap.get(map));
}
