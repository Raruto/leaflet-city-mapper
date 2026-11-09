import { evaluateInterpolate } from './evaluateInterpolate.js';
import { evaluateMembership } from './evaluateMembership.js';

export function evaluateIExpression(op, args, properties, zoom, legacy) {
  if (op === 'in') return evaluateMembership(op, args, properties, zoom, legacy);
  if (op === 'interpolate') return evaluateInterpolate(args, properties, zoom);
  throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
}
