import { evaluateStyle } from './evaluateStyle.js';

export function evaluateStep(args, properties, zoom) {
  const result = evaluateStyle(args[0], properties, zoom);
  let output = args[1], i = 0;
  for (i = 2; i < args.length; i += 2) {
    if (result < args[i]) break;
    output = args[i + 1];
  }
  return evaluateStyle(output, properties, zoom);
}
