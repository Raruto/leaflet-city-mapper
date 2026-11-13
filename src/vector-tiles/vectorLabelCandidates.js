import { compareVectorLabelPriority } from './compareVectorLabelPriority.js';

/**
 * Collect candidates from needed tiles and sort them by label priority.
 *
 * @param {Object} layer Vector tile layer.
 *
 * @returns {Array} Sorted label candidates.
 */
export function vectorLabelCandidates(layer) {
  const candidates = /* alloc */ [];
  let tile, label;
  for (tile of layer.tiles.values()) {
    if (!tile.needed || !tile.labelCandidates) continue;
    for (label of tile.labelCandidates) candidates.push(label);
  }
  return candidates.sort(compareVectorLabelPriority);
}
