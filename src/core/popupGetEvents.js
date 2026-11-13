import { popupEvents } from '../globals/popupEvents.js';

/**
 * Extend this popup's map events with camera and terrain position updates.
 *
 * @returns {Object} Map event handlers.
 */
export function popupGetEvents() {
  const events = popupEvents.value.call(this);
  events.rotate = events.pitch = events.move = events.terrainchange = this._updatePosition;
  return events;
}
