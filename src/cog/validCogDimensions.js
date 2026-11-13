/**
 * Check COG image dimensions, tile size, compression, planar layout and predictor.
 *
 * @param {Map} tags TIFF tags.
 * @param {number} width Image width.
 * @param {number} height Image height.
 *
 * @returns {boolean} Whether the image uses supported dimensions and layout.
 */
export function validCogDimensions(tags, width, height) {
  return !!width && !!height && width % 256 === 0 && height % 256 === 0 &&
    tags.get(322)?.[0] === 256 && tags.get(323)?.[0] === 256 &&
    (tags.get(259)?.[0] === 1 || tags.get(259)?.[0] === 8) &&
    (tags.get(284)?.[0] ?? 1) === 1 && (tags.get(317)?.[0] ?? 1) === 1;
}
