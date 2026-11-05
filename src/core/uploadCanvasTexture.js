import { current } from './current.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';

export async function uploadCanvasTexture(state, key, texture, image, device, width, height) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(image);
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
