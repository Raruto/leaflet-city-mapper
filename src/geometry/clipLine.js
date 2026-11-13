import { samePoint } from './samePoint.js';
import { clipSegment } from './clipSegment.js';

/**
 * Clip a geographic line to [west, south, east, north] without joining disjoint pieces.
 *
 * @param {Array<Array<number>>} line Geographic coordinates.
 * @param {Array<number>} bounds West, south, east and north.
 *
 * @returns {Array<Array<Array<number>>>} Clipped line pieces.
 */
export function clipLine(line, bounds) {
  const pieces = /* alloc */ [];
  let current;
  let i, segment;
  for (i = 1; i < line.length; i++) {
    if (samePoint(line[i - 1], line[i])) continue;
    segment = clipSegment(line[i - 1], line[i], bounds);
    if (!segment) {
      current = null;
      continue;
    }
    if (current && samePoint(current.at(-1), segment[0])) current.push(segment[1]);
    else {
      current = segment;
      pieces.push(current);
    }
  }
  return pieces;
}
