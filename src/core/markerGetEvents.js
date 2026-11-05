import { markerMethods } from '../globals/markerMethods.js';



export function markerGetEvents() {
  const events = markerMethods.value.getEvents.call(this);
  events.rotate = events.pitch = events.move = this.update;
  return events;
}
