import { sceneByLayer } from '../globals/sceneByLayer.js';


import { updateArea } from '../sources/updateArea.js';
import { onTerrainChange } from '../terrain/onTerrainChange.js';

export function get3DEvents(layer) {
  const events = /* alloc */ {};
  if (sceneByLayer.get(layer).url) {
    events.moveend = events.zoomend = events.rotate = events.pitch = events.resize = updateArea.bind(null, layer);
  }
  if (sceneByLayer.get(layer)._geojson || sceneByLayer.get(layer).url) {
    events.terrainchange = onTerrainChange.bind(null, layer);
  }
  return events;
}
