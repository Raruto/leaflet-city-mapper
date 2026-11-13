/**
 * Measure the path from a segment point until it turns about 45 degrees from that segment.
 *
 * @param {Array} path Tile-coordinate points.
 * @param {number} i Segment end index.
 * @param {Array<number>} point Point on the segment.
 * @param {number} step Direction along the path, 1 or -1.
 *
 * @returns {number} Straight-run distance.
 */
export function vectorStraightRun(path, i, point, step) {
  const base = Math.atan2(path[i][1] - path[i - 1][1], path[i][0] - path[i - 1][0]);
  let j = step > 0 ? i : i - 1, previous = point, run = 0, next;
  while (j >= 0 && j < path.length) {
    run += Math.hypot(path[j][0] - previous[0], path[j][1] - previous[1]);
    previous = path[j];
    next = j + step;
    if (next < 0 || next >= path.length) break;
    if (Math.cos(Math.atan2(path[next][1] - path[j][1], path[next][0] - path[j][0]) - base + (step < 0 ? Math.PI : 0)) < 0.7) break;
    j = next;
  }
  return run;
}
