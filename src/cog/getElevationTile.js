import { readCogBlock } from './readCogBlock.js';

/**
 * Read and validate the Float32 elevation samples for an XYZ tile.
 *
 * @param {Object} source Open COG source.
 * @param {Object} level COG elevation level.
 * @param {number} x XYZ tile column.
 * @param {number} y XYZ tile row.
 * @param {AbortSignal} [signal] Request cancellation signal.
 *
 * @returns {Promise<Object>} Object containing the elevation buffer.
 *
 * @throws {Error} If an elevation sample is non-finite or outside the supported range.
 */
export async function getElevationTile(source, level, x, y, signal) {
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
