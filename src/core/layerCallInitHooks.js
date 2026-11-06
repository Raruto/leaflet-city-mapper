import { sceneLayers } from '../weakmaps/sceneLayers.js';

import { layerCallInitHooks as sharedLayerCallInitHooks } from '../globals/layerCallInitHooks.js';


import { initializeNativeLayer } from './initializeNativeLayer.js';

export function layerCallInitHooks() {
  if (!sceneLayers.has(this)) {
    sceneLayers.add(this);
  }
  const initialized = this._initHooksCalled;
  sharedLayerCallInitHooks.value.call(this);
  if (!initialized) initializeNativeLayer.call(this);
}
