import { geometryPixelStates } from '../globals/geometryPixelStates.js';

import { localPixel } from './localPixel.js';

export function localPixelForGeometry(point, anchor) {
  const state = geometryPixelStates[geometryPixelStates.length - 1];
  if (anchor && state.strokeAnchors) state.strokeAnchors.push(...localPixel(state, anchor));
  return localPixel(state, point);
}
