import { rendererDevices } from '../globals/rendererDevices.js';
import { renderers } from '../globals/renderers.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



export function rendererDeviceLost([info, device]) {
  const map = rendererDevices.get(device);
  const owner = renderers.get(map);
  if (!owner || sceneByLayer.get(owner).renderer?.device !== device) return;
  const error = /* alloc */ new Error(`WebGPU device lost: ${info.message || info.reason}`);
  let layer;
  for (layer of sceneByLayer.get(owner)._layers) layer.fire('error', /* alloc */ { error });
}
