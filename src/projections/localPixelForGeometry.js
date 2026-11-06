import { geometryPixelStates } from '../globals/geometryPixelStates.js';

import { localPixel } from './localPixel.js';

export function localPixelForGeometry(point) {
  return localPixel(geometryPixelStates[geometryPixelStates.length - 1], point);
}
