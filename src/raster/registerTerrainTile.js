import { sceneByLayer } from '../globals/sceneByLayer.js';


import { addRasterTile } from './addRasterTile.js';

export async function registerTerrainTile(backend, coords, tile) {
  if (sceneByLayer.get(backend)._terrain3D && tile.done && !tile.request.signal.aborted &&
    sceneByLayer.get(backend)._rasterTiles.get(`${coords.z}/${coords.x}/${coords.y}`) === tile) {
    try {
      await addRasterTile(sceneByLayer.get(backend)._terrain3D, backend, coords, tile);
    } catch (error) {
      backend.fire('tileerror', /* allocation: required -- Listeners may retain this tileerror event’s payload after later layer operations. */ { tile, coords, error });
    }
  }
}
