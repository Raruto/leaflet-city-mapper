import { updateArea } from '../sources/updateArea.js';
import { onTerrainChange } from '../terrain/onTerrainChange.js';

export function get3DEvents(layer) {
  const events = {};
  if (layer.url) {
    events.moveend = events.zoomend = events.rotate = events.pitch = events.resize = updateArea.bind(null, layer);
  }
  if (layer._geojson || layer.url) {
    events.terrainchange = onTerrainChange.bind(null, layer);
  }
  return events;
}
