import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { nativeImageRefresh } from '../textures/nativeImageRefresh.js';
import { nativeImageError } from '../textures/nativeImageError.js';
import { removeImageState } from '../textures/removeImageState.js';
import { addImageState } from '../textures/addImageState.js';
import { update } from '../scene/scheduleSceneUpdate.js';
import { hideTargets } from './hideTargets.js';

/**
 * Mark a native layer dirty, synchronize image listeners and schedule rendering.
 *
 * @param {Object} state Native layer state, defaulting to the bound context.
 */
export function refreshNativeLayer(state = this) {
  state.zoomOnly = false;
  state.dirty = true;
  state.viewDirty = true;
  state.failed = false;
  hideTargets(state);
  const source = state.source;
  let i, image;
  for (image of state.images) {
    if (image === source._icon || image === source._shadow || image === source._image) continue;
    image.removeEventListener('load', nativeImageRefresh);
    image.removeEventListener('error', nativeImageError);
    removeImageState(image, state);
    state.images.delete(image);
  }
  for (i = 0; i < 3; i++) {
    image = i === 0 ? source._icon : i === 1 ? source._shadow : source._image;
    if (!(image instanceof HTMLImageElement) || state.images.has(image)) continue;
    state.images.add(image);
    addImageState(image, state);
    image.addEventListener('load', nativeImageRefresh);
    image.addEventListener('error', nativeImageError);
  }
  if (sharedByLayer.get(state.backend)) update(state.backend);
}
