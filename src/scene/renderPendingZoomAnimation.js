import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { render } from '../rendering/render.js';

export function renderPendingZoomAnimation() {
  const layer = sharedState.pendingZoomAnimations.shift();
  if (pluginState(layer)._shared === layer && pluginState(layer).renderer) render(layer);
}
