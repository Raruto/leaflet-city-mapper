/**
 * Validate the number and bounds of COG tile offsets and lengths.
 *
 * @param {Object} source COG source with known size.
 * @param {Object} level Level dimensions, offsets and lengths.
 *
 * @throws {Error} If the offset or length arrays have invalid counts.
 * @throws {Error} If a tile range is empty, oversized or outside the source.
 */
export function validateCogOffsets(source, level) {
  if (level.offsets?.length !== level.columns * level.rows || level.lengths?.length !== level.offsets.length) {
    throw /* alloc */ new Error('Invalid COG tile offsets or lengths');
  }
  let i;
  for (i = 0; i < level.offsets.length; i++) {
    if (!level.offsets[i] || !level.lengths[i] || level.lengths[i] > 1048576 ||
      level.offsets[i] + level.lengths[i] > source.size) throw /* alloc */ new Error('Invalid COG tile offsets or lengths');
  }
}
