import { appendRouteSegment } from './appendRouteSegment.js';

/**
 * Build dashed lane geometry in layer-local metres.
 *
 * @param {Array<Object>} lanes Lanes with points, cumulative lengths and optional route colors.
 *
 * @returns {Object} Flat position, normal and color arrays.
 */
export function routeGeometry(lanes) {
  const position = /* alloc */ [];
  const normal = /* alloc */ [];
  const color = /* alloc */ [];
  let points, lengths, properties, raw, rgb, r, g, blue, i;
  for ({ points, lengths, properties } of lanes) {
    raw = properties?.route_color;
    rgb = /^[\da-f]{6}$/i.test(raw) ? Number.parseInt(raw, 16) : null;
    r = rgb === null ? 0.08 : (rgb >> 16 & 255) / 255;
    g = rgb === null ? 0.7 : (rgb >> 8 & 255) / 255;
    blue = rgb === null ? 0.85 : (rgb & 255) / 255;
    for (i = 1; i < points.length; i++) {
      appendRouteSegment(position, normal, color, points, lengths, i, r, g, blue);
    }
  }
  return /* alloc */ { position, normal, color };
}
