import { renderers } from '../weakmaps/renderers.js';


import { update as updateScene } from '../scene/update.js';

export function render(map) {
  const renderer = renderers.get(map);
  if (renderer) updateScene(renderer);
}
