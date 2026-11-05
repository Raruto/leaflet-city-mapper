import { sceneByLayer } from '../globals/sceneByLayer.js';


import { setGeoJSONLayerData } from './setGeoJSONLayerData.js';
import { init3D } from '../scene/init3D.js';

export function initializeGeoJSON(layer, options) {
  sceneByLayer.get(layer)._geojson = true;
  init3D(layer, options);
}
