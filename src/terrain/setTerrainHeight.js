import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';


import { getElevation } from './getElevation.js';

export function setTerrainHeight(layer) {
  if (!sceneByLayer.get(layer).root || !sceneByLayer.get(layer).location) return;
  sceneByLayer.get(layer)._terrainBaseY ??= sceneByLayer.get(layer).root.position[1];
  const terrain = cameraByMap.get(layer._map)?._terrain3D;
  const elevation = terrain && getElevation(terrain, sceneByLayer.get(layer).location);
  const offset = Number.isFinite(elevation) ? layer.options.terrainOffset ?? 0 : 0;
  sceneByLayer.get(layer).root.position[1] = sceneByLayer.get(layer)._terrainBaseY + (elevation ?? 0) + offset;
}
