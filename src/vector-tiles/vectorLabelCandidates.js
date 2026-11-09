import { compareVectorLabelPriority } from './compareVectorLabelPriority.js';

export function vectorLabelCandidates(layer) {
  const candidates = /* alloc */ [];
  let tile, label;
  for (tile of layer.tiles.values()) {
    if (!tile.needed || !tile.labelCandidates) continue;
    for (label of tile.labelCandidates) candidates.push(label);
  }
  return candidates.sort(compareVectorLabelPriority);
}
