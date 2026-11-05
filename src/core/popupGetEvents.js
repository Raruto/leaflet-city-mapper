import { popupEvents } from '../globals/popupEvents.js';


export function popupGetEvents() {
  const events = popupEvents.value.call(this);
  events.rotate = events.pitch = events.move = this._updatePosition;
  return events;
}
