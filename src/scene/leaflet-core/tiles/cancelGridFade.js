import { indexState } from '../../layers/constants/indexState.js';

export function cancelGridFade(layer) {
  indexState.pendingGridFades.delete(layer);
  layer._fadeFrame = null;
  if (!indexState.pendingGridFades.size && indexState.gridFadeFrame !== null) {
    cancelAnimationFrame(indexState.gridFadeFrame);
    indexState.gridFadeFrame = null;
  }
}
