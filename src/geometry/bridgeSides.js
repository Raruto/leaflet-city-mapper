import { bridgeEdge } from './bridgeEdge.js';

/**
 * Append the side faces of each bridge polygon ring.
 *
 * @param {Object} context Destination geometry buffers.
 * @param {Array<Array<number>>} points Flattened local bridge points.
 * @param {Array<Array>} rings Bridge rings defining point counts.
 */
export function bridgeSides(context, points, rings) {
  let start = 0, ring, i;
  for (ring of rings) {
    for (i = 0; i < ring.length; i++) {
      bridgeEdge(context, points[start + i], points[start + (i + 1) % ring.length]);
    }
    start += ring.length;
  }
}
