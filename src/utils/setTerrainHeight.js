import { getElevation } from './getElevation.js';

export function setTerrainHeight(layer) {
  if (!layer.root || !layer.location) return;
  layer._terrainBaseY ??= layer.root.position[1];
  const terrain = layer._map?._terrain3D;
  const elevation = terrain && getElevation(terrain, layer.location);
  const offset = Number.isFinite(elevation) ? layer.options.terrainOffset ?? 0 : 0;
  layer.root.position[1] = layer._terrainBaseY + (elevation ?? 0) + offset;
}
