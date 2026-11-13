/**
 * Merge two adjacent runs of hole entries by their minimum x coordinate.
 *
 * @param {Object[]} source Sorted runs of hole entries.
 * @param {Object[]} target Array receiving the merged entries.
 * @param {number} start First index of the runs.
 * @param {number} width Maximum length of each run.
 */
export function mergeHoles(source, target, start, width) {
  const middle = Math.min(start + width, source.length), end = Math.min(start + width * 2, source.length);
  let left = start, right = middle, output;
  for (output = start; output < end; output++) {
    if (left < middle && (right >= end || source[left].x <= source[right].x)) {
      target[output] = source[left++];
    } else {
      target[output] = source[right++];
    }
  }
}
