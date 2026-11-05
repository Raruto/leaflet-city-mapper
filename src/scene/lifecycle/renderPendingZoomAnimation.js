import { onZoomAnimState } from './constants/onZoomAnimState.js';
import { render } from '../../rendering/render.js';

export function renderPendingZoomAnimation() {
  const layer = onZoomAnimState.pendingZoomAnimations.shift();
  if (layer._shared === layer && layer.renderer) render(layer);
}
