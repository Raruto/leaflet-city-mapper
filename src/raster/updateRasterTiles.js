import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { tileZoomByLayer } from '../weakmaps/tileZoomByLayer.js';
import { wantedRasterTilesByLayer } from '../weakmaps/wantedRasterTilesByLayer.js';

import { wantedTiles } from '../globals/wantedTiles.js';
import { coverageTiles } from '../globals/coverageTiles.js';



import { pumpRasterTiles } from './pumpRasterTiles.js';

import { retainRasterTiles } from './retainRasterTiles.js';
import { pruneRasterTiles } from './pruneRasterTiles.js';
import { rasterTileRange } from './rasterTileRange.js';

// ponytail: cap horizon views at 169 tiles; raise the radius if extreme pitches need more.

export function updateRasterTiles(layer) {
  const map = layer._map;
  if (!map || !sharedByLayer.get(layer) || !headerByLayer.get(layer)) return;

  const zoom = Math.max(headerByLayer.get(layer).minZoom ?? 0, Math.min(
    Math.round(map.getZoom()),
    layer.options.maxZoom,
    layer.options.maxNativeZoom
  ));
  tileZoomByLayer.set(layer, zoom);
  const range = rasterTileRange(map, headerByLayer.get(layer), zoom);
  const wanted = wantedTiles;
  wanted.clear();
  let x, y, key, coords, parent;
  for (x = range.minX; x <= range.maxX; x++) {
    for (y = range.minY; y <= range.maxY; y++) {
      wanted.set(`${zoom}/${x}/${y}`, /* alloc */ { z: zoom, x, y });
    }
  }
  wantedRasterTilesByLayer.set(layer, /* alloc */ new Set(wanted.keys()));
  const coverage = coverageTiles;
  coverage.clear();
  const parentZoom = Math.max(headerByLayer.get(layer).minZoom ?? 0, zoom - 2), factor = 2 ** (zoom - parentZoom);
  if (parentZoom < zoom) {
    for ([key, coords] of wanted) {
      if (rasterTilesByLayer.get(layer).get(key)?.done) continue;
      parent = /* alloc */ { z: parentZoom, x: Math.floor(coords.x / factor), y: Math.floor(coords.y / factor) };
      coverage.set(`${parent.z}/${parent.x}/${parent.y}`, parent);
    }
  }
  const required = /* alloc */ new Map(coverage);
  for ([key, coords] of wanted) required.set(key, coords);
  wanted.clear(); coverage.clear();
  retainRasterTiles(layer, required);
  pumpRasterTiles(layer);
  pruneRasterTiles(layer);
}
