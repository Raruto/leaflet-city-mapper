import { arrayContainsRange } from './arrayContainsRange.js';
import { evaluateInput } from './evaluateInput.js';
import { evaluateStyle } from './evaluateStyle.js';

/**
 * Evaluate membership or legacy negated membership in a style filter.
 *
 * @param {string} op Membership operator.
 * @param {Array} args Target and candidate operands.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 * @param {boolean} legacy Whether to use legacy filter semantics.
 *
 * @returns {boolean} Membership result.
 */
export function evaluateMembership(op, args, properties, zoom, legacy) {
  let target = null;
  if (op === '!in') {
    target = evaluateInput(args[0], properties, zoom, legacy);
    return !arrayContainsRange(args, 1, args.length, target);
  }
  if (legacy) {
    target = evaluateInput(args[0], properties, zoom, true);
    return arrayContainsRange(args, 1, args.length, target);
  }
  const values = evaluateStyle(args[1], properties, zoom);
  target = evaluateInput(args[0], properties, zoom, false);
  return values.includes(target);
}
