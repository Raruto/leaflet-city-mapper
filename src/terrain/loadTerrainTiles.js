import { pluginState } from '../core/pluginState.js';
export async function loadTerrainTiles(state) {
  const { backend, archive, controller, tiles } = state;
  let coords, result;
  while (state.next < tiles.length) {
    controller.signal.throwIfAborted();
    coords = tiles[state.next++];
    result = await pluginState(archive).getZxy(coords.z, coords.x, coords.y, controller.signal);
    if (!result || result.data.byteLength !== 256 * 256 * 4) {
      throw /* allocation: required -- Each reported failure needs its own message and stack for the receiving caller or event listener. */ new Error(`Missing or invalid Float32 terrain tile ${coords.z}/${coords.x}/${coords.y}`);
    }
    pluginState(backend)._terrainTiles.set(`${coords.x}/${coords.y}`, /* allocation: required -- The terrain cache retains this decoded tile’s own elevation buffer across requests. */ new Float32Array(result.data));
  }
}
