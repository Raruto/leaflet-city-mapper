import { pendingZoomAnimations } from '../globals/pendingZoomAnimations.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



import { render } from '../rendering/render.js';

export function renderPendingZoomAnimation() {
  const layer = pendingZoomAnimations.shift();
  if (sceneByLayer.get(layer)._shared === layer && sceneByLayer.get(layer).renderer) render(layer);
}
