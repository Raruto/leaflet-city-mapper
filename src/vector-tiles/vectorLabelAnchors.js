import { vectorStraightRun } from './vectorStraightRun.js';

/**
 * Spread anchors along a path, recording segment ends and straight-run lengths.
 *
 * @param {Array} path Tile-coordinate points.
 * @param {number} spacing Desired anchor spacing.
 *
 * @returns {Array} Label anchors.
 */
export function vectorLabelAnchors(path, spacing) {
  const anchors = /* alloc */ [];
  let length = 0, i, walked, target, count, k, segment, t, point;
  for (i = 1; i < path.length; i++) length += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
  count = Math.max(1, Math.floor(length / spacing));
  i = 1; walked = 0;
  for (k = 0; k < count; k++) {
    target = (k + 0.5) * length / count;
    while (i < path.length - 1 && walked + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]) < target) {
      walked += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); i++;
    }
    segment = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    t = segment ? Math.min(1, Math.max(0, (target - walked) / segment)) : 0;
    point = /* alloc */ [
      path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t,
    ];
    anchors.push(/* alloc */ { point, a: path[i - 1], b: path[i],
      length: vectorStraightRun(path, i, point, 1) + vectorStraightRun(path, i, point, -1) });
  }
  return anchors;
}
