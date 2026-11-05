import { state as sharedState } from '../state.js';

import { update as updateScene } from '../scene/update.js';

export function render(map) {
  const renderer = sharedState.renderers.get(map);
  if (renderer) updateScene(renderer);
}
