import { L } from '../globals/L.js';
import { markerMethods } from '../globals/markerMethods.js';


import { initNativeGPU } from '../native/initNativeGPU.js';

export function markerSetIcon(icon) {
  if (!(icon instanceof L.DivIcon)) icon.options.crossOrigin ||= true;
  const result = markerMethods.value.setIcon.call(this, icon);
  if (this._map && !(icon instanceof L.DivIcon)) initNativeGPU(this, this._map);
  return result;
}
