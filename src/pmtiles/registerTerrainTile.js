import { addRasterTile } from './addRasterTile.js';

export async function registerTerrainTile(backend, coords, tile) {
  if (backend._terrain3D && tile.done && !tile.request.signal.aborted &&
    backend._rasterTiles.get(`${coords.z}/${coords.x}/${coords.y}`) === tile) {
    try {
      await addRasterTile(backend._terrain3D, backend, coords, tile);
    } catch (error) {
      backend.fire('tileerror', { tile, coords, error });
    }
  }
}
