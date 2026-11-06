import { rendererByLayer } from '../weakmaps/rendererByLayer.js';

import { L } from '../globals/L.js';


import { current } from './isCurrentNativeLayer.js';
import { syncGridLayer } from './syncGridLayer.js';
import { syncImageOverlay } from './syncImageOverlay.js';
import { syncMarker } from './syncMarker.js';
import { syncVectorLayer } from './syncVectorLayer.js';
import { pruneNativeResources } from './pruneNativeResources.js';

export function synchronizeNativeLayer(state) {
  const { source, meshes, textures } = state;
  if (!current(state) || !rendererByLayer.get(state.backend) || state.failed) return;
  if (!state.dirty && (!state.marker || !state.viewDirty)) return;
  state.dirty = false;
  state.viewDirty = false;
  let mesh, texture;
  for (mesh of meshes.values()) mesh._nativeUsed = false;
  for (texture of textures.values()) texture.used = false;
  if (source instanceof L.GridLayer) syncGridLayer(state);
  else if (source instanceof L.ImageOverlay) syncImageOverlay(state);
  else if (state.marker) syncMarker(state);
  else syncVectorLayer(state);
  pruneNativeResources(state);
}
