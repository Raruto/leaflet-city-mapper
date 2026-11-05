import { disposeMesh } from '../../../rendering/meshes/disposeMesh.js';
import { destroyTexture } from '../../../rendering/textures/destroyTexture.js';
import { uploadCanvasTexture } from './uploadCanvasTexture.js';

export function textureFor(state, key, image) {
  if (!(image instanceof HTMLImageElement) && !(image instanceof HTMLCanvasElement)) {
    throw new Error('WebGPU native raster layers require image or canvas tiles');
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
    const { device } = backend.renderer;
    texture = {
      device, image, url, format: 'rgba8unorm', uploaded: null,
      texture: device.createTexture({
        size: [width, height], format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }),
      sampler: device.createSampler({ minFilter: 'linear', magFilter: 'linear' }),
    };
    textures.set(key, texture);
    if (image instanceof HTMLCanvasElement) {
      texture.pending = true;
      uploadCanvasTexture(state, key, texture, image, device, width, height);
    } else {
      try {
        device.queue.copyExternalImageToTexture({ source: image }, { texture: texture.texture }, [width, height]);
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
