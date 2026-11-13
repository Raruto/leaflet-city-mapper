import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { radians } from '../globals/radians.js';

/**
 * Create the projection and job context for building a source area.
 *
 * @param {L.Layer} layer Source layer.
 * @param {Object} area Area being built.
 * @param {L.Map} map Map supplying the CRS.
 *
 * @returns {Object} Area build context.
 */
export function sourceAreaContext(layer, area, map) {
  const crs = map.options.crs, origin = crs.project(locationByLayer.get(layer));
  return /* alloc */ {
    backend: layer, area, map, crs, origin,
    metres: Math.cos(locationByLayer.get(layer).lat * radians),
    jobs: /* alloc */ [],
    featureFaces: /* alloc */ [],
    skipped: 0,
  };
}
