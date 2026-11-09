import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { getElevation } from './getElevation.js';
import { gridTerrainElevation } from '../native/gridTerrainElevation.js';

export function mapElevationOf(map, location) {
  const terrain = terrain3DByMap.get(map);
  if (terrain) return getElevation(terrain, location);
  const stream = streamTerrainByMap.get(map);
  return stream && gridTerrainElevation(stream, location);
}
