import { evaluateBoolean } from './evaluateBoolean.js';
import { evaluateCoalesceOrCase } from './evaluateCoalesceOrCase.js';
import { evaluateComparison } from './evaluateComparison.js';
import { evaluateIExpression } from './evaluateIExpression.js';
import { evaluateMath } from './evaluateMath.js';
import { evaluateMatch } from './evaluateMatch.js';
import { evaluateNegation } from './evaluateNegation.js';
import { evaluatePrimitive } from './evaluatePrimitive.js';
import { evaluateStep } from './evaluateStep.js';
import { evaluateToExpression } from './evaluateToExpression.js';

export function evaluateStyle(value, properties, zoom, legacy = false) {
  if (!Array.isArray(value)) return value;
  const op = value[0];
  const args = value.slice(1);
  const operation = String(op);
  if (/^(?:literal|get|has|zoom)$/.test(operation)) {
    return evaluatePrimitive(op, args, properties, zoom);
  }
  switch (operation[0]) {
    case 'a': return evaluateBoolean(op, args, properties, zoom, legacy);
    case '!': return evaluateNegation(op, args, properties, zoom, legacy);
    case '=':
    case '<':
    case '>': return evaluateComparison(op, args, properties, zoom, legacy);
    case 'i': return evaluateIExpression(op, args, properties, zoom, legacy);
    case 't': return evaluateToExpression(op, args, properties, zoom, legacy);
    case 'c': return evaluateCoalesceOrCase(op, args, properties, zoom, legacy);
    case 'm': return evaluateMatch(args, properties, zoom);
    case 's': return evaluateStep(args, properties, zoom);
    default: return evaluateMath(op, args, properties, zoom);
  }
}
