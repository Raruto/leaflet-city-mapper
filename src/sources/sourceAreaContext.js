export function sourceAreaContext(backend, area, map) {
  const crs = map.options.crs, origin = crs.project(backend.location);
  return {
    backend, area, map, crs, origin,
    metres: Math.cos(backend.location.lat * Math.PI / 180),
    positions: [], normals: [], colors: [], uvs: [], featureFaces: [], lights: [],
    supports: new Set(), skipped: 0,
  };
}
