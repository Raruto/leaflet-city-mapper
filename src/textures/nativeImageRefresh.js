import { imageStates } from '../weakmaps/imageStates.js';


import { refreshNativeLayer } from '../native/refreshNativeLayer.js';

export function nativeImageRefresh(event) {
  const states = imageStates.get(event.currentTarget);
  if (!states) return;
  let state;
  for (state of states) refreshNativeLayer(state);
}
