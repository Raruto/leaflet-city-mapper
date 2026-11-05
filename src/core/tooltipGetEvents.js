import { state as sharedState } from '../state.js';

export function tooltipGetEvents() {
  const events = sharedState.tooltipEvents.call(this);
  events.rotate = events.pitch = events.move = this._updatePosition;
  return events;
}
