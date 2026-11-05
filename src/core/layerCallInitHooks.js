import { state as sharedState } from '../state.js';

import { initializeNativeLayer } from './initializeNativeLayer.js';

export function layerCallInitHooks() {
  const initialized = this._initHooksCalled;
  sharedState.layerCallInitHooks.call(this);
  if (!initialized) initializeNativeLayer.call(this);
}
