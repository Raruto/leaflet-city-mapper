export function rgb(values) {
  const rounded = [];
  let value;
  for (value of values) rounded.push(Math.round(value));
  return `rgb(${rounded.join(', ')})`;
}
