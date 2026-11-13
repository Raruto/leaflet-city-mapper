import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { textureSampler } from './modelTextureSampler.js';

/**
 * Get or create a model texture, using separate cache entries for color and data formats.
 *
 * @param {Object} context Model context containing images, texture descriptions and cache.
 * @param {Object} reference glTF texture reference, if present.
 * @param {boolean} [color] Whether to use an sRGB color format.
 *
 * @returns {Object|null} Cached texture state, or null without a reference.
 *
 * @throws {Error} If the texture uses transformed UVs or a set other than TEXCOORD_0.
 */
export function textureFor(context, reference, color = false) {
  const { backend: layer, description, images, textures } = context;
  if (!reference) return null;
  if ((reference.texCoord || 0) !== 0 || reference.extensions) {
    throw /* alloc */ new Error('Model textures currently require untransformed TEXCOORD_0 UVs');
  }
  const device = rendererByLayer.get(layer).device;
  // A glTF image may serve both color and data maps: those cannot share a GPU format.
  const key = `${reference.index}:${color}`;
  if (!textures.has(key)) {
    const texture = description.textures[reference.index];
    const sampler = description.samplers?.[texture.sampler];
    const image = images[texture.source];
    const format = color ? 'rgba8unorm-srgb' : 'rgba8unorm';
    const samplerOptions = textureSampler(sampler);
    textures.set(key, /* alloc */ {
      device,
      texture: device.createTexture(/* alloc */ {
        size: /* alloc */ [image.width, image.height],
        format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }),
      sampler: device.createSampler(samplerOptions),
      samplerOptions,
      format,
      srgb: color,
      image,
      flipY: false,
      uploaded: null,
    });
  }
  return textures.get(key);
}
