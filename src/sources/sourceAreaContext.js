import { pluginState } from '../core/pluginState.js';
export function sourceAreaContext(backend, area, map) {
  const crs = map.options.crs, origin = crs.project(pluginState(backend).location);
  return /* allocation: required -- Isolate geometry accumulation for each concurrent area build. */ {
    backend, area, map, crs, origin,
    metres: Math.cos(pluginState(backend).location.lat * Math.PI / 180),
    positions: /* allocation: required -- Keep this build's vertex positions independent. */ [],
    normals: /* allocation: required -- Keep this build's vertex normals independent. */ [],
    colors: /* allocation: required -- Keep this build's vertex colors independent. */ [],
    uvs: /* allocation: required -- Keep this build's texture coordinates independent. */ [],
    featureFaces: /* allocation: required -- Keep this build's picking ranges independent. */ [],
    lights: /* allocation: required -- Keep this build's light records independent. */ [],
    supports: /* allocation: required -- Keep deduplication scoped to this area build. */ new Set(),
    skipped: 0,
  };
}
