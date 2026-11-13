import { sceneLayers } from '../weakmaps/sceneLayers.js';
import { L } from '../globals/L.js';
import { layerProto } from '../globals/layerProto.js';
import { initializeNativeLayer } from './initializeNativeLayer.js';

/** Run Leaflet initialization hooks and initialize this native layer when needed. */
export function layerCallInitHooks() {
  const initialized = this._initHooksCalled;
  if (!L.version.startsWith('2.')) layerProto.value.callInitHooks.call(this);
  if (L.version.startsWith('2.') || !initialized) {
    sceneLayers.add(this);
    initializeNativeLayer.call(this);
  }
}
