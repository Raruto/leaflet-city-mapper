import { sceneByLayer } from '../globals/sceneByLayer.js';
import { wantedTiles } from '../globals/wantedTiles.js';
import { coverageTiles } from '../globals/coverageTiles.js';



import { pumpRasterTiles } from './pumpRasterTiles.js';

import { retainRasterTiles } from './retainRasterTiles.js';
import { pruneRasterTiles } from './pruneRasterTiles.js';
import { rasterTileRange } from './rasterTileRange.js';

// ponytail: cap horizon views at 169 tiles; raise the radius if extreme pitches need more.

export function updateRasterTiles(backend) {
  const map = backend._map;
  if (!map || !sceneByLayer.get(backend)._shared || !sceneByLayer.get(backend).header) return;

  const zoom = Math.max(sceneByLayer.get(backend).header.minZoom ?? 0, Math.min(
    Math.round(map.getZoom()),
    backend.options.maxZoom,
    backend.options.maxNativeZoom
  ));
  sceneByLayer.get(backend)._tileZoom = zoom;
  const range = rasterTileRange(map, sceneByLayer.get(backend).header, zoom);
  const wanted = wantedTiles;
  wanted.clear();
  let x, y, key, coords, parent;
  for (x = range.minX; x <= range.maxX; x++) {
    for (y = range.minY; y <= range.maxY; y++) {
      wanted.set(`${zoom}/${x}/${y}`, /* alloc */ { z: zoom, x, y });
    }
  }
  sceneByLayer.get(backend)._wantedRasterTiles = /* alloc */ new Set(wanted.keys());
  const coverage = coverageTiles;
  coverage.clear();
  const parentZoom = Math.max(sceneByLayer.get(backend).header.minZoom ?? 0, zoom - 2), factor = 2 ** (zoom - parentZoom);
  if (parentZoom < zoom) {
    for ([key, coords] of wanted) {
      if (sceneByLayer.get(backend)._rasterTiles.get(key)?.done) continue;
      parent = /* alloc */ { z: parentZoom, x: Math.floor(coords.x / factor), y: Math.floor(coords.y / factor) };
      coverage.set(`${parent.z}/${parent.x}/${parent.y}`, parent);
    }
  }
  const required = /* alloc */ new Map(coverage);
  for ([key, coords] of wanted) required.set(key, coords);
  wanted.clear(); coverage.clear();
  retainRasterTiles(backend, required);
  pumpRasterTiles(backend);
  pruneRasterTiles(backend);
}
