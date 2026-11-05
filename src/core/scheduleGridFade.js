import { sceneByLayer } from '../globals/sceneByLayer.js';
import { pendingGridFades } from '../globals/pendingGridFades.js';
import { gridFadeFrame } from '../globals/gridFadeFrame.js';



import { runGridFades } from './runGridFades.js';

export function scheduleGridFade(layer) {
  sceneByLayer.get(layer)._fadeVersion = (sceneByLayer.get(layer)._fadeVersion || 0) + 1;
  pendingGridFades.set(layer, sceneByLayer.get(layer)._fadeVersion);
  if (gridFadeFrame.value === null) gridFadeFrame.value = requestAnimationFrame(runGridFades);
  sceneByLayer.get(layer)._fadeFrame = gridFadeFrame.value;
}
