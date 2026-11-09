import { vectorStyleNamedColors } from '../globals/vectorStyleNamedColors.js';
import { parseFunctionalColor } from './parseFunctionalColor.js';
import { parseHexColor } from './parseHexColor.js';

export function styleColor(value) {
  if (Object.hasOwn(vectorStyleNamedColors, value)) return vectorStyleNamedColors[value];
  if (/^#[0-9a-f]{3}$/i.test(value) || /^#[0-9a-f]{6}$/i.test(value)) {
    return parseHexColor(value);
  }
  return parseFunctionalColor(value);
}
