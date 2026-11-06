import { readCogBlock } from './readCogBlock.js';

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
