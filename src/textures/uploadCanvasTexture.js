import { current } from '../native/isCurrentNativeLayer.js';
import { refreshNativeLayer } from '../native/refreshNativeLayer.js';

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
