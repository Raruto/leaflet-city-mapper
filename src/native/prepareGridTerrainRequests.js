import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';

/**
 * Track the current terrain stream and discard requests for removed grid tiles.
 *
 * @param {Object} state Native grid layer state.
 *
 * @returns {Object|undefined} Current terrain stream.
 */
export function prepareGridTerrainRequests(state) {
  const stream = streamTerrainByMap.get(state.map);
  if (state.terrainStream !== stream) {
    state.terrainStream = stream;
    state.terrainRequests = stream ? /* alloc */ new Map() : null;
  }
  if (state.terrainRequests) {
    let key;
    for (key of state.terrainRequests.keys()) {
      if (!state.source._tiles[key]) state.terrainRequests.delete(key);
    }
  }
  return stream;
}
