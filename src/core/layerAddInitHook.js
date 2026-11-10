import { L } from '../globals/L.js';
import { leafletLayer } from '../globals/leafletLayer.js';

export function layerAddInitHook() {
  leafletLayer.addInitHook.apply(this === L.Layer ? leafletLayer : this, arguments);
  return this;
}
