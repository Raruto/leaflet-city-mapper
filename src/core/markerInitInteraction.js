import { markerMethods } from '../globals/markerMethods.js';
import { cameraMarkerDrag } from './cameraMarkerDrag.js';

/**
 * Initialize this marker's Leaflet interaction and camera-aware dragging.
 *
 * @returns {*} Original interaction initializer result.
 */
export function markerInitInteraction() {
  const result = markerMethods.value._initInteraction.call(this);
  cameraMarkerDrag.call(this);
  return result;
}
