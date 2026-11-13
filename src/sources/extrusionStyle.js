/**
 * Evaluate and validate a feature's extrusion style.
 *
 * @param {L.Layer} layer Source layer with a style function.
 * @param {Object} feature GeoJSON feature.
 *
 * @returns {Object|null} Valid style, or null to skip the feature.
 *
 * @throws {Error} If the style is neither an object nor null.
 * @throws {Error} If extrusion heights do not satisfy top > bottom >= 0.
 */
export function extrusionStyle(layer, feature) {
  const style = layer.options.style(feature);
  if (style === null) return null;
  if (!style || typeof style !== 'object') throw /* alloc */ new Error('style must return an extrusion style or null');
  const { top, bottom = 0 } = style;
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom < 0 || top <= bottom) {
    throw /* alloc */ new Error('Invalid extrusion heights: expected top > bottom >= 0');
  }
  return style;
}
