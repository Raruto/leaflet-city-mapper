import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrainBaseYByLayer } from '../weakmaps/terrainBaseYByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';




import { getElevation } from './getElevation.js';

export function setTerrainHeight(layer) {

  if (!rootByLayer.get(layer) || !locationByLayer.get(layer)) return;
  if (terrainBaseYByLayer.get(layer) == null) terrainBaseYByLayer.set(layer, rootByLayer.get(layer).position[1]);
  const terrain = terrain3DByMap.get(layer._map);
  const elevation = terrain && getElevation(terrain, locationByLayer.get(layer));
  const offset = Number.isFinite(elevation) ? layer.options.terrainOffset ?? 0 : 0;
  rootByLayer.get(layer).position[1] = terrainBaseYByLayer.get(layer) + (elevation ?? 0) + offset;
}
