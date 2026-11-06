import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';
import { rasterVersionByLayer } from '../weakmaps/rasterVersionByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { blobParts } from '../globals/blobParts.js';

import { update } from "../scene/update.js";
import { registerTerrainTile } from "./registerTerrainTile.js";
import { pruneRasterTiles } from "./pruneRasterTiles.js";
import { pumpRasterTiles } from './pumpRasterTiles.js';
import { createRasterMesh } from './createRasterMesh.js';
import { getZxy } from '../archives/getZxy.js';

export async function finishRasterTile(layer, tile) {
  try {
    await readyByLayer.get(layer);
    const result = await getZxy(layer.options.archive,
      tile.coords.z, tile.coords.x, tile.coords.y, tile.request.signal
    );
    if (tile.request.signal.aborted) {
      result?.image?.close();
      return;
    }
    if (!result) throw /* alloc */ new Error(`Tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y} is not in the offline archive`);
    try {
      if (result.image) tile.image = result.image;
      else {
        blobParts[0] = result.data;
        const blob = /* alloc */ new Blob(blobParts);
        blobParts[0] = null;
        tile.image = await createImageBitmap(blob);
      }
    } catch {
      blobParts[0] = null;
      throw /* alloc */ new Error(`Unable to decode tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`);
    }
    if (tile.request.signal.aborted) {
      tile.image.close();
      tile.image = null;
      return;
    }
    createRasterMesh(layer, tile);
    tile.loadedAt = performance.now();
    tile.done = true;
    mutateWeakMap(rasterVersionByLayer, layer, "=", (rasterVersionByLayer.get(layer) || 0) + 1);
    registerTerrainTile(layer, tile.coords, tile);
    layer.fire('tileload', /* alloc */ { tile, coords: tile.coords });
    update(layer);
  } catch (error) {
    if (tile.request.signal.aborted) return;
    tile.error = error.message;
    mutateWeakMap(rasterVersionByLayer, layer, "=", (rasterVersionByLayer.get(layer) || 0) + 1);
    layer.fire('tileerror', /* alloc */ { tile, coords: tile.coords, error });
    layer.fire('error', /* alloc */ { error, coords: tile.coords });
  } finally {
    mutateWeakMap(loadingTilesByLayer, layer, "--", undefined, false);
    if (layer._map) {
      pumpRasterTiles(layer);
      pruneRasterTiles(layer);
      if (!loadingTilesByLayer.get(layer)) layer.fire('load');
      update(layer);
    }
  }
}
