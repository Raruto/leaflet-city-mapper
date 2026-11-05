import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';

export function markerUpdateZIndex(offset) {
  sharedState.markerMethods._updateZIndex.call(this, offset);
  const changed = pluginState(this)._cameraZIndexOffset !== offset;
  pluginState(this)._cameraZIndexOffset = offset;
  if (changed) pluginState(this)._nativeGPU?.refresh?.();
}
