import { getElevation } from '../terrain/getElevation.js';

export function local() {
  const { layer, state } = this;
  const map = layer._map, crs = map.options.crs, origin = crs.project(layer.location);
  const metres = Math.cos(layer.location.lat * Math.PI / 180);
  const p = crs.project(state.latlng), terrain = map._terrain3D?._terrainReady && map._terrain3D;
  const ground = (terrain && getElevation(terrain, state.latlng)) || 0;
  return [(p.x - origin.x) * metres, ground - layer.root.position[1], -(p.y - origin.y) * metres];
}
