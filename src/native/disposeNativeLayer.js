import { nativeRenderByLayer } from '../weakmaps/nativeRenderByLayer.js';
import { refreshNativeEvent } from './refreshNativeEvent.js';
import { updateNativeLayerView } from './updateNativeLayerView.js';
import { removeNativeEvents } from './removeNativeEvents.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { destroyTexture } from '../textures/destroyTexture.js';
import { nativeImageRefresh } from '../textures/nativeImageRefresh.js';
import { nativeImageError } from '../textures/nativeImageError.js';
import { removeImageState } from '../textures/removeImageState.js';

/**
 * Dispose the native layer state, restore source methods and release its resources.
 */
export function disposeNativeLayer() {
  const state = this;
  if (state.disposed) return;
  state.disposed = true;
  const { source, map, backend: layer, meshes, textures, images } = state;
  const events = 'load tileload tileunload move drag';
  source.off(events, refreshNativeEvent, state);
  map.off('zoomend terrainchange', refreshNativeEvent, state);
  if (state.marker) map.off('move zoom rotate pitch resize viewreset', updateNativeLayerView, state);
  removeNativeEvents(state);
  let name, methods, mesh, texture, image;
  for ([name, methods] of state.methods) {
    if (methods.own) Object.defineProperty(source, name, methods.own);
    else delete source[name];
  }
  for (mesh of meshes.values()) disposeMesh(layer, mesh);
  meshes.clear();
  for (texture of textures.values()) destroyTexture(layer, texture.texture);
  textures.clear();
  for (image of images) {
    image.removeEventListener('load', nativeImageRefresh);
    image.removeEventListener('error', nativeImageError);
    removeImageState(image, state);
  }
  nativeRenderByLayer.delete(layer);
  layer.remove();
}
