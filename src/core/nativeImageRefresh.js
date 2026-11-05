import { nativeLayerState } from '../constants/nativeLayerState.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';

export function nativeImageRefresh(event) {
  let state;
  for (state of nativeLayerState.imageStates.get(event.currentTarget) || []) refreshNativeLayer(state);
}
