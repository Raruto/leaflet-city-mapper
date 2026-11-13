import { markerSetRotation } from './markerSetRotation.js';

/**
 * Set this marker's rotation.
 *
 * @param {number} rotation Rotation value.
 *
 * @returns {L.Marker} This marker.
 */
export function setRotation(rotation) {
  return markerSetRotation(this, rotation);
}
