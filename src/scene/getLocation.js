import { pluginState } from '../core/pluginState.js';

export function getLocation(layer) {
  return pluginState(layer).location;
}
