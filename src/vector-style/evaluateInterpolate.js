import { styleColor } from './styleColor.js';
import { evaluateStyle } from './evaluateStyle.js';

export function evaluateInterpolate(args, properties, zoom) {
  const result = evaluateStyle(args[1], properties, zoom);
  const base = args[0][0] === 'exponential' ? args[0][1] : 1;
  let i = 0, lower = 0, upper = 0, ratio = 0, left = null, right = null, j = 0, color = '';
  if (result <= args[2]) return evaluateStyle(args[3], properties, zoom);
  for (i = 4; i < args.length; i += 2) {
    if (result > args[i]) continue;
    lower = args[i - 2];
    upper = args[i];
    ratio = base === 1 ? (result - lower) / (upper - lower)
      : (base ** (result - lower) - 1) / (base ** (upper - lower) - 1);
    left = evaluateStyle(args[i - 1], properties, zoom);
    right = evaluateStyle(args[i + 1], properties, zoom);
    if (typeof left === 'number' && typeof right === 'number') return left + (right - left) * ratio;
    left = styleColor(left);
    right = styleColor(right);
    for (j = 0; j < 3; j++) {
      if (j) color += ',';
      color += Math.round(left[j] + (right[j] - left[j]) * ratio);
    }
    return `rgba(${color},${left[3] + (right[3] - left[3]) * ratio})`;
  }
  return evaluateStyle(args.at(-1), properties, zoom);
}
