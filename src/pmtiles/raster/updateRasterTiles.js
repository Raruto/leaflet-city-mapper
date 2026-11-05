import { TILE_RADIUS } from './constants/TILE_RADIUS.js';
import { pumpRasterTiles } from './pumpRasterTiles.js';
import { TILE_SIZE } from './constants/TILE_SIZE.js';
import { releaseRasterTile } from './releaseRasterTile.js';
import { pruneRasterTiles } from './pruneRasterTiles.js';

// ponytail: cap horizon views at 169 tiles; raise the radius if extreme pitches need more.

export function updateRasterTiles(backend) {
  const map = backend._map;
  if (!map || !backend._shared || !backend.header) return;

  const zoom = Math.max(backend.header.minZoom ?? 0, Math.min(
    Math.round(map.getZoom()),
    backend.options.maxZoom,
    backend.options.maxNativeZoom
  ));
  backend._tileZoom = zoom;
  const bounds = map.getBounds();
  const northWest = map.project(bounds.getNorthWest(), zoom).divideBy(TILE_SIZE).floor();
  const southEast = map.project(bounds.getSouthEast(), zoom).divideBy(TILE_SIZE).floor();
  const archiveNorthWest = backend.header.maxLat === undefined || backend.header.minLon === undefined
    ? new L.Point(0, 0)
    : map.project([backend.header.maxLat, backend.header.minLon], zoom).divideBy(TILE_SIZE).floor();
  const archiveSouthEast = backend.header.minLat === undefined || backend.header.maxLon === undefined
    ? new L.Point(2 ** zoom - 1, 2 ** zoom - 1)
    : map.project([backend.header.minLat, backend.header.maxLon], zoom).divideBy(TILE_SIZE).floor();
  const center = map.project(map.getCenter(), zoom).divideBy(TILE_SIZE).floor();
  const wanted = new Map();
  for (let x = Math.max(0, northWest.x, archiveNorthWest.x, center.x - TILE_RADIUS);
    x <= Math.min(2 ** zoom - 1, southEast.x, archiveSouthEast.x, center.x + TILE_RADIUS); x++) {
    for (let y = Math.max(0, northWest.y, archiveNorthWest.y, center.y - TILE_RADIUS);
      y <= Math.min(2 ** zoom - 1, southEast.y, archiveSouthEast.y, center.y + TILE_RADIUS); y++) {
      wanted.set(`${zoom}/${x}/${y}`, { z: zoom, x, y });
    }
  }
  backend._wantedRasterTiles = new Set(wanted.keys());
  const coverage = new Map();
  const parentZoom = Math.max(backend.header.minZoom ?? 0, zoom - 2), factor = 2 ** (zoom - parentZoom);
  if (parentZoom < zoom) {
    for (const [key, coords] of wanted) {
      if (backend._rasterTiles.get(key)?.done) continue;
      const parent = { z: parentZoom, x: Math.floor(coords.x / factor), y: Math.floor(coords.y / factor) };
      coverage.set(`${parent.z}/${parent.x}/${parent.y}`, parent);
    }
  }
  const required = new Map([...coverage, ...wanted]);
  for (const [key, tile] of backend._rasterTiles) {
    if (!required.has(key) && !tile.done) releaseRasterTile(backend, tile);
  }
  for (const [key, coords] of required) {
    if (backend._rasterTiles.has(key)) continue;
    const tile = { coords, request: new AbortController(), done: false };
    backend._rasterTiles.set(key, tile);
  }
  pumpRasterTiles(backend);
  pruneRasterTiles(backend);
}
