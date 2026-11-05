import { pluginState } from './pluginState.js';
import { refreshNativeEvent } from './refreshNativeEvent.js';
import { updateNativeLayerView } from './updateNativeLayerView.js';
import { removeNativeEvents } from './removeNativeEvents.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { nativeImageRefresh } from './nativeImageRefresh.js';
import { nativeImageError } from './nativeImageError.js';
import { removeImageState } from './removeImageState.js';

export function disposeNativeLayer() {
  const state = this;
  const { source, map, backend, meshes, textures, images } = state;
  const events = 'load tileload tileunload move drag';
  source.off(events, refreshNativeEvent, state);
  map.off('zoomend', refreshNativeEvent, state);
  if (state.marker) map.off('move zoom rotate pitch resize viewreset', updateNativeLayerView, state);
  removeNativeEvents(state);
  state.refresh = state.reorder = null;
  let name, methods, mesh, texture, image;
  for ([name, methods] of state.methods) {
    if (methods.own) Object.defineProperty(source, name, methods.own);
    else delete source[name];
  }
  for (mesh of meshes.values()) disposeMesh(backend, mesh);
  meshes.clear();
  for (texture of textures.values()) destroyTexture(backend, texture.texture);
  textures.clear();
  for (image of images) {
    image.removeEventListener('load', nativeImageRefresh);
    image.removeEventListener('error', nativeImageError);
    removeImageState(image, state);
  }
  pluginState(backend)._beforeRender = null;
  backend.remove();
}
