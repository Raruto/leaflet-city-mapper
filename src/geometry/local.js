export function local([lng, lat, z], crs, origin, metres, base) {
  const p = crs.project(new L.LatLng(lat, lng));
  return [(p.x - origin.x) * metres, z - base, -(p.y - origin.y) * metres];
}
