import { parseVectorStyle } from '../vector-style/parseVectorStyle.js';

/**
 * Load or extract vector style layers and validate their identifiers and types.
 *
 * @param {string|Object|Array} style Style URL, document or layer array.
 *
 * @returns {Promise<Array>} Validated style layers.
 *
 * @throws {Error} If the style request returns an unsuccessful status.
 * @throws {Error} If the style does not contain a layer array.
 * @throws {Error} If a style layer lacks a string identifier or type.
 */
export async function readVectorStyle(style) {
  if (typeof style === 'string') {
    const response = await fetch(style);
    if (!response.ok) throw /* alloc */ new Error(`Vector style: HTTP ${response.status}`);
    style = parseVectorStyle(await response.text());
  } else style = style?.layers ?? style;
  if (!Array.isArray(style)) throw /* alloc */ new Error('Invalid vector style layers');
  let entry;
  for (entry of style) {
    if (!entry || typeof entry.id !== 'string' || typeof entry.type !== 'string') {
      throw /* alloc */ new Error('Invalid vector style layers');
    }
  }
  return style;
}
