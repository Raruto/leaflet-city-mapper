import { gridFadeFrame } from '../globals/gridFadeFrame.js';
import { pendingGridFades } from '../globals/pendingGridFades.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



import { updateGridOpacity } from './updateGridOpacity.js';

export function runGridFades() {
  gridFadeFrame.value = null;
  const layers = /* allocation: required -- Reentrant fade callbacks may reschedule layers; process only the starting frame snapshot. */ [...pendingGridFades];
  let layer, version;
  for ([layer, version] of layers) {
    if (pendingGridFades.get(layer) !== version) continue;
    pendingGridFades.delete(layer);
    sceneByLayer.get(layer)._fadeFrame = null;
    updateGridOpacity.call(layer);
  }
}
