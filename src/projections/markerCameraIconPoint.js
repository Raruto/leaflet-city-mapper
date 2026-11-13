import { L } from '../globals/L.js';
import { radians } from '../globals/radians.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';

/**
 * Rotate and scale an icon point according to marker options and the map bearing.
 *
 * @param {L.Marker} marker Marker with rotation and scale options.
 * @param {number} x Horizontal icon coordinate.
 * @param {number} y Vertical icon coordinate.
 *
 * @returns {L.Point} Transformed icon point.
 */
export function markerCameraIconPoint(marker, x, y) {
  let rotation = marker.options.rotation + (marker.options.rotateWithView ? mapGetBearing(marker._map) * radians : 0);
  if (marker.options.keepUpright && Math.cos(rotation) < 0) rotation += Math.PI;
  const scale = marker.options.scale;
  return /* alloc */ new L.Point((x * Math.cos(rotation) - y * Math.sin(rotation)) * scale,
    (x * Math.sin(rotation) + y * Math.cos(rotation)) * scale);
}
