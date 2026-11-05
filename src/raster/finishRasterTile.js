import { pluginState } from '../core/pluginState.js';
import { update } from "../scene/update.js";
import { registerTerrainTile } from "./registerTerrainTile.js";
import { pruneRasterTiles } from "./pruneRasterTiles.js";
import { pumpRasterTiles } from './pumpRasterTiles.js';
import { createRasterMesh } from './createRasterMesh.js';

export async function finishRasterTile(backend, tile) {
  try {
    await pluginState(backend).ready;
    const result = await pluginState(backend.options.archive).getZxy(
      tile.coords.z, tile.coords.x, tile.coords.y, tile.request.signal
    );
    if (tile.request.signal.aborted) return;
    if (!result) throw /* allocation: required -- Each reported failure needs its own message and stack for the receiving caller or event listener. */ new Error(`Tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y} is not in the offline archive`);
    try {
      sharedState.allocationRenderBlobParts[0] = result.data;
      const blob = /* allocation: required -- Each asynchronous image decode owns its immutable encoded tile blob. */ new Blob(sharedState.allocationRenderBlobParts);
      sharedState.allocationRenderBlobParts[0] = null;
      tile.image = await createImageBitmap(blob);
    } catch {
      sharedState.allocationRenderBlobParts[0] = null;
      throw /* allocation: required -- Each reported failure needs its own message and stack for the receiving caller or event listener. */ new Error(`Unable to decode tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`);
    }
    if (tile.request.signal.aborted) {
      tile.image.close();
      tile.image = null;
      return;
    }
    createRasterMesh(backend, tile);
    tile.loadedAt = performance.now();
    tile.done = true;
    pluginState(backend)._rasterVersion = (pluginState(backend)._rasterVersion || 0) + 1;
    registerTerrainTile(backend, tile.coords, tile);
    backend.fire('tileload', /* allocation: required -- Listeners may retain this tileload event’s payload after later layer operations. */ { tile, coords: tile.coords });
    update(backend);
  } catch (error) {
    if (tile.request.signal.aborted) return;
    tile.error = error.message;
    pluginState(backend)._rasterVersion = (pluginState(backend)._rasterVersion || 0) + 1;
    backend.fire('tileerror', /* allocation: required -- Listeners may retain this tileerror event’s payload after later layer operations. */ { tile, coords: tile.coords, error });
    backend.fire('error', /* allocation: required -- Listeners may retain this error event’s payload after later layer operations. */ { error, coords: tile.coords });
  } finally {
    pluginState(backend)._loadingTiles--;
    if (backend._map) {
      pumpRasterTiles(backend);
      pruneRasterTiles(backend);
      if (!pluginState(backend)._loadingTiles) backend.fire('load');
      update(backend);
    }
  }
}
import { state as sharedState } from '../state.js';
