import { imageStates } from '../globals/imageStates.js';


import { refreshNativeLayer } from './refreshNativeLayer.js';

export function nativeImageRefresh(event) {
  const states = imageStates.get(event.currentTarget);
  if (!states) return;
  let state;
  for (state of states) refreshNativeLayer(state);
}
