import { nativeLayerState } from './constants/nativeLayerState.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';

export function nativeImageRefresh(event) {
  for (const state of nativeLayerState.imageStates.get(event.currentTarget) || []) refreshNativeLayer(state);
}
