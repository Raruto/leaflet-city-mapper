import { pluginState } from './pluginState.js';
import { current } from './current.js';
import { syncGridLayer } from './syncGridLayer.js';
import { syncImageOverlay } from './syncImageOverlay.js';
import { syncMarker } from './syncMarker.js';
import { syncVectorLayer } from './syncVectorLayer.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { destroyTexture } from '../rendering/destroyTexture.js';

export function synchronizeNativeLayer(state) {
  const { source, meshes, textures } = state;
  if (!current(state) || !pluginState(state.backend).renderer || state.failed) return;
  if (!state.dirty && (!state.marker || !state.viewDirty)) return;
  state.dirty = false;
  state.viewDirty = false;
  let mesh, texture, key;
  for (mesh of meshes.values()) mesh._nativeUsed = false;
  for (texture of textures.values()) texture.used = false;
  if (source instanceof L.GridLayer) syncGridLayer(state);
  else if (source instanceof L.ImageOverlay) syncImageOverlay(state);
  else if (state.marker) syncMarker(state);
  else syncVectorLayer(state);
  for ([key, mesh] of meshes) {
    if (mesh._nativeUsed) continue;
    disposeMesh(state.backend, mesh);
    meshes.delete(key);
    texture = textures.get(key);
    if (texture) destroyTexture(state.backend, texture.texture);
    textures.delete(key);
  }
  for ([key, texture] of textures) {
    if (texture.used) continue;
    destroyTexture(state.backend, texture.texture);
    textures.delete(key);
  }
}
