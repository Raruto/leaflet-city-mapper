/**
 * Validate a parsed Content-Range against the requested bytes and known source size.
 *
 * @param {Object} source COG source and optional known size.
 * @param {RegExpExecArray|null} range Parsed Content-Range.
 * @param {number} rangeStart Requested absolute byte offset.
 * @param {number} length Requested byte length.
 *
 * @throws {Error} If the content range or total size is inconsistent.
 */
export function validateCogContentRange(source, range, rangeStart, length) {
  if (!range || Number(range[1]) !== rangeStart || Number(range[2]) !== rangeStart + length - 1 ||
    !Number.isSafeInteger(Number(range[3])) || Number(range[3]) < rangeStart + length ||
    (source.containerSize ?? source.size) !== undefined &&
      (source.containerSize ?? source.size) !== Number(range[3])) {
    throw /* alloc */ new Error('Invalid COG range response');
  }
}
