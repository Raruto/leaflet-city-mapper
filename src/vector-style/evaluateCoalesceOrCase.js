import { evaluateStyle } from './evaluateStyle.js';

/**
 * Evaluate a coalesce or case style expression.
 *
 * @param {string} op Expression operator.
 * @param {Array} args Expression operands.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 * @param {boolean} legacy Legacy filter flag.
 *
 * @returns {*} Selected expression result.
 *
 * @throws {Error} If the operator is unsupported.
 */
export function evaluateCoalesceOrCase(op, args, properties, zoom, legacy) {
  let i = 0, result = null;
  if (op === 'coalesce') {
    for (i = 0; i < args.length; i++) {
      result = evaluateStyle(args[i], properties, zoom);
      if (result !== null && result !== undefined) return result;
    }
    return null;
  }
  if (op === 'case') {
    for (i = 0; i < args.length - 1; i += 2) {
      if (evaluateStyle(args[i], properties, zoom)) {
        return evaluateStyle(args[i + 1], properties, zoom);
      }
    }
    return evaluateStyle(args[args.length - 1], properties, zoom);
  }
  throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
}
