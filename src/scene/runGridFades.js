import { indexState } from './constants/indexState.js';
import { updateGridOpacity } from './updateGridOpacity.js';

export function runGridFades() {
  indexState.gridFadeFrame = null;
  const layers = [...indexState.pendingGridFades];
  for (const [layer, version] of layers) {
    if (indexState.pendingGridFades.get(layer) !== version) continue;
    indexState.pendingGridFades.delete(layer);
    layer._fadeFrame = null;
    updateGridOpacity.call(layer);
  }
}
