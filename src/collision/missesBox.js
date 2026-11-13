/**
 * Whether a ray's box interval cannot produce a closer hit.
 *
 * @param {number} entry Ray parameter where the box is entered.
 * @param {number} exit Ray parameter where the box is left.
 * @param {number} reach Movement distance, or zero to test overlap.
 * @param {number} best Closest hit found so far.
 *
 * @returns {boolean} True when the box is missed or too far to matter.
 */
export function missesBox(entry, exit, reach, best) {
  return entry > exit || exit < 0 || entry > reach || (reach && Math.max(0, entry) >= best);
}
