import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';

export function markerGetEvents() {
  const events = pluginState(sharedState.markerMethods).getEvents.call(this);
  events.rotate = events.pitch = events.move = this.update;
  return events;
}
