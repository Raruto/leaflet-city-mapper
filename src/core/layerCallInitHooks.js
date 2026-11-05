import { sceneByLayer } from '../globals/sceneByLayer.js';
import { layerCallInitHooks as sharedLayerCallInitHooks } from '../globals/layerCallInitHooks.js';


import { initializeNativeLayer } from './initializeNativeLayer.js';

export function layerCallInitHooks() {
  if (!sceneByLayer.has(this)) {
    sceneByLayer.set(this, /* allocation: required -- Each native layer owns independent scene data, never methods. */ {});
  }
  const initialized = this._initHooksCalled;
  sharedLayerCallInitHooks.value.call(this);
  if (!initialized) initializeNativeLayer.call(this);
}
