/**
 * Parse a Leaflet dash array into a validated even-length numeric pattern.
 *
 * @param {Object} options Leaflet path options.
 *
 * @returns {Array<number>} Dash pattern, or an empty array for a solid line.
 *
 * @throws {Error} If a dash value is negative or non-finite.
 */
export function dashValues(options) {
  const values = Array.isArray(options.dashArray) ? options.dashArray :
    String(options.dashArray || '').trim().split(/[ ,]+/);
  const dash = /* alloc */ [];
  let value, allZero = true;
  for (value of values) dash.push(Number(value));
  for (value of dash) {
    if (!Number.isFinite(value) || value < 0) throw /* alloc */ new Error('Invalid Leaflet dashArray');
    if (value !== 0) allZero = false;
  }
  if (allZero) dash.length = 0;
  if (dash.length % 2) dash.push(...dash);
  return dash;
}
