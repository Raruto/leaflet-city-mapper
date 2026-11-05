import { pluginState } from '../core/pluginState.js';
import { getElevation } from './getElevation.js';

export function setTerrainHeight(layer) {
  if (!pluginState(layer).root || !pluginState(layer).location) return;
  pluginState(layer)._terrainBaseY ??= pluginState(layer).root.position[1];
  const terrain = pluginState(layer._map)?._terrain3D;
  const elevation = terrain && getElevation(terrain, pluginState(layer).location);
  const offset = Number.isFinite(elevation) ? layer.options.terrainOffset ?? 0 : 0;
  pluginState(layer).root.position[1] = pluginState(layer)._terrainBaseY + (elevation ?? 0) + offset;
}
