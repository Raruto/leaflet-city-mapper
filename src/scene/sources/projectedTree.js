import { getElevation } from '../../terrain/getElevation.js';

export function projectedTree(context, lon, lat) {
  const { backend, crs, origin, metres, map } = context;
  const point = crs.project(new L.LatLng(lat, lon));
  const elevation = map._terrain3D ? getElevation(map._terrain3D, [lat, lon]) : undefined;
  return {
    x: (point.x - origin.x) * metres,
    y: (point.y - origin.y) * metres,
    ground: Number.isFinite(elevation) && Number.isFinite(backend.root.position[1])
      ? elevation - backend.root.position[1] : 0,
  };
}
