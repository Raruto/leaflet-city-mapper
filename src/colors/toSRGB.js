/**
 * Convert a linear color channel to sRGB.
 *
 * @param {number} value Linear channel value.
 *
 * @returns {number} sRGB channel value.
 */
export function toSRGB(value) {
  return value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
}
