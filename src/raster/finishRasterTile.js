import { update } from "../scene/update.js";
import { registerTerrainTile } from "./registerTerrainTile.js";
import { pruneRasterTiles } from "./pruneRasterTiles.js";
import { pumpRasterTiles } from './pumpRasterTiles.js';
import { createRasterMesh } from './createRasterMesh.js';

export async function finishRasterTile(backend, tile) {
  try {
    await backend.ready;
    const result = await backend.options.archive.getZxy(
      tile.coords.z, tile.coords.x, tile.coords.y, tile.request.signal
    );
    if (tile.request.signal.aborted) return;
    if (!result) throw new Error(`Tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y} is not in the offline archive`);
    try {
      tile.image = await createImageBitmap(new Blob([result.data]));
    } catch {
      throw new Error(`Unable to decode tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`);
    }
    if (tile.request.signal.aborted) {
      tile.image.close();
      tile.image = null;
      return;
    }
    createRasterMesh(backend, tile);
    tile.loadedAt = performance.now();
    tile.done = true;
    backend._rasterVersion = (backend._rasterVersion || 0) + 1;
    registerTerrainTile(backend, tile.coords, tile);
    backend.fire('tileload', { tile, coords: tile.coords });
    update(backend);
  } catch (error) {
    if (tile.request.signal.aborted) return;
    tile.error = error.message;
    backend._rasterVersion = (backend._rasterVersion || 0) + 1;
    backend.fire('tileerror', { tile, coords: tile.coords, error });
    backend.fire('error', { error, coords: tile.coords });
  } finally {
    backend._loadingTiles--;
    if (backend._map) {
      pumpRasterTiles(backend);
      pruneRasterTiles(backend);
      if (!backend._loadingTiles) backend.fire('load');
      update(backend);
    }
  }
}
