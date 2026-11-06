import { rootByLayer } from '../weakmaps/rootByLayer.js';

import { readyTerrainOf } from '../terrain/readyTerrainOf.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';

export function groundTraffic(state) {
  const { layer, lanes } = state;
  const terrain = readyTerrainOf(layer._map);
  const base = rootByLayer.get(layer).position[1];
  let lane, i, elevation;
  for (lane of lanes) {
    for (i = 0; i < lane.points.length; i++) {
      elevation = terrain && (lane.elevation ?? mapElevationOf(layer._map, lane.latlngs[i]));
      lane.points[i][2] = Number.isFinite(elevation) && Number.isFinite(base) ? elevation - base : 0;
    }
  }
  state.lanesDirty = true;
  state.nextCheck = -Infinity;
}
