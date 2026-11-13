/**
 * Parse an rgb or rgba color into numeric components.
 *
 * @param {string} value Color text.
 *
 * @returns {Array<number>} Red, green, blue and alpha components.
 *
 * @throws {Error} If the color syntax or components are unsupported.
 */
export function parseFunctionalColor(value) {
  const match = /^rgba?\(([^)]+)\)$/.exec(value);
  if (match) {
    const values = match[1].split(',');
    let i = 0, finite = true;
    for (i = 0; i < values.length; i++) values[i] = Number(values[i]);
    if (values.length === 3) values.push(1);
    for (i = 0; i < values.length; i++) {
      if (!Number.isFinite(values[i])) finite = false;
    }
    if (values.length === 4 && finite) return values;
  }
  throw /* alloc */ new Error(`Unsupported interpolated style color: ${value}`);
}
