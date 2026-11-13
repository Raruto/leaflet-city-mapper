import { radians } from '../globals/radians.js';
import { markerSetRotation } from '../core/markerSetRotation.js';

/**
 * Rotate a line label to follow its projected segment while keeping text upright.
 *
 * @param {Object} map Leaflet map.
 * @param {Object} marker Label marker.
 * @param {Object} label Label candidate with optional line endpoints.
 */
export function rotateVectorLabel(map, marker, label) {
  if (!label.along) return;
  const a = map.latLngToContainerPoint(label.along[0]), b = map.latLngToContainerPoint(label.along[1]);
  let angle = Math.atan2(b.y - a.y, b.x - a.x) / radians;
  if (angle > 90) angle -= 180;
  else if (angle < -90) angle += 180;
  if (marker.options.rotation === angle * radians) return;
  markerSetRotation(marker, angle * radians);
}
