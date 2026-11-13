import { localPosition } from './localPosition.js';

/**
 * Convert a map pixel to local X/Z metres, using the cached pixel projection when available.
 *
 * @param {Object} state Projection state, including the map and optional pixel projection.
 * @param {L.Point} point Projected map pixel.
 *
 * @returns {number[]} Local coordinates as [x, 0, z].
 */
export function localPixel(state, point) {
  if (state.pixelProjection) {
    const { transformation, scale, origin, metres } = state.pixelProjection;
    const projected = transformation.untransform(point, scale);
    return /* alloc */ [(projected.x - origin.x) * metres, 0, -(projected.y - origin.y) * metres];
  }
  return localPosition(state, state.map.unproject(point));
}
