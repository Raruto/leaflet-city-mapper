import { nativeImageRefresh } from './images/nativeImageRefresh.js';
import { nativeImageError } from './images/nativeImageError.js';
import { removeImageState } from './images/removeImageState.js';
import { addImageState } from './images/addImageState.js';
import { update } from '../lifecycle/update.js';

export function refreshNativeLayer(state = this) {
  state.dirty = true;
  state.viewDirty = true;
  state.failed = false;
  state.hide();
  const activeImages = [state.source._icon, state.source._shadow, state.source._image];
  for (const image of state.images) {
    if (activeImages.includes(image)) continue;
    image.removeEventListener('load', nativeImageRefresh);
    image.removeEventListener('error', nativeImageError);
    removeImageState(image, state);
    state.images.delete(image);
  }
  for (const image of activeImages) {
    if (!(image instanceof HTMLImageElement) || state.images.has(image)) continue;
    state.images.add(image);
    addImageState(image, state);
    image.addEventListener('load', nativeImageRefresh);
    image.addEventListener('error', nativeImageError);
  }
  if (state.backend._shared) update(state.backend);
}
