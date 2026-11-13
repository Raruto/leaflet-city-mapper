import { L } from '../globals/L.js';
import { gridEvents } from '../globals/gridEvents.js';

/**
 * Extend this grid layer's map events to update tiles on rotation and pitch.
 *
 * @returns {Object} Map event handlers.
 */
export function gridlayerGetEvents() {
  const events = gridEvents.value.call(this);
  events.rotate = events.pitch = L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this);
  return events;
}
