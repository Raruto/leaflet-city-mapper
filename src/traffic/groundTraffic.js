import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';


import { getElevation } from '../terrain/getElevation.js';

export function groundTraffic(state) {
  const { layer, lanes } = state;
  const terrain = sceneByLayer.get(cameraByMap.get(layer._map)._terrain3D)?._terrainReady && cameraByMap.get(layer._map)._terrain3D, base = sceneByLayer.get(layer).root.position[1];
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
