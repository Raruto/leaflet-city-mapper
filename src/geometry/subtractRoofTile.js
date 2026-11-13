/**
 * Subtract a raster tile's footprint from uncovered roof rectangles.
 *
 * @param {Array<Array<number>>} remaining Uncovered pixel rectangles.
 * @param {Object} tile Raster tile with XYZ coordinates.
 * @param {number} zoom Zoom used by the rectangles.
 *
 * @returns {Array<Array<number>>} Remaining uncovered rectangles.
 */
export function subtractRoofTile(remaining, tile, zoom) {
  const size = 256 * 2 ** (zoom - tile.coords.z);
  const left = tile.coords.x * size, top = tile.coords.y * size;
  const pieces = /* alloc */ [];
  let x0, y0, x1, y1, l, t, r, b;
  for ([x0, y0, x1, y1] of remaining) {
    l = Math.max(x0, left), t = Math.max(y0, top);
    r = Math.min(x1, left + size), b = Math.min(y1, top + size);
    if (l >= r || t >= b) {
      pieces.push(/* alloc */ [x0, y0, x1, y1]);
      continue;
    }
    if (y0 < t) pieces.push(/* alloc */ [x0, y0, x1, t]);
    if (b < y1) pieces.push(/* alloc */ [x0, b, x1, y1]);
    if (x0 < l) pieces.push(/* alloc */ [x0, t, l, b]);
    if (r < x1) pieces.push(/* alloc */ [r, t, x1, b]);
  }
  return pieces;
}
