import { finiteMvtCoordinate } from './finiteMvtCoordinate.js';

export function collectMvtEdges(rings, edges, levels) {
  let ring, i, a, b;
  for (ring of rings) {
    if (ring.length < 4 || ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) {
      throw /* alloc */ new Error('MVT tessellation requires closed rings');
    }
    for (i = 1; i < ring.length; i++) {
      a = ring[i - 1];
      b = ring[i];
      if (!finiteMvtCoordinate(a) || !finiteMvtCoordinate(b)) {
        throw /* alloc */ new Error('Invalid MVT ring coordinate');
      }
      levels.add(a[1]);
      if (a[1] !== b[1]) edges.push(/* alloc */ [a[1] < b[1] ? a : b, a[1] < b[1] ? b : a]);
    }
  }
}
