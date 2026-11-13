/**
 * Whether a feature's accumulated crossing parities enclose the ray origin.
 *
 * @param {number} height Height-wall crossing parity.
 * @param {number} footprint Footprint crossing parity.
 * @param {Object[]|undefined} ranges Feature metadata, including polygon flags.
 * @param {number} feature Feature index.
 *
 * @returns {boolean} True when the feature encloses the origin.
 */
export function enclosesOrigin(height, footprint, ranges, feature) {
  return Boolean(height && (!ranges?.[feature]?.polygon || footprint));
}
