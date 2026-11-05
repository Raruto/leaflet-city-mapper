import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

export function rendererDeviceLost([info, device]) {
  const map = sharedState.rendererDevices.get(device);
  const owner = sharedState.renderers.get(map);
  if (!owner || pluginState(owner).renderer?.device !== device) return;
  const error = /* allocation: required -- Preserve this device loss as an independent failure. */ new Error(`WebGPU device lost: ${info.message || info.reason}`);
  let layer;
  for (layer of pluginState(owner)._layers) layer.fire('error', /* allocation: required -- Deliver an independently mutable error event to each layer. */ { error });
}
