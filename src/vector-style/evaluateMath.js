import { evaluateStyle } from './evaluateStyle.js';

export function evaluateMath(op, args, properties, zoom) {
  let i = 0, sum = 0;
  if (op === '+') {
    for (i = 0; i < args.length; i++) sum += evaluateStyle(args[i], properties, zoom);
    return sum;
  }
  if (op === '-') {
    if (args.length === 1) return -evaluateStyle(args[0], properties, zoom);
    return evaluateStyle(args[0], properties, zoom) - evaluateStyle(args[1], properties, zoom);
  }
  throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
}
