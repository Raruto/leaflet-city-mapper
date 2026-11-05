import { getElevation } from '../../terrain/getElevation.js';

export function projectRing(context, ring) {
  const { backend, crs, origin, metres, map } = context;
  if (ring.length < 4) throw new Error('Invalid GeoJSON polygon ring');
  const path = [];
  for (const [lng, lat] of ring.slice(0, -1)) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) throw new Error('Invalid GeoJSON coordinates');
    const point = crs.project(new L.LatLng(lat, lng));
    const elevation = map._terrain3D ? getElevation(map._terrain3D, [lat, lng]) : undefined;
    path.push({
      x: (point.x - origin.x) * metres,
      y: (point.y - origin.y) * metres,
      ground: Number.isFinite(elevation) && Number.isFinite(backend.root.position[1])
        ? elevation - backend.root.position[1] : 0,
    });
  }
  return path;
}
