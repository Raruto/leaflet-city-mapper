import { sceneByLayer } from '../globals/sceneByLayer.js';


import { nativeImageRefresh } from './nativeImageRefresh.js';
import { nativeImageError } from './nativeImageError.js';
import { removeImageState } from './removeImageState.js';
import { addImageState } from './addImageState.js';
import { update } from '../scene/update.js';
import { hideTargets } from './hideTargets.js';

export function refreshNativeLayer(state = this) {
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
  if (sceneByLayer.get(state.backend)._shared) update(state.backend);
}
