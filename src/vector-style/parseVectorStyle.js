import { removeTrailingCommas } from './removeTrailingCommas.js';
import { stripStyleComments } from './stripStyleComments.js';
import { validateVectorLayers } from './validateVectorLayers.js';

/**
 * Parse a vector style document or otm_layers assignment after removing comments and trailing commas.
 *
 * @param {string} text Style source text.
 *
 * @returns {Array<Object>} Validated style layers.
 */
export function parseVectorStyle(text) {
  const prefix = /^\s*(?:const|let|var)\s+otm_layers\s*=\s*/.exec(text);
  if (prefix) text = text.slice(prefix[0].length);
  const cleaned = removeTrailingCommas(stripStyleComments(text).trim().replace(/;$/, ''));
  const document = JSON.parse(cleaned);
  const layers = document.layers ?? document;
  validateVectorLayers(layers);
  return layers;
}
