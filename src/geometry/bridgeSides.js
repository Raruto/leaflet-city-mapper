import { bridgeEdge } from './bridgeEdge.js';

export function bridgeSides(context, points, rings) {
  let start = 0, ring, i;
  for (ring of rings) {
    for (i = 0; i < ring.length; i++) {
      bridgeEdge(context, points[start + i], points[start + (i + 1) % ring.length]);
    }
    start += ring.length;
  }
}
