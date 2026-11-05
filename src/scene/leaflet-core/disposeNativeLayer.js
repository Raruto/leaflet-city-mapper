import { refreshNativeEvent } from './refreshNativeEvent.js';
import { updateNativeLayerView } from './updateNativeLayerView.js';
import { removeNativeEvents } from './events/removeNativeEvents.js';
import { disposeMesh } from '../../rendering/meshes/disposeMesh.js';
import { destroyTexture } from '../../rendering/textures/destroyTexture.js';
import { nativeImageRefresh } from './images/nativeImageRefresh.js';
import { nativeImageError } from './images/nativeImageError.js';
import { removeImageState } from './images/removeImageState.js';

export function disposeNativeLayer() {
  const state = this;
  const { source, map, backend, meshes, textures, images } = state;
  const events = 'load tileload tileunload move drag';
  source.off(events, refreshNativeEvent, state);
  map.off('zoomend', refreshNativeEvent, state);
  if (state.marker) map.off('move zoom rotate pitch resize viewreset', updateNativeLayerView, state);
  removeNativeEvents(state);
  state.refresh = state.reorder = null;
  for (const [name, methods] of state.methods) {
    if (methods.own) Object.defineProperty(source, name, methods.own);
    else delete source[name];
  }
  for (const mesh of meshes.values()) disposeMesh(backend, mesh);
  meshes.clear();
  for (const texture of textures.values()) destroyTexture(backend, texture.texture);
  textures.clear();
  for (const image of images) {
    image.removeEventListener('load', nativeImageRefresh);
    image.removeEventListener('error', nativeImageError);
    removeImageState(image, state);
  }
  backend._beforeRender = null;
  backend.remove();
}
