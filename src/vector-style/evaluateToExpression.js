import { evaluateStyle } from './evaluateStyle.js';

export function evaluateToExpression(op, args, properties, zoom) {
  if (op === 'to-boolean') return Boolean(evaluateStyle(args[0], properties, zoom));
  if (op === 'to-number') {
    let i = 0, number = 0;
    for (i = 0; i < args.length; i++) {
      number = Number(evaluateStyle(args[i], properties, zoom));
      if (Number.isFinite(number)) return number;
    }
    throw /* alloc */ new Error('Invalid numeric style expression');
  }
  throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
}
