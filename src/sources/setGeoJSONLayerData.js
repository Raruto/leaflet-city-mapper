import { setGeoJSONData } from './setGeoJSONData.js';

/**
 * Replace this layer's GeoJSON data and rebuild its areas.
 *
 * @param {Object} data Replacement GeoJSON data.
 *
 * @returns {L.Layer} This layer.
 */
export function setGeoJSONLayerData(data) {
  return setGeoJSONData(this, data);
}
