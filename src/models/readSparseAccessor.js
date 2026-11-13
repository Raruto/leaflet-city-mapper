import { types } from '../globals/types.js';
import { readAccessorValues } from './readAccessorValues.js';

/**
 * Apply sparse glTF accessor values to an existing component array.
 *
 * @param {Object} description Decoded glTF document with loaded buffers.
 * @param {Object} spec glTF accessor specification.
 * @param {TypedArrayConstructor} Type Component array constructor.
 * @param {number} size Components per element.
 * @param {TypedArray} data Destination array to update.
 *
 * @throws {Error} If the sparse index type is invalid.
 * @throws {Error} If the sparse index count or range is invalid.
 */
export function readSparseAccessor(description, spec, Type, size, data) {
  const sparse = spec.sparse, Index = types[sparse.indices.componentType];
  if (Index !== Uint8Array && Index !== Uint16Array && Index !== Uint32Array) {
    throw /* alloc */ new Error('Invalid sparse glTF indices');
  }
  const view = description.bufferViews[sparse.indices.bufferView];
  const offset = (view.byteOffset || 0) + (sparse.indices.byteOffset || 0);
  if (sparse.count > spec.count ||
    (sparse.indices.byteOffset || 0) + sparse.count * Index.BYTES_PER_ELEMENT > view.byteLength) {
    throw /* alloc */ new Error('Invalid sparse glTF indices');
  }
  const indices = /* alloc */ new Index(description.buffers[view.buffer].binary.slice(
    offset, offset + sparse.count * Index.BYTES_PER_ELEMENT));
  readAccessorValues(description, Type, size, data, spec.count, indices, sparse.values.bufferView,
    sparse.values.byteOffset || 0, sparse.count, 0);
}
