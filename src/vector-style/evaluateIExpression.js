import { evaluateInterpolate } from './evaluateInterpolate.js';
import { evaluateMembership } from './evaluateMembership.js';

/**
 * Dispatch an in or interpolate style expression.
 *
 * @param {string} op Expression operator.
 * @param {Array} args Expression operands.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 * @param {boolean} legacy Whether to use legacy membership semantics.
 *
 * @returns {*} Expression result.
 *
 * @throws {Error} If the operator is unsupported.
 */
export function evaluateIExpression(op, args, properties, zoom, legacy) {
  if (op === 'in') return evaluateMembership(op, args, properties, zoom, legacy);
  if (op === 'interpolate') return evaluateInterpolate(args, properties, zoom);
  throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
}
