import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';

import { rendererDevices } from '../weakmaps/rendererDevices.js';
import { renderers } from '../weakmaps/renderers.js';



export function rendererDeviceError(event) {
  const map = rendererDevices.get(event.currentTarget);
  const owner = renderers.get(map);
  if (rendererByLayer.get(owner)?.device !== event.currentTarget) return;
  if (!layersByLayer.get(owner)) return;
  let layer;
  for (layer of layersByLayer.get(owner)) layer.fire('error', /* alloc */ { error: event.error });
}
