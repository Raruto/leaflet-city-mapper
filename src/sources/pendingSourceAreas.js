import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { compareDistance } from '../utils/compareDistance.js';

/**
 * Gather unstarted, unaborted source areas in order of distance from the map center.
 *
 * @param {Array<L.Layer>} layers Source layers.
 * @param {L.Map} map Map providing the view center and projection.
 *
 * @returns {Array<Object>} Pending layer and area entries with distances.
 */
export function pendingSourceAreas(layers, map) {
  const pending = /* alloc */ [];
  let layer, area, center;
  for (layer of layers) {
    for (area of areasByLayer.get(layer).values()) {
      if (area.started || area.request.signal.aborted) continue;
      center = area.coords && map.project(map.getCenter(), area.coords.z).divideBy(256);
      pending.push(/* alloc */ {
        layer, area,
        distance: center
          ? Math.hypot(area.coords.x + 0.5 - center.x, area.coords.y + 0.5 - center.y) / 2 ** area.coords.z : 0,
      });
    }
  }
  pending.sort(compareDistance);
  return pending;
}
