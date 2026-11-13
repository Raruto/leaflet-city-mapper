import { L } from '../globals/L.js';

/**
 * Check whether an anchor belongs to the given area tile.
 *
 * @param {L.Map} map Map used to project the anchor.
 * @param {Object} coords Tile coordinates, if the area is tiled.
 * @param {number} lon Anchor longitude.
 * @param {number} lat Anchor latitude.
 *
 * @returns {boolean} Whether the anchor belongs to the area.
 */
export function matchesAreaTile(map, coords, lon, lat) {
  if (!coords) return true;
  const anchor = map.project(/* alloc */ new L.LatLng(lat, lon), coords.z);
  return Math.floor(anchor.x / 256) === coords.x && Math.floor(anchor.y / 256) === coords.y;
}
