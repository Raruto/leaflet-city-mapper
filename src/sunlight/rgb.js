export function rgb(values) {
  const rounded = [];
  for (const value of values) rounded.push(Math.round(value));
  return `rgb(${rounded.join(', ')})`;
}
