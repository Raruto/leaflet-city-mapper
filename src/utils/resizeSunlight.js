import { bindSunlight } from './bindSunlight';
import { destroyTexture } from './destroyTexture';


export function resizeSunlight(backend, size) {
  const device = backend.renderer.device, sun = backend.renderer.sunlight;
  if (sun.size === size) return;
  if (sun.texture) destroyTexture(backend, sun.texture);
  sun.size = size;
  sun.texture = device.createTexture({
    size: [size, size], format: 'depth32float',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
  });
  bindSunlight(backend);
}
