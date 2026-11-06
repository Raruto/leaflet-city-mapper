export function validateCogContentRange(source, range, rangeStart, length) {
  if (!range || Number(range[1]) !== rangeStart || Number(range[2]) !== rangeStart + length - 1 ||
    !Number.isSafeInteger(Number(range[3])) || Number(range[3]) < rangeStart + length ||
    (source.containerSize ?? source.size) !== undefined &&
      (source.containerSize ?? source.size) !== Number(range[3])) {
    throw /* alloc */ new Error('Invalid COG range response');
  }
}
