import { L } from '../globals/L.js';

/**
 * Project a geographic bridge point and its elevation into local scene coordinates.
 *
 * @param {number[]} coordinates Longitude, latitude and elevation.
 * @param {Object} crs Coordinate reference system.
 * @param {L.Point} origin Projected scene origin.
 * @param {number} metres Projection scale to local metres.
 * @param {number} base Scene base elevation.
 *
 * @returns {number[]} Local coordinates as [x, y, z].
 */
export function local([lng, lat, z], crs, origin, metres, base) {
  const p = crs.project(/* alloc */ new L.LatLng(lat, lng));
  return /* alloc */ [(p.x - origin.x) * metres, z - base, -(p.y - origin.y) * metres];
}
