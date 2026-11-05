import { pluginState } from '../core/pluginState.js';
export function removeTimeLayer() {
  return L.Control.prototype.remove.call(pluginState(this).control);
}
