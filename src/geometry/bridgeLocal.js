export function local([lng, lat, z], crs, origin, metres, base) {
  const p = crs.project(/* allocation: required -- The CRS callback receives a geographic coordinate it may retain. */ new L.LatLng(lat, lng));
  return /* allocation: required -- The caller retains an independent bridge world vertex. */ [(p.x - origin.x) * metres, z - base, -(p.y - origin.y) * metres];
}
