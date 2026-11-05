import { state as sharedState } from '../state.js';

export function popupGetEvents() {
  const events = sharedState.popupEvents.call(this);
  events.rotate = events.pitch = events.move = this._updatePosition;
  return events;
}
