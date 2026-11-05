import { indexState } from '../../layers/constants/indexState.js';
import { runGridFades } from './runGridFades.js';

export function scheduleGridFade(layer) {
  layer._fadeVersion = (layer._fadeVersion || 0) + 1;
  indexState.pendingGridFades.set(layer, layer._fadeVersion);
  if (indexState.gridFadeFrame === null) indexState.gridFadeFrame = requestAnimationFrame(runGridFades);
  layer._fadeFrame = indexState.gridFadeFrame;
}
