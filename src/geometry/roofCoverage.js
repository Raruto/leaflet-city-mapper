/** Test the mesh's ground footprint against loaded imagery, including coarse parent tiles. */
export function roofCoverage(mesh, backend, rasters) {
  const map = backend._map, bounds = mesh.geometry.bounds, world = mesh.worldMatrix;
  let intersectsArchive = false;
  let layer, zoom, origin, scale, min, max, i, x, y, z, px, py, nw, se, remaining, tile, size, left;
  let top, pieces, x0, y0, x1, y1, l, t, r, b;
  for (layer of rasters) {
    zoom = layer._tileZoom, origin = map.project(backend._sceneOrigin, zoom);
    scale = map.options.crs.scale(zoom) / (40075016.68557849 * Math.cos(backend._sceneOrigin.lat * Math.PI / 180));
    min = [Infinity, Infinity], max = [-Infinity, -Infinity];
    for (i = 0; i < 8; i++) {
      x = i & 1 ? bounds.max[0] : bounds.min[0], y = i & 2 ? bounds.max[1] : bounds.min[1];
      z = i & 4 ? bounds.max[2] : bounds.min[2];
      px = origin.x + (world[0] * x + world[4] * y + world[8] * z + world[12]) * scale;
      py = origin.y + (world[2] * x + world[6] * y + world[10] * z + world[14]) * scale;
      min[0] = Math.min(min[0], px); min[1] = Math.min(min[1], py);
      max[0] = Math.max(max[0], px); max[1] = Math.max(max[1], py);
    }
    if (layer.header.maxLat !== undefined && layer.header.minLon !== undefined &&
      layer.header.minLat !== undefined && layer.header.maxLon !== undefined) {
      nw = map.project([layer.header.maxLat, layer.header.minLon], zoom);
      se = map.project([layer.header.minLat, layer.header.maxLon], zoom);
      min[0] = Math.max(min[0], nw.x); min[1] = Math.max(min[1], nw.y);
      max[0] = Math.min(max[0], se.x); max[1] = Math.min(max[1], se.y);
      if (min[0] >= max[0] || min[1] >= max[1]) continue;
    }
    intersectsArchive = true;
    remaining = [[min[0], min[1], max[0], max[1]]];
    for (tile of layer._rasterTiles.values()) {
      // Failed imagery already reports an error; do not hide the building indefinitely.
      if (!tile.done && !tile.error) continue;
      size = 256 * 2 ** (zoom - tile.coords.z);
      left = tile.coords.x * size, top = tile.coords.y * size;
      pieces = [];
      for ([x0, y0, x1, y1] of remaining) {
        l = Math.max(x0, left), t = Math.max(y0, top);
        r = Math.min(x1, left + size), b = Math.min(y1, top + size);
        if (l >= r || t >= b) {
          pieces.push([x0, y0, x1, y1]);
          continue;
        }
        if (y0 < t) pieces.push([x0, y0, x1, t]);
        if (b < y1) pieces.push([x0, b, x1, y1]);
        if (x0 < l) pieces.push([x0, t, l, b]);
        if (r < x1) pieces.push([r, t, x1, b]);
      }
      remaining = pieces;
      if (!remaining.length) return true;
    }
  }
  return !intersectsArchive;
}
