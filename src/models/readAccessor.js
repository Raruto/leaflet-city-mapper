import { types } from "../constants/accessorTypes.js";
import { sizes } from "../constants/accessorSizes.js";
import { readAccessorValues } from './readAccessorValues.js';

/** Decode packed, interleaved, normalized or sparse glTF accessor data. */

export function readAccessor(description, index) {
  const spec = description.accessors[index], Type = types[spec.componentType], size = sizes[spec.type];
  if (!Type || !size || !Number.isInteger(spec.count) || spec.count < 0) {
    throw new Error('Invalid glTF accessor');
  }
  const data = new Type(spec.count * size);
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
    const sparse = spec.sparse, Index = types[sparse.indices.componentType];
    if (![Uint8Array, Uint16Array, Uint32Array].includes(Index)) {
      throw new Error('Invalid sparse glTF indices');
    }
    const view = description.bufferViews[sparse.indices.bufferView];
    const offset = (view.byteOffset || 0) + (sparse.indices.byteOffset || 0);
    if (sparse.count > spec.count || (sparse.indices.byteOffset || 0) + sparse.count * Index.BYTES_PER_ELEMENT > view.byteLength) {
      throw new Error('Invalid sparse glTF indices');
    }
    const indices = new Index(description.buffers[view.buffer].binary.slice(offset, offset + sparse.count * Index.BYTES_PER_ELEMENT));
    readAccessorValues(
      description, Type, size, data, spec.count, indices,
      sparse.values.bufferView,
      sparse.values.byteOffset || 0,
      sparse.count,
      0
    );
  }
  if (spec.componentType === 5126) {
    return { data, size };
  }
  const normalized = new Float32Array(data.length);
  // Normalization is a glTF accessor rule, not sRGB conversion; indices stay integers.
  for (let i = 0; i < data.length; i++) {
    normalized[i] = spec.normalized
      ? Math.max(-1, data[i] / (Type === Int8Array ? 127 : Type === Int16Array ? 32767 : Type === Uint8Array ? 255 : Type === Uint32Array ? 4294967295 : 65535))
      : data[i];
  }
  return { data: normalized, size, indices: data };
}
