import { readAccessorValue } from './readAccessorValue.js';

/**
 * Copy packed or strided accessor components into an output array, optionally at sparse indices.
 *
 * @param {Object} description Decoded glTF document with loaded buffers.
 * @param {TypedArrayConstructor} Type Component array constructor.
 * @param {number} size Components per element.
 * @param {TypedArray} data Destination array.
 * @param {number} accessorCount Number of elements in the destination accessor.
 * @param {TypedArray|null} indices Sparse destination indices, or null for sequential output.
 * @param {number} viewIndex Index of the source buffer view.
 * @param {number} offset Byte offset within the buffer view.
 * @param {number} count Number of source elements.
 * @param {number} stride Byte stride between source elements, or zero for packed data.
 *
 * @throws {Error} If data falls outside the buffer view.
 * @throws {Error} If a sparse index is invalid.
 */
export function readAccessorValues(description, Type, size, data, accessorCount, indices, viewIndex, offset, count, stride) {
  const view = description.bufferViews[viewIndex], bytes = Type.BYTES_PER_ELEMENT;
  const buffer = description.buffers[view.buffer].binary;
  stride ||= size * bytes;
  if (!buffer || stride < size * bytes || offset < 0 ||
    (view.byteOffset || 0) + view.byteLength > buffer.byteLength ||
    (count - 1) * stride + size * bytes + offset > view.byteLength) throw /* alloc */ new Error('glTF accessor outside buffer view');
  const input = /* alloc */ new DataView(buffer);
  let i, j, at, output;
  for (i = 0; i < count; i++) {
    output = indices ? indices[i] : i;
    if (indices && output >= accessorCount) throw /* alloc */ new Error('Invalid sparse glTF index');
    for (j = 0; j < size; j++) {
      at = (view.byteOffset || 0) + offset + i * stride + j * bytes;
      data[output * size + j] = readAccessorValue(input, Type, at);
    }
  }
}
