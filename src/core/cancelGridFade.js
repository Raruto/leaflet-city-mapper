import { fadeFrameByLayer } from '../weakmaps/fadeFrameByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { pendingGridFades } from '../globals/pendingGridFades.js';
import { gridFadeFrame } from '../globals/gridFadeFrame.js';



export function cancelGridFade(layer) {
  pendingGridFades.delete(layer);
  mutateWeakMap(fadeFrameByLayer, layer, "=", null);
  if (!pendingGridFades.size && gridFadeFrame.value !== null) {
    cancelAnimationFrame(gridFadeFrame.value);
    gridFadeFrame.value = null;
  }
}
