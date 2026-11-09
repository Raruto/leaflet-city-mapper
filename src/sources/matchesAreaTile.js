import { L } from '../globals/L.js';

export function matchesAreaTile(map, coords, lon, lat) {
  if (!coords) return true;
  const anchor = map.project(/* alloc */ new L.LatLng(lat, lon), coords.z);
  return Math.floor(anchor.x / 256) === coords.x && Math.floor(anchor.y / 256) === coords.y;
}
