import { parseVectorStyle } from '../vector-style/parseVectorStyle.js';

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
