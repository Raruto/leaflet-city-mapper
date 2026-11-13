import { geometryPixelStates } from '../globals/geometryPixelStates.js';
import { localPixel } from './localPixel.js';

/**
 * Project a geometry point and optionally record its stroke anchor in the active pixel projection.
 *
 * @param {L.Point} point Geometry pixel.
 * @param {L.Point} [anchor] Optional stroke anchor.
 *
 * @returns {number[]} Local coordinates as [x, 0, z].
 */
export function localPixelForGeometry(point, anchor) {
  const state = geometryPixelStates[geometryPixelStates.length - 1];
  if (anchor && state.strokeAnchors) state.strokeAnchors.push(...localPixel(state, anchor));
  return localPixel(state, point);
}
