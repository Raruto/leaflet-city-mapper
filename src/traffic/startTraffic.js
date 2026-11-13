import { underEntry } from '../layer-controls/underEntry.js';

/**
 * Register time and terrain listeners, show the layer status and start traffic updates.
 *
 * @param {Object} state Traffic layer state.
 */
export function startTraffic(state) {
  state.layer._map.off('simulationtimechange layerremove', state.update).on('simulationtimechange layerremove', state.update);
  state.layer._map.off('terrainchange', state.terrain).on('terrainchange', state.terrain);
  underEntry(state.layer, state.status);
  state.update();
}
