import { L } from '../globals/L.js';
export function local([lng, lat, z], crs, origin, metres, base) {
  const p = crs.project(/* alloc */ new L.LatLng(lat, lng));
  return /* alloc */ [(p.x - origin.x) * metres, z - base, -(p.y - origin.y) * metres];
}
