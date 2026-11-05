import { nativeLayerState } from '../constants/nativeLayerState.js';

export function nativeImageError(event) {
  let state;
  for (state of nativeLayerState.imageStates.get(event.currentTarget) || []) {
    state.source.fire('error', { error: new Error('Unable to load native layer image') });
  }
}
