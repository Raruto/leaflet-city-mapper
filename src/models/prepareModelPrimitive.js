import { readModelAttributes } from './readModelAttributes.js';
import { readModelIndices } from './readModelIndices.js';
import { vertexNormals } from '../geometry/vertexNormals.js';

/**
 * Decode primitive attributes and indices, generating normals when absent.
 *
 * @param {Object} description Decoded glTF document with loaded buffers.
 * @param {Object} primitive glTF mesh primitive to prepare.
 *
 * @returns {Object} Prepared attributes, also stored on the primitive.
 */
export function prepareModelPrimitive(description, primitive) {
  const { attributes, vertexCount } = readModelAttributes(description, primitive);
  readModelIndices(description, primitive, attributes, vertexCount);
  if (!attributes.normal) {
    attributes.normal = /* alloc */ { size: 3,
      data: vertexNormals(attributes.position.data, attributes.index?.data) };
  }
  if (attributes.index?.data instanceof Uint8Array) {
    attributes.index.data = Uint16Array.from(attributes.index.data);
  }
  primitive.preparedAttributes = attributes;
  return attributes;
}
