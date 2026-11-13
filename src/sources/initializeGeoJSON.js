import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { setGeoJSONLayerData } from './setGeoJSONLayerData.js';
import { init3D } from '../scene/init3D.js';

/**
 * Mark a layer as GeoJSON-backed and initialize its 3D scene.
 *
 * @param {L.Layer} layer Layer to initialize.
 * @param {Object} options Layer options.
 */
export function initializeGeoJSON(layer, options) {
  geojsonByLayer.set(layer, true);
  init3D(layer, options);
}
