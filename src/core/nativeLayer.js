import { L } from '../globals/L.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { nativeMethodHandlers } from '../globals/nativeMethodHandlers.js';
import { nativeRenderByLayer } from '../globals/nativeRenderByLayer.js';

import { createLayer } from '../scene/createLayer.js';


import { createMesh } from '../rendering/createMesh.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { nativeGeometry } from '../geometry/nativeGeometry.js';
import { nativeEvents } from './nativeEvents.js';
import { removeNativeEvents } from './removeNativeEvents.js';
import { parseColor } from '../utils/parseColor.js';
import { update } from '../scene/update.js';

import { current } from './current.js';
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
  const backend = state.backend = createLayer(/* allocation: required -- Each renderer backend retains its independent layer options. */ {
    source: /* allocation: required -- Source routing retains this backend's configuration. */ { type: '3d' },
  });
  state.meshes = /* allocation: required -- Mesh ownership and disposal are independent per native layer. */ new Map();
  state.textures = /* allocation: required -- Texture ownership and disposal are independent per native layer. */ new Map();
  state.methods = /* allocation: required -- Layer removal restores this layer's own method descriptors. */ new Map();
  state.originalMethods = /* allocation: required -- Native overrides retain the original methods for this layer. */ new Map();
  state.images = /* allocation: required -- Each layer unregisters its own image listeners on disposal. */ new Set();
  cameraByMap.get(map)._nativeGPUOrder ||= 0;
  cameraByMap.get(map)._nativeGPUBack ||= 0;
  state.dirty = true;
  state.viewDirty = true;
  state.failed = false;
  state.order = ++cameraByMap.get(map)._nativeGPUOrder;
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
    state.methods.set(name, /* allocation: required -- Each overridden method retains its own restoration descriptor. */ { own, original });
    state.originalMethods.set(name, original);
    source[name] = nativeMethodHandlers[name];
  }
  const ready = state.ready = Promise.withResolvers();
  backend.once('ready', resolveNativeReady, state);
  backend.once('error', rejectNativeReady, state);
  backend.on('error', forwardNativeError, state);
  refreshNativeLayer(state);
  backend.addTo(map);
  try {
    await ready.promise;
  } catch (error) {
    disposeNativeLayer.call(state);
    throw error;
  }
  if (!current(state)) return source;

  nativeRenderByLayer.set(backend, state);
  try {
    synchronizeNativeLayer(state);
  } catch (error) {
    disposeNativeLayer.call(state);
    throw error;
  }
  update(state.backend);
  return source;
}
