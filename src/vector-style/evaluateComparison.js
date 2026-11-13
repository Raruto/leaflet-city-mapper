import { evaluateInput } from './evaluateInput.js';
import { evaluateStyle } from './evaluateStyle.js';

/**
 * Evaluate a comparison between style expression operands.
 *
 * @param {string} op Comparison operator.
 * @param {Array} args Expression operands.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 * @param {boolean} legacy Whether the left operand is a legacy property name.
 *
 * @returns {boolean} Comparison result.
 *
 * @throws {Error} If the operator is unsupported.
 */
export function evaluateComparison(op, args, properties, zoom, legacy) {
  const left = evaluateInput(args[0], properties, zoom, legacy);
  const right = evaluateStyle(args[1], properties, zoom);
  switch (op) {
    case '==': return left === right;
    case '!=': return left !== right;
    case '<=': return left <= right;
    case '>=': return left >= right;
    case '<': return left < right;
    case '>': return left > right;
      default: throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
  }
}
