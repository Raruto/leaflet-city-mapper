import { leafletLayer } from '../globals/leafletLayer.js';
import { layerInitialize } from '../scene/layerInitialize.js';

/**
 * Construct a Leaflet layer, initialize its source and run initialization hooks.
 *
 * @param {Object} options Layer options.
 *
 * @returns {L.Layer} Constructed layer.
 */
export function constructLayer(options) {
  const layer = Reflect.construct(leafletLayer, /* alloc */ [], new.target);
  layerInitialize.call(layer, options);
  layer.callInitHooks();
  return layer;
}
