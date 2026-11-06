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
