import { getElevation } from '../terrain/getElevation.js';

export function groundTraffic(state) {
  const { layer, lanes } = state;
  const terrain = layer._map._terrain3D?._terrainReady && layer._map._terrain3D, base = layer.root.position[1];
  let lane, i, elevation;
  for (lane of lanes) {
    for (i = 0; i < lane.points.length; i++) {
      elevation = terrain && (lane.elevation ?? getElevation(terrain, lane.latlngs[i]));
      lane.points[i][2] = Number.isFinite(elevation) && Number.isFinite(base) ? elevation - base : 0;
    }
  }
  state.lanesDirty = true;
  state.nextCheck = -Infinity;
}
