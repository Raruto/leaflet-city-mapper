/**
 * Convert integer accessor data to floats, applying glTF normalization when requested.
 *
 * @param {Object} spec glTF accessor specification.
 * @param {TypedArrayConstructor} Type Integer component array constructor.
 * @param {TypedArray} data Raw accessor components.
 * @param {number} size Components per element.
 *
 * @returns {Object} Float data, element size and original integer data.
 */
export function normalizeAccessor(spec, Type, data, size) {
  const normalized = /* alloc */ new Float32Array(data.length);
  let i;
  for (i = 0; i < data.length; i++) {
    normalized[i] = spec.normalized
      ? Math.max(-1, data[i] / (Type === Int8Array ? 127 : Type === Int16Array ? 32767 :
        Type === Uint8Array ? 255 : Type === Uint32Array ? 4294967295 : 65535))
      : data[i];
  }
  return /* alloc */ { data: normalized, size, indices: data };
}
