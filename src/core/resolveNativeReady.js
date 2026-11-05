import { pluginState } from './pluginState.js';
export function resolveNativeReady() {
  pluginState(this).ready.resolve();
}
