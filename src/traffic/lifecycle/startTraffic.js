import { underEntry } from '../../scene/graph/underEntry.js';

export function startTraffic(state) {
  state.layer._map.off('simulationtimechange layerremove', state.update).on('simulationtimechange layerremove', state.update);
  state.layer._map.off('terrainchange', state.terrain).on('terrainchange', state.terrain);
  underEntry(state.layer, state.status);
  state.update();
}
