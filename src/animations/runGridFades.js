import { fadeFrameByLayer } from '../weakmaps/fadeFrameByLayer.js';

import { gridFadeFrame } from '../globals/gridFadeFrame.js';
import { pendingGridFades } from '../globals/pendingGridFades.js';



import { updateGridOpacity } from '../core/updateGridOpacity.js';

export function runGridFades() {
  gridFadeFrame.value = null;
  const layers = /* alloc */ [...pendingGridFades];
  let layer, version;
  for ([layer, version] of layers) {
    if (pendingGridFades.get(layer) !== version) continue;
    pendingGridFades.delete(layer);
    fadeFrameByLayer.set(layer, null);
    updateGridOpacity.call(layer);
  }
}
