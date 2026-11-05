import { localPixel } from './localPixel.js';
import { nativeLayerState } from '../constants/nativeLayerState.js';

export function localPixelForGeometry(point) {
  return localPixel(nativeLayerState.geometryPixelStates[nativeLayerState.geometryPixelStates.length - 1], point);
}
