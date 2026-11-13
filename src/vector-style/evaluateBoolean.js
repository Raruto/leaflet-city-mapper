import { evaluateStyle } from './evaluateStyle.js';

/**
 * Evaluate a short-circuiting all or any style expression.
 *
 * @param {string} op Expression operator.
 * @param {Array} args Expression operands.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 * @param {boolean} legacy Whether to use legacy filter evaluation.
 *
 * @returns {boolean} Expression result.
 *
 * @throws {Error} If the operator is unsupported.
 */
export function evaluateBoolean(op, args, properties, zoom, legacy) {
  let i = 0;
  if (op === 'all') {
    for (i = 0; i < args.length; i++) {
      if (!evaluateStyle(args[i], properties, zoom, legacy)) return false;
    }
    return true;
  }
  if (op === 'any') {
    for (i = 0; i < args.length; i++) {
      if (evaluateStyle(args[i], properties, zoom, legacy)) return true;
    }
    return false;
  }
  throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
}
