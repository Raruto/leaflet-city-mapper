import { evaluateInput } from './evaluateInput.js';
import { evaluateStyle } from './evaluateStyle.js';

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
