import { mvtEdgeX } from './mvtEdgeX.js';
import { sortMvtActiveEdges } from './sortMvtActiveEdges.js';

export function appendMvtBandTriangles(edges, top, bottom, triangles) {
  const mid = (top + bottom) / 2, active = /* alloc */ [];
  let edge, i = 0, leftTop, leftBottom, rightTop, rightBottom;
  for (edge of edges) {
    if (edge[0][1] < mid && edge[1][1] > mid) {
      active.push(/* alloc */ { edge, x: mvtEdgeX(edge, mid) });
    }
  }
  sortMvtActiveEdges(active);
  if (active.length % 2) throw /* alloc */ new Error('Unbalanced MVT polygon edges');
  for (; i < active.length; i += 2) {
    leftTop = mvtEdgeX(active[i].edge, top);
    leftBottom = mvtEdgeX(active[i].edge, bottom);
    rightTop = mvtEdgeX(active[i + 1].edge, top);
    rightBottom = mvtEdgeX(active[i + 1].edge, bottom);
    if (rightTop < leftTop - 1e-8 || rightBottom < leftBottom - 1e-8) {
      throw /* alloc */ new Error('Crossing MVT polygon edges');
    }
    if ((rightTop - leftTop) * (bottom - top) > 1e-6) {
      triangles.push(/* alloc */ [/* alloc */ [leftTop, top], /* alloc */ [rightTop, top],
        /* alloc */ [leftBottom, bottom]]);
    }
    if ((rightBottom - leftBottom) * (bottom - top) > 1e-6) {
      triangles.push(/* alloc */ [/* alloc */ [rightTop, top], /* alloc */ [rightBottom, bottom],
        /* alloc */ [leftBottom, bottom]]);
    }
  }
}
