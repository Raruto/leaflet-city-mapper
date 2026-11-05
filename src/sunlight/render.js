import { cityMapper } from '../constants/cityMapper.js';
import { update as updateScene } from '../scene/update.js';

export function render(map) {
  const renderer = cityMapper.renderers.get(map);
  if (renderer) updateScene(renderer);
}
