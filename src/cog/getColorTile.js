import { readCogBlock } from './readCogBlock.js';

/**
 * Composite the COG color blocks overlapping an XYZ tile into an image bitmap.
 *
 * @param {Object} source Open COG source.
 * @param {Object} level COG overview level.
 * @param {number} x XYZ tile column.
 * @param {number} y XYZ tile row.
 * @param {AbortSignal} [signal] Request cancellation signal.
 *
 * @returns {Promise<Object>} Object containing the resulting image bitmap.
 *
 * @throws {Error} If a 2D canvas context cannot be created.
 */
export async function getColorTile(source, level, x, y, signal) {
  const canvas = /* alloc */ new OffscreenCanvas(256, 256), context = canvas.getContext('2d');
  if (!context) throw /* alloc */ new Error('Unable to create COG tile canvas');
  const left = (x - level.x) * 256, top = (y - level.y) * 256;
  let bx, by, pixels, rgba, i, j, bitmap;
  for (by = Math.max(0, Math.floor(top / 256)); by < Math.min(level.rows, Math.ceil(top / 256 + 1)); by++) {
    for (bx = Math.max(0, Math.floor(left / 256)); bx < Math.min(level.columns, Math.ceil(left / 256 + 1)); bx++) {
      pixels = /* alloc */ new Uint8Array(await readCogBlock(source, level, bx, by, signal));
      signal?.throwIfAborted();
      rgba = /* alloc */ new Uint8ClampedArray(256 * 256 * 4);
      for (i = 0, j = 0; i < pixels.length; i += level.samples, j += 4) {
        rgba[j] = pixels[i]; rgba[j + 1] = pixels[i + 1]; rgba[j + 2] = pixels[i + 2];
        rgba[j + 3] = level.samples === 4 ? pixels[i + 3] : 255;
      }
      bitmap = await createImageBitmap(/* alloc */ new ImageData(rgba, 256, 256));
      context.drawImage(bitmap, bx * 256 - left, by * 256 - top);
      bitmap.close();
    }
  }
  const image = canvas.transferToImageBitmap();
  if (signal?.aborted) { image.close(); signal.throwIfAborted(); }
  return /* alloc */ { image };
}
