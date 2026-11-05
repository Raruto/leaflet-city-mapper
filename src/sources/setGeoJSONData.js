import { sceneByLayer } from '../globals/sceneByLayer.js';


import { releaseArea } from './releaseArea.js';
import { updateArea } from './updateArea.js';

export function setGeoJSONData(layer, data) {
  layer.options.data = data;
  delete layer.options.url;
  let area;
  for (area of sceneByLayer.get(layer)._areas.values()) releaseArea(layer, area);
  sceneByLayer.get(layer)._areas.clear();
  updateArea(layer);
  return layer;
}
