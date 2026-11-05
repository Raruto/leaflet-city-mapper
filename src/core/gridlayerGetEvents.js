import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';

export function gridlayerGetEvents() {
  const events = sharedState.gridEvents.call(this);
  pluginState(this)._cameraGridUpdate ||= L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this);
  events.rotate = events.pitch = pluginState(this)._cameraGridUpdate;
  return events;
}
