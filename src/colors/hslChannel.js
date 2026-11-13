/**
 * Compute one linear RGB channel from an HSL hue, lightness and chroma factor.
 *
 * @param {number} n Channel offset in the HSL conversion.
 * @param {number} h Hue as a fraction of a turn.
 * @param {number} l Lightness.
 * @param {number} a Saturation-scaled chroma factor.
 *
 * @returns {number} Linear RGB channel value.
 */
export function channel(n, h, l, a) {
  const k = (n + h * 12) % 12;
  return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
}
