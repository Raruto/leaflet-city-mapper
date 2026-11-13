import { imageStates } from '../weakmaps/imageStates.js';

/**
 * Remove a native layer state from an image's tracked associations.
 *
 * @param {HTMLImageElement} image Image to update.
 * @param {Object} state Native layer state to remove.
 */
export function removeImageState(image, state) {
  const states = imageStates.get(image);
  if (!states) return;
  states.delete(state);
  if (!states.size) imageStates.delete(image);
}
