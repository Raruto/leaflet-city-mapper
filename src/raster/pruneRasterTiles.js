import { pruneAfterByLayer } from '../weakmaps/pruneAfterByLayer.js';
import { pruneVersionByLayer } from '../weakmaps/pruneVersionByLayer.js';
import { pruneWantedByLayer } from '../weakmaps/pruneWantedByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { rasterVersionByLayer } from '../weakmaps/rasterVersionByLayer.js';
import { wantedRasterTilesByLayer } from '../weakmaps/wantedRasterTilesByLayer.js';



import { releaseRasterTile } from './releaseRasterTile.js';

export function pruneRasterTiles(layer) {
  const wanted = wantedRasterTilesByLayer.get(layer);
  const now = performance.now();
  if (pruneVersionByLayer.get(layer) === rasterVersionByLayer.get(layer) && pruneWantedByLayer.get(layer) === wanted &&
    now < pruneAfterByLayer.get(layer)) return Number.isFinite(pruneAfterByLayer.get(layer));
  pruneVersionByLayer.set(layer, rasterVersionByLayer.get(layer));
  pruneWantedByLayer.set(layer, wanted);
  pruneAfterByLayer.set(layer, Infinity);
  const pending = /* alloc */ [];
  let key, tile, parts, overlaps, coords, zoom;
  for (key of wanted) {
    tile = rasterTilesByLayer.get(layer).get(key);
    if (tile?.done && now - tile.loadedAt < 250) {
      pruneAfterByLayer.set(layer, Math.min(pruneAfterByLayer.get(layer), tile.loadedAt + 250));
    }
    if (!tile?.done || now - tile.loadedAt < 250) {
      parts = key.split('/');
      pending.push(/* alloc */ { z: Number(parts[0]), x: Number(parts[1]), y: Number(parts[2]) });
    }
  }
  for ([key, tile] of rasterTilesByLayer.get(layer)) {
    if (wanted.has(key)) continue;
    overlaps = false;
    for (coords of pending) {
      zoom = Math.min(coords.z, tile.coords.z);
      if (Math.floor(coords.x / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.x / 2 ** (tile.coords.z - zoom)) &&
        Math.floor(coords.y / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.y / 2 ** (tile.coords.z - zoom))) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) releaseRasterTile(layer, tile);
  }
  return Number.isFinite(pruneAfterByLayer.get(layer));
}
