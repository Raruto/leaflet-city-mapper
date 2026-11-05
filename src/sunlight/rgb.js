export function rgb(values) {
  let rounded = '', i;
  for (i = 0; i < values.length; i++) {
    if (i) rounded += ', ';
    rounded += Math.round(values[i]);
  }
  return `rgb(${rounded})`;
}
