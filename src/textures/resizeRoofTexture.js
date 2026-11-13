import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { roofTexture } from '../globals/roofTexture.js';
import { roofSampler } from '../globals/roofSampler.js';
import { destroyTexture } from './destroyTexture.js';

/**
 * Create or resize the GPU texture used for the roof atlas.
 *
 * @param {L.Layer} layer Rendering layer.
 * @param {Object} roof Roof atlas state.
 * @param {number} width Texture width in pixels.
 * @param {number} height Texture height in pixels.
 */
export function resizeRoofTexture(layer, roof, width, height) {
  const renderer = rendererByLayer.get(layer);
  const descriptor = roofTexture;
  descriptor.size[0] = width; descriptor.size[1] = height;
  descriptor.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT;
  if (roof.texture && (roof.texture.width !== width || roof.texture.height !== height)) {
    destroyTexture(layer, roof.texture.texture);
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
