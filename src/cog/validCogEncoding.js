/**
 * Check whether a TIFF profile is supported grayscale elevation or unsigned RGB(A).
 *
 * @param {Map} tags TIFF tags.
 * @param {number} samples Samples per pixel.
 * @param {Array<number>} bits Bits per sample.
 * @param {Array<number>} format Sample format values.
 * @param {boolean} elevation Whether the profile is Float32 elevation.
 * @param {boolean} bytes Whether all samples use eight bits.
 * @param {boolean} unsigned Whether all sample formats are unsigned.
 *
 * @returns {boolean} Whether the encoding is supported.
 */
export function validCogEncoding(tags, samples, bits, format, elevation, bytes, unsigned) {
  if (elevation) return tags.get(262)?.[0] === 1;
  return (samples === 3 || samples === 4) && bits?.length === samples && bytes && unsigned &&
    tags.get(262)?.[0] === 2;
}
