import { state as sharedState } from '../state.js';

import { refreshNativeLayer } from './refreshNativeLayer.js';

export function nativeImageRefresh(event) {
  const states = sharedState.imageStates.get(event.currentTarget);
  if (!states) return;
  let state;
  for (state of states) refreshNativeLayer(state);
}
