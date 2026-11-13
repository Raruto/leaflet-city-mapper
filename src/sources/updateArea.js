import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { pump } from "./pumpSourceAreas.js";
import { releaseArea } from './releaseArea.js';
import { compareAreaDistance } from './compareAreaDistance.js';

/**
 * Update source areas covering visible ground and one bordering block, clipped to the archive.
 *
 * @param {L.Layer} layer Source layer.
 */
export function updateArea(layer) {
  if (!layer._map || !sharedByLayer.get(layer)) return;
  if (geojsonByLayer.get(layer)) {
    if (!areasByLayer.get(layer).has('geojson')) {
      areasByLayer.get(layer).set('geojson', /* alloc */ { request: /* alloc */ new AbortController() });
    }
    pump(layer);
    return;
  }
  if (!headerByLayer.get(layer)) return;
  const z = headerByLayer.get(layer).minZoom;
  const center = layer._map.project(layer._map.getCenter(), z).divideBy(256).floor();
  const bounds = layer._map.getBounds();
  const nw = layer._map.project(bounds.getNorthWest(), z).divideBy(256).floor();
  const se = layer._map.project(bounds.getSouthEast(), z).divideBy(256).floor();
  const archiveNW = layer._map.project(/* alloc */ [headerByLayer.get(layer).maxLat, headerByLayer.get(layer).minLon], z).divideBy(256).floor();
  const archiveSE = layer._map.project(/* alloc */ [headerByLayer.get(layer).minLat, headerByLayer.get(layer).maxLon], z).divideBy(256).floor();
  const wanted = /* alloc */ new Map();
  let x, y, key, area, coords;
  for (x = Math.max(0, nw.x - 1, archiveNW.x); x <= Math.min(2 ** z - 1, se.x + 1, archiveSE.x); x++) {
    for (y = Math.max(0, nw.y - 1, archiveNW.y); y <= Math.min(2 ** z - 1, se.y + 1, archiveSE.y); y++) {
      wanted.set(`${x}/${y}`, /* alloc */ { z, x, y });
    }
  }
  for ([key, area] of areasByLayer.get(layer)) {
    if (!wanted.has(key)) {
      releaseArea(layer, area);
      areasByLayer.get(layer).delete(key);
    }
  }
  // Load the nearest new blocks first without rebuilding retained geometry.
  const areas = /* alloc */ [];
  for ([key, coords] of wanted) {
    coords.distance = Math.hypot(coords.x + 0.5 - center.x, coords.y + 0.5 - center.y) / 2 ** z;
    areas.push(coords);
  }
  areas.sort(compareAreaDistance);
  for (coords of areas) {
    key = `${coords.x}/${coords.y}`;
    if (!areasByLayer.get(layer).has(key)) areasByLayer.get(layer).set(key, /* alloc */ { coords, request: /* alloc */ new AbortController() });
  }
  pump(layer);
}
