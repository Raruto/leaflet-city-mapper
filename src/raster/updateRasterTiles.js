import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { pumpRasterTiles } from './pumpRasterTiles.js';

import { releaseRasterTile } from './releaseRasterTile.js';
import { pruneRasterTiles } from './pruneRasterTiles.js';

// ponytail: cap horizon views at 169 tiles; raise the radius if extreme pitches need more.

export function updateRasterTiles(backend) {
  const map = backend._map;
  if (!map || !pluginState(backend)._shared || !pluginState(backend).header) return;

  const zoom = Math.max(pluginState(backend).header.minZoom ?? 0, Math.min(
    Math.round(map.getZoom()),
    backend.options.maxZoom,
    backend.options.maxNativeZoom
  ));
  pluginState(backend)._tileZoom = zoom;
  const bounds = map.getBounds();
  const northWest = map.project(bounds.getNorthWest(), zoom).divideBy(sharedState.TILE_SIZE).floor();
  const southEast = map.project(bounds.getSouthEast(), zoom).divideBy(sharedState.TILE_SIZE).floor();
  const northWestLocation = sharedState.allocationRenderArchiveNorthWest;
  northWestLocation[0] = pluginState(backend).header.maxLat; northWestLocation[1] = pluginState(backend).header.minLon;
  const southEastLocation = sharedState.allocationRenderArchiveSouthEast;
  southEastLocation[0] = pluginState(backend).header.minLat; southEastLocation[1] = pluginState(backend).header.maxLon;
  const archiveNorthWest = pluginState(backend).header.maxLat === undefined || pluginState(backend).header.minLon === undefined
    ? null
    : map.project(northWestLocation, zoom).divideBy(sharedState.TILE_SIZE).floor();
  const archiveSouthEast = pluginState(backend).header.minLat === undefined || pluginState(backend).header.maxLon === undefined
    ? null
    : map.project(southEastLocation, zoom).divideBy(sharedState.TILE_SIZE).floor();
  const center = map.project(map.getCenter(), zoom).divideBy(sharedState.TILE_SIZE).floor();
  const wanted = sharedState.allocationRenderWantedTiles;
  wanted.clear();
  let x, y, key, coords, parent, tile;
  for (x = Math.max(0, northWest.x, archiveNorthWest?.x ?? 0, center.x - sharedState.TILE_RADIUS);
    x <= Math.min(2 ** zoom - 1, southEast.x, archiveSouthEast?.x ?? 2 ** zoom - 1, center.x + sharedState.TILE_RADIUS); x++) {
    for (y = Math.max(0, northWest.y, archiveNorthWest?.y ?? 0, center.y - sharedState.TILE_RADIUS);
      y <= Math.min(2 ** zoom - 1, southEast.y, archiveSouthEast?.y ?? 2 ** zoom - 1, center.y + sharedState.TILE_RADIUS); y++) {
      wanted.set(`${zoom}/${x}/${y}`, /* allocation: required -- Async tile requests retain these view-specific coordinates independently of later view updates. */ { z: zoom, x, y });
    }
  }
  pluginState(backend)._wantedRasterTiles = /* allocation: required -- Pruning retains this view-specific wanted-key set and uses its identity to invalidate its cache. */ new Set(wanted.keys());
  const coverage = sharedState.allocationRenderCoverageTiles;
  coverage.clear();
  const parentZoom = Math.max(pluginState(backend).header.minZoom ?? 0, zoom - 2), factor = 2 ** (zoom - parentZoom);
  if (parentZoom < zoom) {
    for ([key, coords] of wanted) {
      if (pluginState(backend)._rasterTiles.get(key)?.done) continue;
      parent = /* allocation: required -- The coarse request retains these coordinates until its async tile load completes. */ { z: parentZoom, x: Math.floor(coords.x / factor), y: Math.floor(coords.y / factor) };
      coverage.set(`${parent.z}/${parent.x}/${parent.y}`, parent);
    }
  }
  const required = /* allocation: required -- Reentrant tile-unload listeners must not overwrite this update invocation’s required-request snapshot. */ new Map(coverage);
  for ([key, coords] of wanted) required.set(key, coords);
  wanted.clear(); coverage.clear();
  for ([key, tile] of pluginState(backend)._rasterTiles) {
    if (!required.has(key) && !tile.done) releaseRasterTile(backend, tile);
  }
  for ([key, coords] of required) {
    if (pluginState(backend)._rasterTiles.has(key)) continue;
    tile = /* allocation: required -- Each async tile request retains its own coordinates, cancellation controller and completion state. */ { coords, request: /* allocation: required -- Each tile request must be cancellable independently of concurrent requests. */ new AbortController(), done: false };
    pluginState(backend)._rasterTiles.set(key, tile);
  }
  pumpRasterTiles(backend);
  pruneRasterTiles(backend);
}
