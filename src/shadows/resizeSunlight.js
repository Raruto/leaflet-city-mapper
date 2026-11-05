import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { bindSunlight } from './bindSunlight.js';
import { destroyTexture } from '../rendering/destroyTexture.js';

export function resizeSunlight(backend, size) {
  const gpuCreateTexture1 = sharedState.allocationRenderResizeSunlightCreateTexture1;
  const device = pluginState(backend).renderer.device, sun = pluginState(backend).renderer.sunlight;
  if (sun.size === size) return;
  if (sun.texture) destroyTexture(backend, sun.texture);
  sun.size = size;
  sun.texture = device.createTexture((
    gpuCreateTexture1.size[0] = size,
    gpuCreateTexture1.size[1] = size,
    gpuCreateTexture1.usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
    gpuCreateTexture1
  ));

  bindSunlight(backend);
}
