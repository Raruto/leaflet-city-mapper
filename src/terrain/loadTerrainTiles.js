import { terrainTilesByLayer } from '../weakmaps/terrainTilesByLayer.js';



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
import { getZxy } from '../archives/getZxy.js';
