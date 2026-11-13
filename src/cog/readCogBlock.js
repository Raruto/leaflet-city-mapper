import { readCog } from './readCog.js';
import { decodeCogTile } from './decodeCogTile.js';

/**
 * Read and decode one TIFF tile block from a COG level.
 *
 * @param {Object} source Open COG byte source.
 * @param {Object} level COG level with block offsets and lengths.
 * @param {number} x Block column within the level.
 * @param {number} y Block row within the level.
 * @param {AbortSignal} [signal] Request cancellation signal.
 *
 * @returns {Promise<ArrayBuffer>} Decoded block data.
 */
export async function readCogBlock(source, level, x, y, signal) {
  const index = y * level.columns + x;
  return decodeCogTile(await readCog(source, level.offsets[index], level.lengths[index], signal),
    256 * 256 * (level.elevation ? 4 : level.samples), level.compression);
}
