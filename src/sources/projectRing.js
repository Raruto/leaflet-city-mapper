import { pluginState } from '../core/pluginState.js';
import { getElevation } from '../terrain/getElevation.js';

export function projectRing(context, ring) {
  const { backend, crs, origin, metres, map } = context;
  if (ring.length < 4) throw /* allocation: required -- Preserve the failure stack for invalid polygon rings. */ new Error('Invalid GeoJSON polygon ring');
  const path = /* allocation: required -- Keep projected ring points private to this in-flight area build. */ [];
  let i, lng, lat, location, point, elevation;
  for (i = 0; i < ring.length - 1; i++) {
    lng = ring[i][0], lat = ring[i][1];
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) throw /* allocation: required -- Preserve the failure stack for invalid ring coordinates. */ new Error('Invalid GeoJSON coordinates');
    location = /* allocation: required -- Keep projection inputs isolated for this ring vertex. */ new L.LatLng(lat, lng);
    point = crs.project(location);
    elevation = pluginState(map)._terrain3D ? getElevation(pluginState(map)._terrain3D, location) : undefined;
    path.push(/* allocation: required -- Retain the distinct projected point for this polygon mesh. */ {
      x: (point.x - origin.x) * metres,
      y: (point.y - origin.y) * metres,
      ground: Number.isFinite(elevation) && Number.isFinite(pluginState(backend).root.position[1])
        ? elevation - pluginState(backend).root.position[1] : 0,
    });
  }
  return path;
}
