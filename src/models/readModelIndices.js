import { readAccessor } from './readAccessor.js';

export function readModelIndices(description, primitive, attributes, vertexCount) {
  if (primitive.indices !== undefined) {
    const index = readAccessor(description, primitive.indices);
    attributes.index = /* alloc */ { size: 1, data: index.indices };
    if (!(index.indices instanceof Uint8Array || index.indices instanceof Uint16Array ||
      index.indices instanceof Uint32Array) || index.size !== 1 || index.indices.length % 3) {
      throw /* alloc */ new Error('Invalid glTF triangle indices');
    }
    let value;
    for (value of index.indices) if (value >= vertexCount) throw /* alloc */ new Error('Invalid glTF triangle indices');
  } else if (vertexCount % 3) {
    throw /* alloc */ new Error('Incomplete glTF triangle');
  }
}
