import { mvtEdgeX } from './mvtEdgeX.js';

export function addMvtCrossings(edges, levels) {
  let i = 0, j, a, b, top, bottom, start, end;
  for (; i < edges.length; i++) {
    a = edges[i];
    for (j = i + 1; j < edges.length; j++) {
      b = edges[j];
      top = Math.max(a[0][1], b[0][1]);
      bottom = Math.min(a[1][1], b[1][1]);
      if (top >= bottom) continue;
      start = mvtEdgeX(a, top) - mvtEdgeX(b, top);
      end = mvtEdgeX(a, bottom) - mvtEdgeX(b, bottom);
      if (start * end < 0) levels.add(top + (bottom - top) * start / (start - end));
    }
  }
}
