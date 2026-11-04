import { releaseArea } from './releaseArea.js';
import { updateArea } from './updateArea.js';

export function setGeoJSONData(layer, data) {
  layer.options.data = data;
  delete layer.options.url;
  for (const area of layer._areas.values()) releaseArea(layer, area);
  layer._areas.clear();
  updateArea(layer);
  return layer;
}
