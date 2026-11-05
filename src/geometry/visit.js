import { polygon } from './polygon.js';

export function visit(context, coordinates, closed) {
  if (!coordinates.length) return;
  let child;
  if (coordinates[0] instanceof L.LatLng) polygon(context, [coordinates], closed);
  else if (closed && coordinates[0][0] instanceof L.LatLng) polygon(context, coordinates, closed);
  else for (child of coordinates) visit(context, child, closed);
}
