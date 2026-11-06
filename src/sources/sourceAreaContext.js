import { locationByLayer } from '../weakmaps/locationByLayer.js';

import { radians } from '../globals/radians.js';


export function sourceAreaContext(layer, area, map) {
  const crs = map.options.crs, origin = crs.project(locationByLayer.get(layer));
  return /* alloc */ {
    backend: layer, area, map, crs, origin,
    metres: Math.cos(locationByLayer.get(layer).lat * radians),
    positions: /* alloc */ [],
    normals: /* alloc */ [],
    colors: /* alloc */ [],
    uvs: /* alloc */ [],
    featureFaces: /* alloc */ [],
    lights: /* alloc */ [],
    supports: /* alloc */ new Set(),
    skipped: 0,
  };
}
