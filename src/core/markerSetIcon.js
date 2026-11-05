import { mapCameraState } from '../constants/mapCameraState.js';
import { initNativeGPU } from './initNativeGPU.js';

export function markerSetIcon(icon) {
  if (!(icon instanceof L.DivIcon)) icon.options.crossOrigin ||= true;
  const result = mapCameraState.markerMethods.setIcon.call(this, icon);
  if (this._map && !(icon instanceof L.DivIcon)) initNativeGPU(this, this._map);
  return result;
}
