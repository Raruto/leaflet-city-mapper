import { radians } from '../globals/radians.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';


import { getElevation } from '../terrain/getElevation.js';

export function local(output) {
  const { layer, state } = this;
  const map = layer._map, crs = map.options.crs, origin = crs.project(sceneByLayer.get(layer).location);
  const metres = Math.cos(sceneByLayer.get(layer).location.lat * radians);
  const p = crs.project(state.latlng), terrain = sceneByLayer.get(cameraByMap.get(map)._terrain3D)?._terrainReady && cameraByMap.get(map)._terrain3D;
  const ground = (terrain && getElevation(terrain, state.latlng)) || 0;
  output[0] = (p.x - origin.x) * metres;
  output[1] = ground + (state.height ?? 0) - sceneByLayer.get(layer).root.position[1];
  output[2] = -(p.y - origin.y) * metres;
  return output;
}
