import { markerMethods } from '../globals/markerMethods.js';

/**
 * Extend this marker's map events with camera movement updates.
 *
 * @returns {Object} Map event handlers.
 */
export function markerGetEvents() {
  const events = markerMethods.value.getEvents.call(this);
  events.rotate = events.pitch = events.move = this.update;
  return events;
}
