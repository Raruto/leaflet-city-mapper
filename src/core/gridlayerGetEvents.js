import { gridEvents } from '../globals/gridEvents.js';



export function gridlayerGetEvents() {
  const events = gridEvents.value.call(this);
  events.rotate = events.pitch = L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this);
  return events;
}
