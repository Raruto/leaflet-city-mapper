import { leafletLayer } from '../globals/leafletLayer.js';
import { layerInitialize } from '../scene/layerInitialize.js';

export function constructLayer(options) {
  const layer = Reflect.construct(leafletLayer, /* alloc */ [], new.target);
  layerInitialize.call(layer, options);
  layer.callInitHooks();
  return layer;
}
