export function localPosition(state, latlng) {
  const { map, backend } = state, crs = map.options.crs;
  const origin = crs.project(backend.location), point = crs.project(latlng);
  const metres = Math.cos(backend.location.lat * Math.PI / 180);
  return [(point.x - origin.x) * metres, 0, -(point.y - origin.y) * metres];
}
