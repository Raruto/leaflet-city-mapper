import { evaluateStyle } from './evaluateStyle.js';

export function evaluateMatch(args, properties, zoom) {
  const result = evaluateStyle(args[0], properties, zoom);
  let i = 0, matched = false;
  for (i = 1; i < args.length - 1; i += 2) {
    if (Array.isArray(args[i])) matched = args[i].includes(result);
    else matched = args[i] === result;
    if (matched) return evaluateStyle(args[i + 1], properties, zoom);
  }
  return evaluateStyle(args[args.length - 1], properties, zoom);
}
