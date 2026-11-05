import { pluginState } from '../core/pluginState.js';

export function isLoading(layer) {
  return pluginState(layer)._loadingTiles > 0;
}
