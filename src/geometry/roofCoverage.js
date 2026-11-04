/** Test the mesh's ground footprint against loaded imagery, including coarse parent tiles. */
export function roofCoverage(mesh, backend, rasters) {
  const map = backend._map, bounds = mesh.geometry.bounds, world = mesh.worldMatrix;
  let intersectsArchive = false;
  for (const layer of rasters) {
    const zoom = layer._tileZoom, origin = map.project(backend._sceneOrigin, zoom);
    const scale = map.options.crs.scale(zoom) / (40075016.68557849 * Math.cos(backend._sceneOrigin.lat * Math.PI / 180));
    const min = [Infinity, Infinity], max = [-Infinity, -Infinity];
    for (let i = 0; i < 8; i++) {
      const x = i & 1 ? bounds.max[0] : bounds.min[0], y = i & 2 ? bounds.max[1] : bounds.min[1];
      const z = i & 4 ? bounds.max[2] : bounds.min[2];
      const px = origin.x + (world[0] * x + world[4] * y + world[8] * z + world[12]) * scale;
      const py = origin.y + (world[2] * x + world[6] * y + world[10] * z + world[14]) * scale;
      min[0] = Math.min(min[0], px); min[1] = Math.min(min[1], py);
      max[0] = Math.max(max[0], px); max[1] = Math.max(max[1], py);
    }
    if (layer.header.maxLat !== undefined && layer.header.minLon !== undefined &&
      layer.header.minLat !== undefined && layer.header.maxLon !== undefined) {
      const nw = map.project([layer.header.maxLat, layer.header.minLon], zoom);
      const se = map.project([layer.header.minLat, layer.header.maxLon], zoom);
      min[0] = Math.max(min[0], nw.x); min[1] = Math.max(min[1], nw.y);
      max[0] = Math.min(max[0], se.x); max[1] = Math.min(max[1], se.y);
      if (min[0] >= max[0] || min[1] >= max[1]) continue;
    }
    intersectsArchive = true;
    let remaining = [[min[0], min[1], max[0], max[1]]];
    for (const tile of layer._rasterTiles.values()) {
      // Failed imagery already reports an error; do not hide the building indefinitely.
      if (!tile.done && !tile.error) continue;
      const size = 256 * 2 ** (zoom - tile.coords.z);
      const left = tile.coords.x * size, top = tile.coords.y * size;
      remaining = remaining.flatMap(([x0, y0, x1, y1]) => {
        const l = Math.max(x0, left), t = Math.max(y0, top);
        const r = Math.min(x1, left + size), b = Math.min(y1, top + size);
        if (l >= r || t >= b) return [[x0, y0, x1, y1]];
        const pieces = [];
        if (y0 < t) pieces.push([x0, y0, x1, t]);
        if (b < y1) pieces.push([x0, b, x1, y1]);
        if (x0 < l) pieces.push([x0, t, l, b]);
        if (r < x1) pieces.push([r, t, x1, b]);
        return pieces;
      });
      if (!remaining.length) return true;
    }
  }
  return !intersectsArchive;
}
