import { L } from '../globals/L.js';
import { leafletLayer } from '../globals/leafletLayer.js';

/**
 * Forward initialization-hook registration to the appropriate Leaflet class.
 *
 * @returns {Function} This layer class.
 */
export function layerAddInitHook() {
  leafletLayer.addInitHook.apply(this === L.Layer ? leafletLayer : this, arguments);
  return this;
}
