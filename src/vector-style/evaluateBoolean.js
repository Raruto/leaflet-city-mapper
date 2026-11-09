import { evaluateStyle } from './evaluateStyle.js';

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
