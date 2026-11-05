import { nativeMethodHandlers } from '../constants/nativeMethodHandlers.js';
import { createMesh } from '../rendering/createMesh.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { nativeGeometry } from '../geometry/nativeGeometry.js';
import { nativeEvents } from './nativeEvents.js';
import { removeNativeEvents } from './removeNativeEvents.js';
import { parseColor } from '../utils/parseColor.js';
import { update } from '../scene/update.js';
import { nativeLayerState } from '../constants/nativeLayerState.js';
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

nativeLayerState.imageStates = new WeakMap();
nativeLayerState.geometryPixelStates = [];

/** Render from coordinates and detached raster sources; only accessible marker controls remain DOM. */
export async function nativeLayer(state) {
  const { source, map } = state;
  const backend = state.backend = new L.Layer({ source: { type: '3d' } });
  state.meshes = new Map();
  state.textures = new Map();
  state.methods = new Map();
  state.originalMethods = new Map();
  state.images = new Set();
  map._nativeGPUOrder ||= 0;
  map._nativeGPUBack ||= 0;
  state.dirty = true;
  state.viewDirty = true;
  state.failed = false;
  state.order = ++map._nativeGPUOrder;
  state.marker = source instanceof L.Marker;
  state.paneOrder = Number(getComputedStyle(source.getPane()).zIndex) || 0;
  state.refresh = refreshNativeLayer;
  state.reorder = reorderNativeLayer;
  state.dispose = disposeNativeLayer;
  const currentEvents = 'load tileload tileunload move drag';
  source.on(currentEvents, refreshNativeEvent, state);
  map.on('zoomend', refreshNativeEvent, state);
  if (state.marker) map.on('move zoom rotate pitch resize viewreset', updateNativeLayerView, state);
  nativeEvents(state);
  let name, own, original;
  for (name of ['setLatLng', 'setLatLngs', 'addLatLng', 'setRadius', 'setStyle', 'redraw',
    'setIcon', 'setUrl', 'setBounds', 'setOpacity', 'setZIndex', 'setZIndexOffset', 'bringToFront', 'bringToBack']) {
    if (typeof source[name] !== 'function') continue;
    own = Object.getOwnPropertyDescriptor(source, name), original = source[name];
    state.methods.set(name, { own, original });
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

  backend._beforeRender = beforeNativeRender.bind(null, state);
  try {
    synchronizeNativeLayer(state);
  } catch (error) {
    disposeNativeLayer.call(state);
    throw error;
  }
  update(state.backend);
  return source;
}
