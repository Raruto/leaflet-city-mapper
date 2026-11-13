import { imageStates } from '../weakmaps/imageStates.js';

/**
 * Associate a native layer state with an image.
 *
 * @param {HTMLImageElement} image Image to track.
 * @param {Object} state Native layer state.
 */
export function addImageState(image, state) {
  let states = imageStates.get(image);
  if (!states) imageStates.set(image, states = /* alloc */ new Set());
  states.add(state);
}
