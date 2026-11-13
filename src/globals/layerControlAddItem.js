import { L } from './L.js';

/**
 * Original Leaflet layers control item builder, when available.
 *
 * @type {Function|undefined}
 */
export const layerControlAddItem = L?.LayersControl?.prototype._addItem;
