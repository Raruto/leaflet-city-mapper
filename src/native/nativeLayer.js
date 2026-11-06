import { nativeGPUBackByMap } from '../weakmaps/nativeGPUBackByMap.js';
import { nativeGPUOrderByMap } from '../weakmaps/nativeGPUOrderByMap.js';

import { L } from '../globals/L.js';
import { nativeMethodHandlers } from '../globals/nativeMethodHandlers.js';
import { nativeRenderByLayer } from '../weakmaps/nativeRenderByLayer.js';

import { createLayer } from '../scene/createLayer.js';


import { createMesh } from '../rendering/createMesh.js';
import { destroyTexture } from '../textures/destroyTexture.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { nativeGeometry } from '../geometry/nativeGeometry.js';
import { nativeEvents } from './nativeEvents.js';
import { removeNativeEvents } from './removeNativeEvents.js';
import { parseColor } from '../colors/parseColor.js';
import { update } from '../scene/scheduleSceneUpdate.js';

import { current } from './isCurrentNativeLayer.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';
import { refreshNativeEvent } from './refreshNativeEvent.js';
import { reorderNativeLayer } from './reorderNativeLayer.js';
import { nativeSetLatLng } from './nativeSetLatLng.js';
import { nativeSetLatLngs } from './nativeSetLatLngs.js';
import { nativeAddLatLng } from './nativeAddLatLng.js';
import { nativeSetRadius } from './nativeSetRadius.js';
import { nativeSetStyle } from './nativeSetStyle.js';
import { nativeRedraw } from './nativeRedraw.js';
import { nativeSetIcon } from './nativeSetIcon.js';
import { nativeSetUrl } from './nativeSetUrl.js';
import { nativeSetBounds } from './nativeSetBounds.js';
import { nativeSetOpacity } from './nativeSetOpacity.js';
import { nativeSetZIndex } from './nativeSetZIndex.js';
import { nativeSetZIndexOffset } from './nativeSetZIndexOffset.js';
import { nativeBringToFront } from './nativeBringToFront.js';
import { nativeBringToBack } from './nativeBringToBack.js';
import { disposeNativeLayer } from './disposeNativeLayer.js';
import { resolveNativeReady } from './resolveNativeReady.js';
import { rejectNativeReady } from './rejectNativeReady.js';
import { forwardNativeError } from './forwardNativeError.js';
import { updateNativeLayerView } from './updateNativeLayerView.js';
import { synchronizeNativeLayer } from './synchronizeNativeLayer.js';
import { beforeNativeRender } from './beforeNativeRender.js';

/** Render from coordinates and detached raster sources; only accessible marker controls remain DOM. */
export async function nativeLayer(state) {
  const { source, map } = state;
  const layer = state.backend = createLayer(/* alloc */ {
    source: /* alloc */ { type: '3d' },
  });
  state.meshes = /* alloc */ new Map();
  state.textures = /* alloc */ new Map();
  state.methods = /* alloc */ new Map();
  state.originalMethods = /* alloc */ new Map();
  state.images = /* alloc */ new Set();
  if (!nativeGPUOrderByMap.get(map)) nativeGPUOrderByMap.set(map, 0);
  if (!nativeGPUBackByMap.get(map)) nativeGPUBackByMap.set(map, 0);
  state.dirty = true;
  state.viewDirty = true;
  state.failed = false;
  state.order = nativeGPUOrderByMap.get(map) + 1;
  nativeGPUOrderByMap.set(map, state.order);
  state.marker = source instanceof L.Marker;
  state.paneOrder = Number(getComputedStyle(source.getPane()).zIndex) || 0;
  state.disposed = false;
  const currentEvents = 'load tileload tileunload move drag';
  source.on(currentEvents, refreshNativeEvent, state);
  map.on('zoomend', refreshNativeEvent, state);
  if (state.marker) map.on('move zoom rotate pitch resize viewreset', updateNativeLayerView, state);
  nativeEvents(state);
  let name, own, original;
  for (name in nativeMethodHandlers) {
    if (typeof source[name] !== 'function') continue;
    own = Object.getOwnPropertyDescriptor(source, name), original = source[name];
    state.methods.set(name, /* alloc */ { own, original });
    state.originalMethods.set(name, original);
    source[name] = nativeMethodHandlers[name];
  }
  const ready = state.ready = Promise.withResolvers();
  layer.once('ready', resolveNativeReady, state);
  layer.once('error', rejectNativeReady, state);
  layer.on('error', forwardNativeError, state);
  refreshNativeLayer(state);
  layer.addTo(map);
  try {
    await ready.promise;
  } catch (error) {
    disposeNativeLayer.call(state);
    throw error;
  }
  if (!current(state)) return source;

  nativeRenderByLayer.set(layer, state);
  try {
    synchronizeNativeLayer(state);
  } catch (error) {
    disposeNativeLayer.call(state);
    throw error;
  }
  update(state.backend);
  return source;
}
