import { pump } from "./pump.js";
import { releaseArea } from './releaseArea.js';
import { compareAreaDistance } from './compareAreaDistance.js';

/** Cover the visible ground bounds and one bordering block, clipped to the archive. */

export function updateArea(backend) {
  if (!backend._map || !backend._shared) return;
  if (backend._geojson) {
    if (!backend._areas.has('geojson')) {
      backend._areas.set('geojson', { request: new AbortController() });
    }
    pump(backend);
    return;
  }
  if (!backend.header) return;
  const z = backend.header.minZoom;
  const center = backend._map.project(backend._map.getCenter(), z).divideBy(256).floor();
  const bounds = backend._map.getBounds();
  const nw = backend._map.project(bounds.getNorthWest(), z).divideBy(256).floor();
  const se = backend._map.project(bounds.getSouthEast(), z).divideBy(256).floor();
  const archiveNW = backend._map.project([backend.header.maxLat, backend.header.minLon], z).divideBy(256).floor();
  const archiveSE = backend._map.project([backend.header.minLat, backend.header.maxLon], z).divideBy(256).floor();
  const wanted = new Map();
  for (let x = Math.max(0, nw.x - 1, archiveNW.x); x <= Math.min(2 ** z - 1, se.x + 1, archiveSE.x); x++) {
    for (let y = Math.max(0, nw.y - 1, archiveNW.y); y <= Math.min(2 ** z - 1, se.y + 1, archiveSE.y); y++) {
      wanted.set(`${x}/${y}`, { z, x, y });
    }
  }
  for (const [key, area] of backend._areas) {
    if (!wanted.has(key)) {
      releaseArea(backend, area);
      backend._areas.delete(key);
    }
  }
  // Load the nearest new blocks first without rebuilding retained geometry.
  const areas = [];
  for (const [key, coords] of wanted) areas.push([key, coords, center]);
  areas.sort(compareAreaDistance);
  for (const [key, coords] of areas) {
    if (!backend._areas.has(key)) backend._areas.set(key, { coords, request: new AbortController() });
  }
  pump(backend);
}
