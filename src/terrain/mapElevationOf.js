import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { getElevation } from './getElevation.js';

export function mapElevationOf(map, location) {
  const terrain = terrain3DByMap.get(map);
  return terrain && getElevation(terrain, location);
}
