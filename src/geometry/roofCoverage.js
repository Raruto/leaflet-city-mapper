import { pluginState } from '../core/pluginState.js';
/** Test the mesh's ground footprint against loaded imagery, including coarse parent tiles. */
export function roofCoverage(mesh, backend, rasters) {
  const map = backend._map, bounds = mesh.geometry.bounds, world = mesh.worldMatrix;
  let intersectsArchive = false;
  let layer, zoom, origin, scale, minX, minY, maxX, maxY, i, x, y, z, px, py, nw, se, remaining, tile, size, left;
  let top, pieces, x0, y0, x1, y1, l, t, r, b;
  for (layer of rasters) {
    zoom = pluginState(layer)._tileZoom, origin = map.project(pluginState(backend)._sceneOrigin, zoom);
    scale = map.options.crs.scale(zoom) / (40075016.68557849 * Math.cos(pluginState(backend)._sceneOrigin.lat * Math.PI / 180));
    minX = minY = Infinity; maxX = maxY = -Infinity;
    for (i = 0; i < 8; i++) {
      x = i & 1 ? bounds.max[0] : bounds.min[0], y = i & 2 ? bounds.max[1] : bounds.min[1];
      z = i & 4 ? bounds.max[2] : bounds.min[2];
      px = origin.x + (world[0] * x + world[4] * y + world[8] * z + world[12]) * scale;
      py = origin.y + (world[2] * x + world[6] * y + world[10] * z + world[14]) * scale;
      minX = Math.min(minX, px); minY = Math.min(minY, py);
      maxX = Math.max(maxX, px); maxY = Math.max(maxY, py);
    }
    if (pluginState(layer).header.maxLat !== undefined && pluginState(layer).header.minLon !== undefined &&
      pluginState(layer).header.minLat !== undefined && pluginState(layer).header.maxLon !== undefined) {
      nw = map.project(/* allocation: required -- The projection callback may retain this archive corner coordinate. */ [pluginState(layer).header.maxLat, pluginState(layer).header.minLon], zoom);
      se = map.project(/* allocation: required -- The projection callback may retain this archive corner coordinate. */ [pluginState(layer).header.minLat, pluginState(layer).header.maxLon], zoom);
      minX = Math.max(minX, nw.x); minY = Math.max(minY, nw.y);
      maxX = Math.min(maxX, se.x); maxY = Math.min(maxY, se.y);
      if (minX >= maxX || minY >= maxY) continue;
    }
    intersectsArchive = true;
    remaining = /* allocation: required -- Rectangle subtraction needs an operation-local worklist across reentrant tile access. */ [
      /* allocation: required -- The uncovered footprint has independently mutable rectangle coordinates. */ [minX, minY, maxX, maxY],
    ];
    for (tile of pluginState(layer)._rasterTiles.values()) {
      // Failed imagery already reports an error; do not hide the building indefinitely.
      if (!tile.done && !tile.error) continue;
      size = 256 * 2 ** (zoom - tile.coords.z);
      left = tile.coords.x * size, top = tile.coords.y * size;
      pieces = /* allocation: required -- Each subtraction step retains its own uncovered rectangles while consuming the previous list. */ [];
      for ([x0, y0, x1, y1] of remaining) {
        l = Math.max(x0, left), t = Math.max(y0, top);
        r = Math.min(x1, left + size), b = Math.min(y1, top + size);
        if (l >= r || t >= b) {
          pieces.push(/* allocation: required -- This surviving rectangle retains its coordinates for the next subtraction step. */ [x0, y0, x1, y1]);
          continue;
        }
        if (y0 < t) pieces.push(/* allocation: required -- The uncovered top strip needs independent coordinates in the worklist. */ [x0, y0, x1, t]);
        if (b < y1) pieces.push(/* allocation: required -- The uncovered bottom strip needs independent coordinates in the worklist. */ [x0, b, x1, y1]);
        if (x0 < l) pieces.push(/* allocation: required -- The uncovered left strip needs independent coordinates in the worklist. */ [x0, t, l, b]);
        if (r < x1) pieces.push(/* allocation: required -- The uncovered right strip needs independent coordinates in the worklist. */ [r, t, x1, b]);
      }
      remaining = pieces;
      if (!remaining.length) return true;
    }
  }
  return !intersectsArchive;
}
