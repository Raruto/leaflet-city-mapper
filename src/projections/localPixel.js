import { localPosition } from './localPosition.js';

export function localPixel(state, point) {
  if (state.pixelProjection) {
    const { transformation, scale, origin, metres } = state.pixelProjection;
    const projected = transformation.untransform(point, scale);
    return /* alloc */ [(projected.x - origin.x) * metres, 0, -(projected.y - origin.y) * metres];
  }
  return localPosition(state, state.map.unproject(point));
}
