import { tooltipEvents } from '../globals/tooltipEvents.js';

/**
 * Extend this tooltip's map events with camera and terrain position updates.
 *
 * @returns {Object} Map event handlers.
 */
export function tooltipGetEvents() {
  const events = tooltipEvents.value.call(this);
  events.rotate = events.pitch = events.move = events.terrainchange = this._updatePosition;
  return events;
}
