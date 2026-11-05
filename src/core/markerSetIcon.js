import { state as sharedState } from '../state.js';

import { initNativeGPU } from './initNativeGPU.js';

export function markerSetIcon(icon) {
  if (!(icon instanceof L.DivIcon)) icon.options.crossOrigin ||= true;
  const result = sharedState.markerMethods.setIcon.call(this, icon);
  if (this._map && !(icon instanceof L.DivIcon)) initNativeGPU(this, this._map);
  return result;
}
