import { L } from '../globals/L.js';
import { markerMethods } from '../globals/markerMethods.js';
import { initNativeGPU } from '../native/initNativeGPU.js';

/**
 * Set this marker's icon and initialize GPU rendering for mapped non-DivIcon images.
 *
 * @param {L.Icon} icon New marker icon.
 *
 * @returns {*} Original Leaflet setter result.
 */
export function markerSetIcon(icon) {
  if (!(icon instanceof L.DivIcon)) icon.options.crossOrigin ||= true;
  const result = markerMethods.value.setIcon.call(this, icon);
  if (this._map && !(icon instanceof L.DivIcon)) initNativeGPU(this, this._map);
  return result;
}
