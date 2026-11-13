import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { trafficByLayer } from '../weakmaps/trafficByLayer.js';
import { collideTrip } from './collideTrip.js';
import { trafficBounds } from './trafficBounds.js';

/**
 * Test a walker point or movement ray against oriented traffic bounds, updating the nearest hit in data.
 *
 * @param {L.Layer} layer Traffic layer.
 * @param {number} x Walker world-space x coordinate.
 * @param {number} y Walker world-space feet height.
 * @param {number} z Walker world-space z coordinate.
 * @param {number} dx Movement direction x.
 * @param {number} dz Movement direction z.
 * @param {number} reach Movement distance, or zero to test overlap.
 * @param {Object} data Reusable hit record, updated when a collision is found.
 *
 * @returns {boolean} Whether a collision was found.
 */
export function trafficCollision(layer, x, y, z, dx, dz, reach, data) {
  const state = trafficByLayer.get(layer);
  if (!state?.mesh || !state.trips.length) return false;
  const root = rootByLayer.get(layer), bounds = trafficBounds(state);
  let trip;
  for (trip of state.trips) {
    collideTrip(state, trip, root, bounds, x, y, z, dx, dz, reach, data);
    if (!reach && data.found) break;
  }
  return data.found;
}
