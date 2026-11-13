import { imageStates } from '../weakmaps/imageStates.js';
import { refreshNativeLayer } from '../native/refreshNativeLayer.js';

/**
 * Refresh all native layer states associated with an image event.
 *
 * @param {Event} event Image event.
 */
export function nativeImageRefresh(event) {
  const states = imageStates.get(event.currentTarget);
  if (!states) return;
  let state;
  for (state of states) refreshNativeLayer(state);
}
