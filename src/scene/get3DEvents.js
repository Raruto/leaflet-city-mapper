import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';



import { updateArea } from '../sources/updateArea.js';
import { onTerrainChange } from '../terrain/onTerrainChange.js';

export function get3DEvents(layer) {
  const events = /* alloc */ {};
  if (urlByLayer.get(layer)) {
    events.moveend = events.zoomend = events.rotate = events.pitch = events.resize = updateArea.bind(null, layer);
  }
  if (geojsonByLayer.get(layer) || urlByLayer.get(layer)) {
    events.terrainchange = onTerrainChange.bind(null, layer);
  }
  return events;
}
