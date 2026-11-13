import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { pendingZoomAnimations } from '../globals/pendingZoomAnimations.js';
import { render } from '../rendering/render.js';

/** Render the next queued zoom layer if it owns an initialized renderer. */
export function renderPendingZoomAnimation() {
  const layer = pendingZoomAnimations.shift();
  if (sharedByLayer.get(layer) === layer && rendererByLayer.get(layer)) render(layer);
}
