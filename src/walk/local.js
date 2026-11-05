import { pluginState } from '../core/pluginState.js';
import { getElevation } from '../terrain/getElevation.js';

export function local(output) {
  const { layer, state } = this;
  const map = layer._map, crs = map.options.crs, origin = crs.project(pluginState(layer).location);
  const metres = Math.cos(pluginState(layer).location.lat * Math.PI / 180);
  const p = crs.project(state.latlng), terrain = pluginState(pluginState(map)._terrain3D)?._terrainReady && pluginState(map)._terrain3D;
  const ground = (terrain && getElevation(terrain, state.latlng)) || 0;
  output[0] = (p.x - origin.x) * metres;
  output[1] = ground - pluginState(layer).root.position[1];
  output[2] = -(p.y - origin.y) * metres;
  return output;
}
