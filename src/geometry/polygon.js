import { line } from './line.js';
import { fillNativePolygon } from './fillNativePolygon.js';

/**
 * Project polygon or line rings and append their fill and stroke geometry.
 *
 * @param {Object} context Projection, style and geometry buffers.
 * @param {Array<Array<L.LatLng>>} rings Geographic rings or lines.
 * @param {boolean} closed Whether to close and optionally fill the rings.
 */
export function polygon(context, rings, closed) {
  const { options, map } = context;
  const projected = /* alloc */ [];
  let ring, path, latlng;
  for (ring of rings) {
    path = /* alloc */ [];
    for (latlng of ring) path.push(map.project(latlng));
    projected.push(path);
  }
  if (closed && options.fill && projected[0]?.length >= 3) {
    fillNativePolygon(context, projected);
  }
  for (ring of projected) line(context, ring, closed);
}
