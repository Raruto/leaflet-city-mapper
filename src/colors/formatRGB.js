/**
 * Format rounded channel values as a CSS rgb() string.
 *
 * @param {number[]} values Color channel values.
 *
 * @returns {string} CSS rgb() string.
 */
export function rgb(values) {
  let rounded = '', i;
  for (i = 0; i < values.length; i++) {
    if (i) rounded += ', ';
    rounded += Math.round(values[i]);
  }
  return `rgb(${rounded})`;
}
