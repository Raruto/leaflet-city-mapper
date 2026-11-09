import { removeTrailingCommas } from './removeTrailingCommas.js';
import { stripStyleComments } from './stripStyleComments.js';
import { validateVectorLayers } from './validateVectorLayers.js';

export function parseVectorStyle(text) {
  const prefix = /^\s*(?:const|let|var)\s+otm_layers\s*=\s*/.exec(text);
  if (prefix) text = text.slice(prefix[0].length);
  const cleaned = removeTrailingCommas(stripStyleComments(text).trim().replace(/;$/, ''));
  const document = JSON.parse(cleaned);
  const layers = document.layers ?? document;
  validateVectorLayers(layers);
  return layers;
}
