import { sceneByLayer } from '../globals/sceneByLayer.js';


import { textureSampler } from './textureSampler.js';

export function textureFor(context, reference, color = false) {
  const { backend, description, images, textures } = context;
  if (!reference) return null;
  if ((reference.texCoord || 0) !== 0 || reference.extensions) {
    throw /* allocation: required -- Texture validation errors retain this model conversion stack. */ new Error('Model textures currently require untransformed TEXCOORD_0 UVs');
  }
  const device = sceneByLayer.get(backend).renderer.device;
  // A glTF image may serve both color and data maps: those cannot share a GPU format.
  const key = `${reference.index}:${color}`;
  if (!textures.has(key)) {
    const texture = description.textures[reference.index];
    const sampler = description.samplers?.[texture.sampler];
    const image = images[texture.source];
    const format = color ? 'rgba8unorm-srgb' : 'rgba8unorm';
    const samplerOptions = textureSampler(sampler);
    textures.set(key, /* allocation: required -- The model texture cache retains this device and format-specific texture record. */ {
      device,
      texture: device.createTexture(/* allocation: required -- The device receives an independent image-specific texture descriptor. */ {
        size: /* allocation: required -- The texture descriptor retains this image-specific extent. */ [image.width, image.height],
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
