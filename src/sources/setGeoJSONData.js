import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { releaseArea } from './releaseArea.js';
import { updateArea } from './updateArea.js';

/**
 * Replace a layer's GeoJSON data, releasing old areas and scheduling a rebuild.
 *
 * @param {L.Layer} layer GeoJSON layer.
 * @param {Object} data Replacement GeoJSON data.
 *
 * @returns {L.Layer} The updated layer.
 */
export function setGeoJSONData(layer, data) {
  layer.options.data = data;
  delete layer.options.url;
  let area;
  for (area of areasByLayer.get(layer).values()) releaseArea(layer, area);
  areasByLayer.get(layer).clear();
  updateArea(layer);
  return layer;
}
