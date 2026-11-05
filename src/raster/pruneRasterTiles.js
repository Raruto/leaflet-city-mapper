import { sceneByLayer } from '../globals/sceneByLayer.js';


import { releaseRasterTile } from './releaseRasterTile.js';

export function pruneRasterTiles(backend) {
  const wanted = sceneByLayer.get(backend)._wantedRasterTiles;
  const now = performance.now();
  if (sceneByLayer.get(backend)._pruneVersion === sceneByLayer.get(backend)._rasterVersion && sceneByLayer.get(backend)._pruneWanted === wanted &&
    now < sceneByLayer.get(backend)._pruneAfter) return Number.isFinite(sceneByLayer.get(backend)._pruneAfter);
  sceneByLayer.get(backend)._pruneVersion = sceneByLayer.get(backend)._rasterVersion;
  sceneByLayer.get(backend)._pruneWanted = wanted;
  sceneByLayer.get(backend)._pruneAfter = Infinity;
  const pending = /* alloc */ [];
  let key, tile, parts, overlaps, coords, zoom;
  for (key of wanted) {
    tile = sceneByLayer.get(backend)._rasterTiles.get(key);
    if (tile?.done && now - tile.loadedAt < 250) {
      sceneByLayer.get(backend)._pruneAfter = Math.min(sceneByLayer.get(backend)._pruneAfter, tile.loadedAt + 250);
    }
    if (!tile?.done || now - tile.loadedAt < 250) {
      parts = key.split('/');
      pending.push(/* alloc */ { z: Number(parts[0]), x: Number(parts[1]), y: Number(parts[2]) });
    }
  }
  for ([key, tile] of sceneByLayer.get(backend)._rasterTiles) {
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
    if (!overlaps) releaseRasterTile(backend, tile);
  }
  return Number.isFinite(sceneByLayer.get(backend)._pruneAfter);
}
