import { pluginState } from '../core/pluginState.js';
import { setGeoJSONLayerData } from './setGeoJSONLayerData.js';
import { init3D } from '../scene/init3D.js';

export function initializeGeoJSON(layer, options) {
  pluginState(layer)._geojson = true;
  pluginState(layer).setData = setGeoJSONLayerData;
  init3D(layer, options);
}
