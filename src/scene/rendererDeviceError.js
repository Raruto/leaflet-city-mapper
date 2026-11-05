import { rendererDevices } from '../globals/rendererDevices.js';
import { renderers } from '../globals/renderers.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



export function rendererDeviceError(event) {
  const map = rendererDevices.get(event.currentTarget);
  const owner = renderers.get(map);
  if (sceneByLayer.get(owner)?.renderer?.device !== event.currentTarget) return;
  if (!sceneByLayer.get(owner)._layers) return;
  let layer;
  for (layer of sceneByLayer.get(owner)._layers) layer.fire('error', /* alloc */ { error: event.error });
}
