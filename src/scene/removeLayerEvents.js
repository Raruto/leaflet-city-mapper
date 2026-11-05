import { pluginState } from '../core/pluginState.js';

export function removeLayerEvents() {
  const state = pluginState(this);
  state.eventMap.off(state.events, this);
  state.events = state.eventMap = null;
}
