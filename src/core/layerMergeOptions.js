import { L } from '../globals/L.js';
import { leafletLayer } from '../globals/leafletLayer.js';

export function layerMergeOptions(options) {
  leafletLayer.mergeOptions.call(this === L.Layer ? leafletLayer : this, options);
  return this;
}
