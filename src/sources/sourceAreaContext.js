import { radians } from '../globals/radians.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


export function sourceAreaContext(backend, area, map) {
  const crs = map.options.crs, origin = crs.project(sceneByLayer.get(backend).location);
  return /* alloc */ {
    backend, area, map, crs, origin,
    metres: Math.cos(sceneByLayer.get(backend).location.lat * radians),
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
