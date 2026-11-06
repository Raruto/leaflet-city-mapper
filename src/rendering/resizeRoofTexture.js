import { roofTexture } from '../globals/roofTexture.js';
import { roofSampler } from '../globals/roofSampler.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { destroyTexture } from './destroyTexture.js';

export function resizeRoofTexture(backend, roof, width, height) {
  const renderer = sceneByLayer.get(backend).renderer;
  const descriptor = roofTexture;
  descriptor.size[0] = width; descriptor.size[1] = height;
  descriptor.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT;
  if (roof.texture && (roof.texture.width !== width || roof.texture.height !== height)) {
    destroyTexture(backend, roof.texture.texture);
    roof.texture.texture = renderer.device.createTexture(descriptor);
    roof.texture.width = width; roof.texture.height = height;
  }
  roof.texture ||= /* alloc */ {
    device: renderer.device,
    texture: renderer.device.createTexture(descriptor),
    sampler: renderer.device.createSampler(roofSampler),
    samplerOptions: /* alloc */ { addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' },
    image: null, width, height,
    format: 'rgba8unorm', srgb: false, flipY: false, uploaded: null,
  };
}
