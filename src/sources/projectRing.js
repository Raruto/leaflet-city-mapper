import { rootByLayer } from '../weakmaps/rootByLayer.js';

import { L } from '../globals/L.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';

export function projectRing(context, ring) {
  const { backend: layer, crs, origin, metres, map } = context;
  if (ring.length < 4) throw /* alloc */ new Error('Invalid GeoJSON polygon ring');
  const path = /* alloc */ [];
  const root = rootByLayer.get(layer);
  let i, lng, lat, location, point, elevation;
  for (i = 0; i < ring.length - 1; i++) {
    lng = ring[i][0], lat = ring[i][1];
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) throw /* alloc */ new Error('Invalid GeoJSON coordinates');
    location = /* alloc */ new L.LatLng(lat, lng);
    point = crs.project(location);
    elevation = mapElevationOf(map, location);
    path.push(/* alloc */ {
      x: (point.x - origin.x) * metres,
      y: (point.y - origin.y) * metres,
      ground: Number.isFinite(elevation) && Number.isFinite(root.position[1])
        ? elevation - root.position[1] : 0,
    });
  }
  return path;
}
