import { current } from './current.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';

export async function uploadCanvasTexture(state, key, texture, image, device, width, height) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(image);
    if (!current(state) || state.textures.get(key) !== texture) return;
    device.queue.copyExternalImageToTexture(
      /* allocation: required -- Each asynchronous canvas upload owns its bitmap descriptor. */ { source: bitmap },
      /* allocation: required -- Each asynchronous canvas upload owns its destination descriptor. */ { texture: texture.texture },
      /* allocation: required -- Concurrent canvas uploads have independent dimensions. */ [width, height]);
    texture.uploaded = image;
    texture.pending = false;
    refreshNativeLayer(state);
  } catch (error) {
    state.failed = true;
    state.source.fire('error', /* allocation: required -- Listeners can retain this asynchronous upload failure independently. */ { error });
  } finally {
    bitmap?.close();
  }
}
