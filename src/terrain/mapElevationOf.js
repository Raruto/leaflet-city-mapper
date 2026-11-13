import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { getElevation } from './getElevation.js';
import { gridTerrainElevation } from '../native/gridTerrainElevation.js';

/**
 * Sample the map's archive or streamed terrain at a location.
 *
 * @param {L.Map} map Map containing terrain.
 * @param {L.LatLng|L.Point} location Location to sample.
 *
 * @returns {number|null|undefined} Elevation in metres, or a nullish value when unavailable.
 */
export function mapElevationOf(map, location) {
  const terrain = terrain3DByMap.get(map);
  if (terrain) return getElevation(terrain, location);
  const stream = streamTerrainByMap.get(map);
  return stream && gridTerrainElevation(stream, location);
}
