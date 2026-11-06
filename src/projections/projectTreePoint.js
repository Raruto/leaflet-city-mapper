import { rootByLayer } from '../weakmaps/rootByLayer.js';

import { L } from '../globals/L.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';

export function projectedTree(context, lon, lat) {
  const { backend: layer, crs, origin, metres, map } = context;
  const location = /* alloc */ new L.LatLng(lat, lon);
  const point = crs.project(location);
  const elevation = mapElevationOf(map, location), root = rootByLayer.get(layer);
  return /* alloc */ {
    x: (point.x - origin.x) * metres,
    y: (point.y - origin.y) * metres,
    ground: Number.isFinite(elevation) && Number.isFinite(root.position[1])
      ? elevation - root.position[1] : 0,
  };
}
