import { setGeoJSONLayerData } from './setGeoJSONLayerData.js';
import { init3D } from '../scene/init3D.js';

export function initializeGeoJSON(layer, options) {
  layer._geojson = true;
  layer.setData = setGeoJSONLayerData;
  init3D(layer, options);
}
