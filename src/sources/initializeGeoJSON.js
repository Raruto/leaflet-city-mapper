import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { setGeoJSONLayerData } from './setGeoJSONLayerData.js';
import { init3D } from '../scene/init3D.js';

export function initializeGeoJSON(layer, options) {
  mutateWeakMap(geojsonByLayer, layer, "=", true);
  init3D(layer, options);
}
