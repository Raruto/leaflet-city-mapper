import { state as sharedState } from '../state.js';

import { readAccessorValues } from './readAccessorValues.js';

/** Decode packed, interleaved, normalized or sparse glTF accessor data. */

export function readAccessor(description, index) {
  const spec = description.accessors[index], Type = sharedState.types[spec.componentType], size = sharedState.sizes[spec.type];
  if (!Type || !size || !Number.isInteger(spec.count) || spec.count < 0) {
    throw /* allocation: required -- Accessor errors retain the failing decode stack. */ new Error('Invalid glTF accessor');
  }
  const data = /* allocation: required -- Each accessor retains independent decoded vertex or index data. */ new Type(spec.count * size);
  if (spec.bufferView !== undefined) {
    readAccessorValues(
      description, Type, size, data, spec.count, null,
      spec.bufferView,
      spec.byteOffset || 0,
      spec.count,
      description.bufferViews[spec.bufferView].byteStride
    );
  }
  if (spec.sparse) {
    const sparse = spec.sparse, Index = sharedState.types[sparse.indices.componentType];
    if (Index !== Uint8Array && Index !== Uint16Array && Index !== Uint32Array) {
      throw /* allocation: required -- Sparse accessor errors retain the failing decode stack. */ new Error('Invalid sparse glTF indices');
    }
    const view = description.bufferViews[sparse.indices.bufferView];
    const offset = (view.byteOffset || 0) + (sparse.indices.byteOffset || 0);
    if (sparse.count > spec.count || (sparse.indices.byteOffset || 0) + sparse.count * Index.BYTES_PER_ELEMENT > view.byteLength) {
      throw /* allocation: required -- Sparse accessor errors retain the failing decode stack. */ new Error('Invalid sparse glTF indices');
    }
    const indices = /* allocation: required -- Sparse patch destinations belong to this accessor and its model buffer. */ new Index(description.buffers[view.buffer].binary.slice(offset, offset + sparse.count * Index.BYTES_PER_ELEMENT));
    readAccessorValues(
      description, Type, size, data, spec.count, indices,
      sparse.values.bufferView,
      sparse.values.byteOffset || 0,
      sparse.count,
      0
    );
  }
  if (spec.componentType === 5126) {
    return /* allocation: required -- The geometry retains this independent accessor descriptor. */ { data, size };
  }
  const normalized = /* allocation: required -- The accessor retains normalized vertices separately from its original integer indices. */ new Float32Array(data.length);
  // Normalization is a glTF accessor rule, not sRGB conversion; indices stay integers.
  let i;
  for (i = 0; i < data.length; i++) {
    normalized[i] = spec.normalized
      ? Math.max(-1, data[i] / (Type === Int8Array ? 127 : Type === Int16Array ? 32767 : Type === Uint8Array ? 255 : Type === Uint32Array ? 4294967295 : 65535))
      : data[i];
  }
  return /* allocation: required -- The geometry retains this independent normalized accessor descriptor. */ { data: normalized, size, indices: data };
}
