import { readModelAttributes } from './readModelAttributes.js';
import { readModelIndices } from './readModelIndices.js';
import { vertexNormals } from '../geometry/vertexNormals.js';

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
