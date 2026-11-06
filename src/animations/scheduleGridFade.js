import { fadeFrameByLayer } from '../weakmaps/fadeFrameByLayer.js';
import { fadeVersionByLayer } from '../weakmaps/fadeVersionByLayer.js';

import { pendingGridFades } from '../globals/pendingGridFades.js';
import { gridFadeFrame } from '../globals/gridFadeFrame.js';



import { runGridFades } from './runGridFades.js';

export function scheduleGridFade(layer) {
  fadeVersionByLayer.set(layer, (fadeVersionByLayer.get(layer) || 0) + 1);
  pendingGridFades.set(layer, fadeVersionByLayer.get(layer));
  if (gridFadeFrame.value === null) gridFadeFrame.value = requestAnimationFrame(runGridFades);
  fadeFrameByLayer.set(layer, gridFadeFrame.value);
}
