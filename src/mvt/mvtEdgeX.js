export function mvtEdgeX(edge, y) {
  return edge[0][0] + (y - edge[0][1]) *
    (edge[1][0] - edge[0][0]) / (edge[1][1] - edge[0][1]);
}
