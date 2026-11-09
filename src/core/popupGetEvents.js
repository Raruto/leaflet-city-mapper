import { popupEvents } from '../globals/popupEvents.js';


export function popupGetEvents() {
  const events = popupEvents.value.call(this);
  events.rotate = events.pitch = events.move = events.terrainchange = this._updatePosition;
  return events;
}
