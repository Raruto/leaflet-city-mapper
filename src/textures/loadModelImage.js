import { geometryImageOptions } from '../globals/geometryImageOptions.js';

/**
 * Load a glTF image from a buffer view or URI as an unpremultiplied image bitmap.
 *
 * @param {Object} description Decoded glTF document with loaded buffers.
 * @param {string} directory Base URL for external image URIs.
 * @param {Object} image glTF image specification.
 *
 * @returns {Promise<ImageBitmap>} Decoded image.
 *
 * @throws {Error} If an external image response is not successful.
 */
export async function loadImage(description, directory, image) {
  let blob;
  if (image.bufferView !== undefined) {
    const view = description.bufferViews[image.bufferView];
    const buffer = description.buffers[view.buffer].binary;
    blob = /* alloc */ new Blob(
      /* alloc */ [buffer.slice(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)],
      /* alloc */ { type: image.mimeType });
  } else {
    const response = await fetch(/* alloc */ new URL(image.uri, directory).href);
    if (!response.ok) throw /* alloc */ new Error(`Unable to load model texture: HTTP ${response.status}`);
    blob = await response.blob();
  }
  // Preserve straight alpha and raw samples; GPU sRGB formats do color decoding.
  return createImageBitmap(blob, geometryImageOptions);
}
