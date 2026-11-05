import { pluginState } from '../core/pluginState.js';

export function callLayer(method, layer, ...args) {
  const operation = pluginState(layer)[method] || layer[method];
  return operation.apply(layer, args);
}
