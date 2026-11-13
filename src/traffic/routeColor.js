/**
 * Decode a six-digit route color to normalized RGB, falling back to the default route color.
 *
 * @param {Object|null|undefined} properties Route properties containing an optional route_color.
 *
 * @returns {number[]} Normalized RGB components.
 */
export function routeColor(properties) {
  const color = properties?.route_color;
  if (!/^[\da-f]{6}$/i.test(color)) return /* alloc */ [0.1, 0.55, 0.65];
  const value = Number.parseInt(color, 16);
  return /* alloc */ [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
}
