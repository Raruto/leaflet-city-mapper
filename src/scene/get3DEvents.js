import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';
import { updateArea } from '../sources/updateArea.js';
import { onTerrainChange } from '../terrain/onTerrainChange.js';

/**
 * Create map event handlers for a 3D source layer.
 *
 * @param {L.Layer} layer Layer whose source determines the events.
 *
 * @returns {Object} Map event names and handlers.
 */
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
