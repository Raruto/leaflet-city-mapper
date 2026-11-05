import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

export function rendererDeviceError(event) {
  const map = sharedState.rendererDevices.get(event.currentTarget);
  const owner = sharedState.renderers.get(map);
  if (pluginState(owner)?.renderer?.device !== event.currentTarget) return;
  if (!pluginState(owner)._layers) return;
  let layer;
  for (layer of pluginState(owner)._layers) layer.fire('error', /* allocation: required -- Deliver an independently mutable error event to each layer. */ { error: event.error });
}
