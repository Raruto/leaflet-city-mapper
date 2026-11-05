import { localPosition } from './localPosition.js';

export function localPixel(state, point) {
  return localPosition(state, state.map.unproject(point));
}
