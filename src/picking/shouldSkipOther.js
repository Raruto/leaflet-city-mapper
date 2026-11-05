import { pluginState } from '../core/pluginState.js';
export function shouldSkipOther(other, layer) {
  return other === layer || pluginState(other)._type === 'terrain' || pluginState(other)._type === 'traffic';
}
