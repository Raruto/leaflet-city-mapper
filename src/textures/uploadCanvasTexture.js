import { current } from '../native/isCurrentNativeLayer.js';
import { refreshNativeLayer } from '../native/refreshNativeLayer.js';

/**
 * Rasterize a native canvas or image into a GPU texture and refresh its layer when ready.
 *
 * @param {Object} state Native layer state.
 * @param {string} key Texture cache key.
 * @param {Object} texture Destination texture state.
 * @param {HTMLCanvasElement|HTMLImageElement} image Source image.
 * @param {GPUDevice} device Device owning the destination.
 * @param {number} width Image width in pixels.
 * @param {number} height Image height in pixels.
 *
 * @returns {Promise<void>} Completion of the upload attempt.
 *
 * @throws {Error} Internally if SVG rasterization lacks a 2D context; reported to the source layer.
 */
export async function uploadCanvasTexture(state, key, texture, image, device, width, height) {
  let bitmap, source = image;
  try {
    if (image instanceof HTMLImageElement) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw /* alloc */ new Error('Unable to rasterize SVG image');
      context.drawImage(image, 0, 0, width, height);
      source = canvas;
    }
    bitmap = await createImageBitmap(source);
    if (!current(state) || state.textures.get(key) !== texture) return;
    device.queue.copyExternalImageToTexture(
      /* alloc */ { source: bitmap },
      /* alloc */ { texture: texture.texture },
      /* alloc */ [width, height]);
    texture.uploaded = image;
    texture.pending = false;
    refreshNativeLayer(state);
  } catch (error) {
    state.failed = true;
    state.source.fire('error', /* alloc */ { error });
  } finally {
    bitmap?.close();
  }
}
