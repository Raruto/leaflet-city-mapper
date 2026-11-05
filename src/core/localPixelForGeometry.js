import { state as sharedState } from '../state.js';
import { localPixel } from './localPixel.js';

export function localPixelForGeometry(point) {
  return localPixel(sharedState.geometryPixelStates[sharedState.geometryPixelStates.length - 1], point);
}
