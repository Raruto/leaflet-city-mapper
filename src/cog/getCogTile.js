import { readCogBlock } from './readCogBlock.js';

export async function getCogTile(source, z, x, y, signal) {
  signal?.throwIfAborted();
  if (!Number.isSafeInteger(z) || !Number.isSafeInteger(x) || !Number.isSafeInteger(y) || z < 0 || z > 24 ||
    x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) throw /* alloc */ new Error('Invalid COG tile coordinates');
  const level = source.levels.get(z);
  if (!level || x + 1 <= level.x || y + 1 <= level.y || x >= level.x + level.columns || y >= level.y + level.rows) return;
  if (level.elevation) {
    const data = await readCogBlock(source, level, x - level.x, y - level.y, signal);
    signal?.throwIfAborted();
    const view = /* alloc */ new DataView(data), heights = /* alloc */ new Float32Array(256 * 256);
    let i, height;
    for (i = 0; i < heights.length; i++) {
      height = view.getFloat32(i * 4, source.little);
      if (!Number.isFinite(height) || height < -12000 || height > 10000) {
        throw /* alloc */ new Error('Invalid or missing COG elevation sample');
      }
      heights[i] = height;
    }
    return /* alloc */ { data: heights.buffer };
  }
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
