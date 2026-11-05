import { pluginState } from '../core/pluginState.js';
import { updateArea } from '../sources/updateArea.js';
import { onTerrainChange } from '../terrain/onTerrainChange.js';

export function get3DEvents(layer) {
  const events = /* allocation: required -- Bind event ownership to this layer alone. */ {};
  if (pluginState(layer).url) {
    events.moveend = events.zoomend = events.rotate = events.pitch = events.resize = updateArea.bind(null, layer);
  }
  if (pluginState(layer)._geojson || pluginState(layer).url) {
    events.terrainchange = onTerrainChange.bind(null, layer);
  }
  return events;
}
