import { pluginState } from './pluginState.js';
export function rejectNativeReady({ error }) {
  pluginState(this).ready.reject(error);
}
