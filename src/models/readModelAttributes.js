import { geometrySemantics } from '../globals/geometrySemantics.js';
import { readAccessor } from './readAccessor.js';

/**
 * Read supported primitive attributes and validate their vertex counts.
 *
 * @param {Object} description Decoded glTF document.
 * @param {Object} primitive glTF mesh primitive.
 *
 * @returns {Object} Attribute map and vertex count.
 *
 * @throws {Error} If positions are missing.
 * @throws {Error} If the position size or vertex count is invalid.
 * @throws {Error} If attribute vertex counts differ.
 */
export function readModelAttributes(description, primitive) {
  const attributes = /* alloc */ {};
  let semantic, name;
  for ([semantic, name] of geometrySemantics) {
    if (primitive.attributes[semantic] !== undefined) {
      attributes[name] = readAccessor(description, primitive.attributes[semantic]);
    }
  }
  if (!attributes.position) throw /* alloc */ new Error('glTF mesh has no positions');
  const vertexCount = attributes.position.data.length / 3;
  if (attributes.position.size !== 3 || vertexCount < 3) throw /* alloc */ new Error('Invalid glTF vertex attributes');
  let attribute;
  for (attribute of Object.values(attributes)) {
    if (attribute.data.length / attribute.size !== vertexCount) throw /* alloc */ new Error('Invalid glTF vertex attributes');
  }
  return /* alloc */ { attributes, vertexCount };
}
