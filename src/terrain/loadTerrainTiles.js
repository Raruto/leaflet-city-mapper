import { terrainTilesByLayer } from '../weakmaps/terrainTilesByLayer.js';
import { getZxy } from '../archives/getZxy.js';

/**
 * Consume the shared tile queue and store decoded Float32 terrain tiles.
 *
 * @param {Object} state Queue, archive, layer and cancellation state.
 *
 * @returns {Promise<void>} Resolves when the queue is exhausted.
 *
 * @throws {Error} If a tile is missing or has an invalid byte length.
 */
export async function loadTerrainTiles(state) {
  const { backend: layer, archive, controller, tiles } = state;
  let coords, result;
  while (state.next < tiles.length) {
    controller.signal.throwIfAborted();
    coords = tiles[state.next++];
    result = await getZxy(archive, coords.z, coords.x, coords.y, controller.signal);
    if (!result || result.data.byteLength !== 256 * 256 * 4) {
      throw /* alloc */ new Error(`Missing or invalid Float32 terrain tile ${coords.z}/${coords.x}/${coords.y}`);
    }
    terrainTilesByLayer.get(layer).set(`${coords.x}/${coords.y}`, /* alloc */ new Float32Array(result.data));
  }
}
