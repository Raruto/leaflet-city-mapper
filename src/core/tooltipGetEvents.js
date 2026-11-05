import { tooltipEvents } from '../globals/tooltipEvents.js';


export function tooltipGetEvents() {
  const events = tooltipEvents.value.call(this);
  events.rotate = events.pitch = events.move = this._updatePosition;
  return events;
}
