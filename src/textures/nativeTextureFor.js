import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { coreSampler } from '../globals/coreSampler.js';
import { disposeMesh } from '../rendering/disposeMesh.js';
import { destroyTexture } from './destroyTexture.js';
import { uploadCanvasTexture } from './uploadCanvasTexture.js';
import { uploadNativeImage } from './uploadNativeImage.js';

/**
 * Get or create a native raster texture, returning it once its image is uploaded.
 *
 * @param {Object} state Native layer state with texture and mesh caches.
 * @param {string} key Tile or image cache key.
 * @param {HTMLImageElement|HTMLCanvasElement} image Raster source.
 *
 * @returns {Object|undefined} Uploaded texture state, if ready.
 *
 * @throws {Error} If the source is neither an image nor a canvas.
 */
export function textureFor(state, key, image) {
  if (!(image instanceof HTMLImageElement) && !(image instanceof HTMLCanvasElement)) {
    throw /* alloc */ new Error('WebGPU native raster layers require image or canvas tiles');
  }
  const { backend: layer, textures, meshes } = state;
  let texture = textures.get(key);
  const url = image.currentSrc || image.src;
  if (!texture || texture.image !== image || texture.url !== url) {
    if (texture) {
      disposeMesh(layer, meshes.get(key));
      meshes.delete(key);
      destroyTexture(layer, texture.texture);
      textures.delete(key);
    }
    const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
    if (!width || !height) return;
    const { device } = rendererByLayer.get(layer);
    texture = /* alloc */ {
      device, image, url, format: 'rgba8unorm', uploaded: null,
      texture: device.createTexture(/* alloc */ {
        size: /* alloc */ [width, height], format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }),
      sampler: device.createSampler(coreSampler),
    };
    textures.set(key, texture);
    if (image instanceof HTMLCanvasElement || url.startsWith('data:image/svg+xml')) {
      texture.pending = true;
      uploadCanvasTexture(state, key, texture, image, device, width, height);
    } else {
      uploadNativeImage(state, key, texture, image, device, width, height);
    }
  }
  texture.used = true;
  return texture.uploaded === image ? texture : undefined;
}
