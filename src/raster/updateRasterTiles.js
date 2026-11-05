import { sceneByLayer } from '../globals/sceneByLayer.js';
import { TILE_SIZE } from '../globals/TILE_SIZE.js';
import { archiveNorthWest as sharedArchiveNorthWest } from '../globals/archiveNorthWest.js';
import { archiveSouthEast as sharedArchiveSouthEast } from '../globals/archiveSouthEast.js';
import { wantedTiles } from '../globals/wantedTiles.js';
import { TILE_RADIUS } from '../globals/TILE_RADIUS.js';
import { coverageTiles } from '../globals/coverageTiles.js';



import { pumpRasterTiles } from './pumpRasterTiles.js';

import { releaseRasterTile } from './releaseRasterTile.js';
import { pruneRasterTiles } from './pruneRasterTiles.js';

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
  const bounds = map.getBounds();
  const northWest = map.project(bounds.getNorthWest(), zoom).divideBy(TILE_SIZE).floor();
  const southEast = map.project(bounds.getSouthEast(), zoom).divideBy(TILE_SIZE).floor();
  const northWestLocation = sharedArchiveNorthWest;
  northWestLocation[0] = sceneByLayer.get(backend).header.maxLat; northWestLocation[1] = sceneByLayer.get(backend).header.minLon;
  const southEastLocation = sharedArchiveSouthEast;
  southEastLocation[0] = sceneByLayer.get(backend).header.minLat; southEastLocation[1] = sceneByLayer.get(backend).header.maxLon;
  const archiveNorthWest = sceneByLayer.get(backend).header.maxLat === undefined || sceneByLayer.get(backend).header.minLon === undefined
    ? null
    : map.project(northWestLocation, zoom).divideBy(TILE_SIZE).floor();
  const archiveSouthEast = sceneByLayer.get(backend).header.minLat === undefined || sceneByLayer.get(backend).header.maxLon === undefined
    ? null
    : map.project(southEastLocation, zoom).divideBy(TILE_SIZE).floor();
  const center = map.project(map.getCenter(), zoom).divideBy(TILE_SIZE).floor();
  const wanted = wantedTiles;
  wanted.clear();
  let x, y, key, coords, parent, tile;
  for (x = Math.max(0, northWest.x, archiveNorthWest?.x ?? 0, center.x - TILE_RADIUS);
    x <= Math.min(2 ** zoom - 1, southEast.x, archiveSouthEast?.x ?? 2 ** zoom - 1, center.x + TILE_RADIUS); x++) {
    for (y = Math.max(0, northWest.y, archiveNorthWest?.y ?? 0, center.y - TILE_RADIUS);
      y <= Math.min(2 ** zoom - 1, southEast.y, archiveSouthEast?.y ?? 2 ** zoom - 1, center.y + TILE_RADIUS); y++) {
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
  for ([key, tile] of sceneByLayer.get(backend)._rasterTiles) {
    if (!required.has(key) && !tile.done) releaseRasterTile(backend, tile);
  }
  for ([key, coords] of required) {
    if (sceneByLayer.get(backend)._rasterTiles.has(key)) continue;
    tile = /* alloc */ { coords, request: /* alloc */ new AbortController(), done: false };
    sceneByLayer.get(backend)._rasterTiles.set(key, tile);
  }
  pumpRasterTiles(backend);
  pruneRasterTiles(backend);
}
