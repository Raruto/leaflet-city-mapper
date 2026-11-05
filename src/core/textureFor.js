import { sceneByLayer } from '../globals/sceneByLayer.js';
import { coreSampler } from '../globals/coreSampler.js';

import { disposeMesh } from '../rendering/disposeMesh.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { uploadCanvasTexture } from './uploadCanvasTexture.js';


export function textureFor(state, key, image) {
  if (!(image instanceof HTMLImageElement) && !(image instanceof HTMLCanvasElement)) {
    throw /* alloc */ new Error('WebGPU native raster layers require image or canvas tiles');
  }
  const { backend, textures, meshes } = state;
  let texture = textures.get(key);
  const url = image.currentSrc || image.src;
  if (!texture || texture.image !== image || texture.url !== url) {
    if (texture) {
      const mesh = meshes.get(key);
      if (mesh) disposeMesh(backend, mesh);
      meshes.delete(key);
      destroyTexture(backend, texture.texture);
      textures.delete(key);
    }
    const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
    if (!width || !height) return;
    const { device } = sceneByLayer.get(backend).renderer;
    texture = /* alloc */ {
      device, image, url, format: 'rgba8unorm', uploaded: null,
      texture: device.createTexture(/* alloc */ {
        size: /* alloc */ [width, height], format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }),
      sampler: device.createSampler(coreSampler),
    };
    textures.set(key, texture);
    if (image instanceof HTMLCanvasElement) {
      texture.pending = true;
      uploadCanvasTexture(state, key, texture, image, device, width, height);
    } else {
      try {
        device.queue.copyExternalImageToTexture(
          /* alloc */ { source: image },
          /* alloc */ { texture: texture.texture },
          /* alloc */ [width, height]);
      } catch (error) {
        texture.texture.destroy();
        textures.delete(key);
        throw error;
      }
      texture.uploaded = image;
    }
  }
  texture.used = true;
  return texture.uploaded === image ? texture : undefined;
}
