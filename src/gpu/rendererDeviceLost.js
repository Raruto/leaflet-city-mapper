import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';

import { rendererDevices } from '../weakmaps/rendererDevices.js';
import { renderers } from '../weakmaps/renderers.js';



export function rendererDeviceLost([info, device]) {
  const map = rendererDevices.get(device);
  const owner = renderers.get(map);
  if (!owner || rendererByLayer.get(owner)?.device !== device) return;
  const error = /* alloc */ new Error(`WebGPU device lost: ${info.message || info.reason}`);
  let layer;
  for (layer of layersByLayer.get(owner)) layer.fire('error', /* alloc */ { error });
}
