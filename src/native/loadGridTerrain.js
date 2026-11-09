import { getGridTerrainTile } from './getGridTerrainTile.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';

export async function loadGridTerrain(state, key, tile, request) {
  const { x, y, z } = tile.coords, stream = request.stream;
  const jobs = /* alloc */ [], tiles = /* alloc */ new Map();
  let dx, dy, i = 0;
  try {
    for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
      jobs.push(getGridTerrainTile(stream, z, x + dx, y + dy));
    }
    const values = await Promise.all(jobs);
    if (state.disposed || stream.terrainController.signal.aborted ||
      state.source._tiles[key] !== tile || state.terrainRequests.get(key) !== request) return;
    for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) tiles.set(`${x + dx}/${y + dy}`, values[i++]);
    request.tiles = tiles;
    refreshNativeLayer(state);
    state.map.fire('terrainchange');
    state.source._update();
  } catch (error) {
    if (!state.disposed && !stream.terrainController.signal.aborted && state.source._tiles[key] === tile) {
      request.error = error;
      stream.layer.fire('error', /* alloc */ { error, coords: tile.coords });
    }
  }
}
