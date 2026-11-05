import { sceneByLayer } from '../globals/sceneByLayer.js';


import { decodeHeader } from './decodeHeader.js';
import { read } from './read.js';

/** Cache header initialization; failures remain visible to all callers. */

export function getHeader(layer) {
  if (!sceneByLayer.has(layer)) return layer.getHeader();
  if (layer.options.archive && layer.options.archive !== layer) return getHeader(layer.options.archive);
  return sceneByLayer.get(layer)._header ||= read(layer, 0, 127).then(decodeHeader);
}
