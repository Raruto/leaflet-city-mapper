/**
 * Replace a label template placeholder with its feature property.
 *
 * @param {Object} properties Feature properties.
 * @param {string} match Complete placeholder match.
 * @param {string} key Property name inside the placeholder.
 *
 * @returns {*} Property value, or an empty string when absent.
 */
export function vectorLabelProperty(properties, match, key) {
  return properties[key] ?? '';
}
