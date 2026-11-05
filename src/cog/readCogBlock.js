import { readCog } from './readCog.js';
import { decodeCogTile } from './decodeCogTile.js';

export async function readCogBlock(source, level, x, y, signal) {
  const index = y * level.columns + x;
  return decodeCogTile(await readCog(source, level.offsets[index], level.lengths[index], signal),
    256 * 256 * (level.elevation ? 4 : level.samples), level.compression);
}
