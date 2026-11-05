import { pendingGridFades } from '../globals/pendingGridFades.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { gridFadeFrame } from '../globals/gridFadeFrame.js';



export function cancelGridFade(layer) {
  pendingGridFades.delete(layer);
  sceneByLayer.get(layer)._fadeFrame = null;
  if (!pendingGridFades.size && gridFadeFrame.value !== null) {
    cancelAnimationFrame(gridFadeFrame.value);
    gridFadeFrame.value = null;
  }
}
