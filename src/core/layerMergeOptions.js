import { L } from '../globals/L.js';
import { leafletLayer } from '../globals/leafletLayer.js';

/**
 * Merge options into the appropriate Leaflet layer class.
 *
 * @param {Object} options Default options to merge.
 *
 * @returns {Function} This layer class.
 */
export function layerMergeOptions(options) {
  leafletLayer.mergeOptions.call(this === L.Layer ? leafletLayer : this, options);
  return this;
}
