import { evaluateInput } from './evaluateInput.js';
import { evaluateMembership } from './evaluateMembership.js';
import { evaluateStyle } from './evaluateStyle.js';

export function evaluateNegation(op, args, properties, zoom, legacy) {
  if (op === '!') return !evaluateStyle(args[0], properties, zoom, legacy);
  if (op === '!=') {
    return evaluateInput(args[0], properties, zoom, legacy) !==
      evaluateStyle(args[1], properties, zoom);
  }
  if (op === '!in') return evaluateMembership(op, args, properties, zoom, legacy);
  throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
}
