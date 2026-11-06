export function mergeHits(source, target, start, width) {
  const middle = Math.min(start + width, source.length), end = Math.min(start + width * 2, source.length);
  let left = start, right = middle, output;
  for (output = start; output < end; output++) {
    if (left < middle && (right >= end || !(source[right].distance < source[left].distance))) {
      target[output] = source[left++];
    } else {
      target[output] = source[right++];
    }
  }
}
