import { sceneByLayer } from '../globals/sceneByLayer.js';


import { pump } from "./pump.js";
import { releaseArea } from './releaseArea.js';
import { compareAreaDistance } from './compareAreaDistance.js';

/** Cover the visible ground bounds and one bordering block, clipped to the archive. */

export function updateArea(backend) {
  if (!backend._map || !sceneByLayer.get(backend)._shared) return;
  if (sceneByLayer.get(backend)._geojson) {
    if (!sceneByLayer.get(backend)._areas.has('geojson')) {
      sceneByLayer.get(backend)._areas.set('geojson', /* allocation: required -- Keep the GeoJSON cancellation request independent. */ { request: /* allocation: required -- Give this area its own abort signal. */ new AbortController() });
    }
    pump(backend);
    return;
  }
  if (!sceneByLayer.get(backend).header) return;
  const z = sceneByLayer.get(backend).header.minZoom;
  const center = backend._map.project(backend._map.getCenter(), z).divideBy(256).floor();
  const bounds = backend._map.getBounds();
  const nw = backend._map.project(bounds.getNorthWest(), z).divideBy(256).floor();
  const se = backend._map.project(bounds.getSouthEast(), z).divideBy(256).floor();
  const archiveNW = backend._map.project(/* allocation: required -- Provide this projection's independent coordinate input. */ [sceneByLayer.get(backend).header.maxLat, sceneByLayer.get(backend).header.minLon], z).divideBy(256).floor();
  const archiveSE = backend._map.project(/* allocation: required -- Provide this projection's independent coordinate input. */ [sceneByLayer.get(backend).header.minLat, sceneByLayer.get(backend).header.maxLon], z).divideBy(256).floor();
  const wanted = /* allocation: required -- Keep this update's desired tile snapshot independent of reentrant updates. */ new Map();
  let x, y, key, area, coords;
  for (x = Math.max(0, nw.x - 1, archiveNW.x); x <= Math.min(2 ** z - 1, se.x + 1, archiveSE.x); x++) {
    for (y = Math.max(0, nw.y - 1, archiveNW.y); y <= Math.min(2 ** z - 1, se.y + 1, archiveSE.y); y++) {
      wanted.set(`${x}/${y}`, /* allocation: required -- Preserve each tile's coordinates for its async request. */ { z, x, y });
    }
  }
  for ([key, area] of sceneByLayer.get(backend)._areas) {
    if (!wanted.has(key)) {
      releaseArea(backend, area);
      sceneByLayer.get(backend)._areas.delete(key);
    }
  }
  // Load the nearest new blocks first without rebuilding retained geometry.
  const areas = /* allocation: required -- Sort a private request queue without changing the map's area store. */ [];
  for ([key, coords] of wanted) {
    coords.distance = Math.hypot(coords.x + 0.5 - center.x, coords.y + 0.5 - center.y) / 2 ** z;
    areas.push(coords);
  }
  areas.sort(compareAreaDistance);
  for (coords of areas) {
    key = `${coords.x}/${coords.y}`;
    if (!sceneByLayer.get(backend)._areas.has(key)) sceneByLayer.get(backend)._areas.set(key, /* allocation: required -- Keep each tile's request lifetime independent. */ { coords, request: /* allocation: required -- Give this tile its own cancellation signal. */ new AbortController() });
  }
  pump(backend);
}
