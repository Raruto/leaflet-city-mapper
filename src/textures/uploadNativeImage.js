/**
 * Upload a native image, removing its cached GPU texture if the copy fails.
 *
 * @param {Object} state Native layer state containing the texture cache.
 * @param {string} key Texture cache key.
 * @param {Object} texture Destination texture state.
 * @param {HTMLImageElement} image Source image.
 * @param {GPUDevice} device Device owning the destination.
 * @param {number} width Image width in pixels.
 * @param {number} height Image height in pixels.
 *
 * @throws {Error} If the GPU image copy fails.
 */
export function uploadNativeImage(state, key, texture, image, device, width, height) {
  try {
    device.queue.copyExternalImageToTexture(
      /* alloc */ { source: image },
      /* alloc */ { texture: texture.texture },
      /* alloc */ [width, height]);
  } catch (error) {
    texture.texture.destroy();
    state.textures.delete(key);
    throw error;
  }
  texture.uploaded = image;
}
