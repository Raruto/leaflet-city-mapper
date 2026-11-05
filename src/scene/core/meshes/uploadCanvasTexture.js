import { current } from '../current.js';
import { refreshNativeLayer } from '../refreshNativeLayer.js';

export async function uploadCanvasTexture(state, key, texture, image, device, width, height) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(image);
    if (!current(state) || state.textures.get(key) !== texture) return;
    device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: texture.texture }, [width, height]);
    texture.uploaded = image;
    texture.pending = false;
    refreshNativeLayer(state);
  } catch (error) {
    state.failed = true;
    state.source.fire('error', { error });
  } finally {
    bitmap?.close();
  }
}
