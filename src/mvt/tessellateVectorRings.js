import { addMvtCrossings } from './addMvtCrossings.js';
import { appendMvtBandTriangles } from './appendMvtBandTriangles.js';
import { collectMvtEdges } from './collectMvtEdges.js';
import { sortedMvtLevels } from './sortedMvtLevels.js';

/**
 * Tessellate closed polygon rings into even-odd horizontal bands.
 *
 * @param {Array} rings Closed tile-coordinate rings.
 *
 * @returns {Array} Triangle coordinate arrays.
 */
export function tessellateVectorRings(rings) {
  const edges = /* alloc */ [], levels = /* alloc */ new Set(), triangles = /* alloc */ [];
  let sorted, i = 1, top, bottom;
  collectMvtEdges(rings, edges, levels);
  addMvtCrossings(edges, levels);
  sorted = sortedMvtLevels(levels);
  // ponytail: quadratic edge scan; use a sweep-line index for large datasets.
  for (; i < sorted.length; i++) {
    top = sorted[i - 1];
    bottom = sorted[i];
    if (bottom > top) appendMvtBandTriangles(edges, top, bottom, triangles);
  }
  return triangles;
}
