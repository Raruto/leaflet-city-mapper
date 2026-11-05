import { shadowTexture } from '../globals/shadowTexture.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { bindSunlight } from './bindSunlight.js';
import { destroyTexture } from '../rendering/destroyTexture.js';

export function resizeSunlight(backend, size) {
  const device = sceneByLayer.get(backend).renderer.device, sun = sceneByLayer.get(backend).renderer.sunlight;
  if (sun.size === size) return;
  if (sun.texture) destroyTexture(backend, sun.texture);
  sun.size = size;
  sun.texture = device.createTexture((
    shadowTexture.size[0] = size,
    shadowTexture.size[1] = size,
    shadowTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
    shadowTexture
  ));

  bindSunlight(backend);
}
