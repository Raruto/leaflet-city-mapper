import { types } from '../globals/types.js';
import { sizes } from '../globals/sizes.js';


import { readAccessorValues } from './readAccessorValues.js';
import { readSparseAccessor } from './readSparseAccessor.js';
import { normalizeAccessor } from './normalizeAccessor.js';

/** Decode packed, interleaved, normalized or sparse glTF accessor data. */

export function readAccessor(description, index) {
  const spec = description.accessors[index], Type = types[spec.componentType], size = sizes[spec.type];
  if (!Type || !size || !Number.isInteger(spec.count) || spec.count < 0) {
    throw /* alloc */ new Error('Invalid glTF accessor');
  }
  const data = /* alloc */ new Type(spec.count * size);
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
    readSparseAccessor(description, spec, Type, size, data);
  }
  if (spec.componentType === 5126) {
    return /* alloc */ { data, size };
  }
  return normalizeAccessor(spec, Type, data, size);
}
