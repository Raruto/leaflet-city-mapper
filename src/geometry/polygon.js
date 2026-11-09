import { line } from './line.js';
import { fillNativePolygon } from './fillNativePolygon.js';

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
