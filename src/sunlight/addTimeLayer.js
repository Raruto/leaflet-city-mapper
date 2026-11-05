import { pluginState } from '../core/pluginState.js';
export function addTimeLayer(map) {
  return pluginState(this).control.addTo(map);
}
