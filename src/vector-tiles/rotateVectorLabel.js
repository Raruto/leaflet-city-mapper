import { radians } from '../globals/radians.js';
import { markerSetRotation } from '../core/markerSetRotation.js';

export function rotateVectorLabel(map, marker, label) {
  if (!label.along) return;
  const a = map.latLngToContainerPoint(label.along[0]), b = map.latLngToContainerPoint(label.along[1]);
  let angle = Math.atan2(b.y - a.y, b.x - a.x) / radians;
  if (angle > 90) angle -= 180;
  else if (angle < -90) angle += 180;
  if (marker.options.rotation === angle * radians) return;
  markerSetRotation(marker, angle * radians);
}
