import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { loadGridTerrain } from './loadGridTerrain.js';

/**
 * Prepare incoming terrain requests and discard requests for removed grid tiles.
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
    let key, tile, request;
    for (key of state.terrainRequests.keys()) {
      if (!state.source._tiles[key]) state.terrainRequests.delete(key);
    }
    for (key in state.source._tiles) {
      tile = state.source._tiles[key];
      if (tile.coords.z !== state.source._tileZoom) continue;
      request = state.terrainRequests.get(key);
      if (request?.tile === tile) continue;
      request = /* alloc */ { tile, stream };
      state.terrainRequests.set(key, request);
      loadGridTerrain(state, key, tile, request);
    }
  }
  return stream;
}
