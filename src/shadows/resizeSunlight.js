import { rendererByLayer } from '../weakmaps/rendererByLayer.js';

import { shadowTexture } from '../globals/shadowTexture.js';


import { bindSunlight } from './bindSunlight.js';
import { destroyTexture } from '../textures/destroyTexture.js';

export function resizeSunlight(layer, size) {
  const device = rendererByLayer.get(layer).device, sun = rendererByLayer.get(layer).sunlight;
  if (sun.size === size) return;
  if (sun.texture) destroyTexture(layer, sun.texture);
  sun.size = size;
  sun.texture = device.createTexture((
    shadowTexture.size[0] = size,
    shadowTexture.size[1] = size,
    shadowTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
    shadowTexture
  ));

  bindSunlight(layer);
}
