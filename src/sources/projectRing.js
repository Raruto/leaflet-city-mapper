import { L } from '../globals/L.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { getElevation } from '../terrain/getElevation.js';

export function projectRing(context, ring) {
  const { backend, crs, origin, metres, map } = context;
  if (ring.length < 4) throw /* alloc */ new Error('Invalid GeoJSON polygon ring');
  const path = /* alloc */ [];
  let i, lng, lat, location, point, elevation;
  for (i = 0; i < ring.length - 1; i++) {
    lng = ring[i][0], lat = ring[i][1];
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) throw /* alloc */ new Error('Invalid GeoJSON coordinates');
    location = /* alloc */ new L.LatLng(lat, lng);
    point = crs.project(location);
    elevation = cameraByMap.get(map)._terrain3D ? getElevation(cameraByMap.get(map)._terrain3D, location) : undefined;
    path.push(/* alloc */ {
      x: (point.x - origin.x) * metres,
      y: (point.y - origin.y) * metres,
      ground: Number.isFinite(elevation) && Number.isFinite(sceneByLayer.get(backend).root.position[1])
        ? elevation - sceneByLayer.get(backend).root.position[1] : 0,
    });
  }
  return path;
}
