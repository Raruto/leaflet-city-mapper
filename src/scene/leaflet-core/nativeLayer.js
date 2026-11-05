import { nativeMethodHandlers } from './constants/nativeMethodHandlers.js';
import { createMesh } from '../../rendering/meshes/createMesh.js';
import { destroyTexture } from '../../rendering/textures/destroyTexture.js';
import { disposeMesh } from '../../rendering/meshes/disposeMesh.js';
import { nativeGeometry } from '../../geometry/leaflet-core/nativeGeometry.js';
import { nativeEvents } from './events/nativeEvents.js';
import { removeNativeEvents } from './events/removeNativeEvents.js';
import { parseColor } from '../../utils/parseColor.js';
import { update } from '../lifecycle/update.js';
import { nativeLayerState } from './constants/nativeLayerState.js';
import { current } from './current.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';
import { refreshNativeEvent } from './refreshNativeEvent.js';
import { reorderNativeLayer } from './reorderNativeLayer.js';
import { nativeSetLatLng } from './methods/nativeSetLatLng.js';
import { nativeSetLatLngs } from './methods/nativeSetLatLngs.js';
import { nativeAddLatLng } from './methods/nativeAddLatLng.js';
import { nativeSetRadius } from './methods/nativeSetRadius.js';
import { nativeSetStyle } from './methods/nativeSetStyle.js';
import { nativeRedraw } from './methods/nativeRedraw.js';
import { nativeSetIcon } from './methods/nativeSetIcon.js';
import { nativeSetUrl } from './methods/nativeSetUrl.js';
import { nativeSetBounds } from './methods/nativeSetBounds.js';
import { nativeSetOpacity } from './methods/nativeSetOpacity.js';
import { nativeSetZIndex } from './methods/nativeSetZIndex.js';
import { nativeSetZIndexOffset } from './methods/nativeSetZIndexOffset.js';
import { nativeBringToFront } from './methods/nativeBringToFront.js';
import { nativeBringToBack } from './methods/nativeBringToBack.js';
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
  for (const name of ['setLatLng', 'setLatLngs', 'addLatLng', 'setRadius', 'setStyle', 'redraw',
    'setIcon', 'setUrl', 'setBounds', 'setOpacity', 'setZIndex', 'setZIndexOffset', 'bringToFront', 'bringToBack']) {
    if (typeof source[name] !== 'function') continue;
    const own = Object.getOwnPropertyDescriptor(source, name), original = source[name];
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
