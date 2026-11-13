import { renderers } from '../weakmaps/renderers.js';
import { update as updateScene } from '../scene/scheduleSceneUpdate.js';

/**
 * Schedule a scene update if the map has a shared renderer.
 *
 * @param {L.Map} map Map whose scene should update.
 */
export function render(map) {
  const renderer = renderers.get(map);
  if (renderer) updateScene(renderer);
}
