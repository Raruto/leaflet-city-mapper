export function readAccessorValues(description, Type, size, data, accessorCount, indices, viewIndex, offset, count, stride) {
  const view = description.bufferViews[viewIndex], bytes = Type.BYTES_PER_ELEMENT;
  const buffer = description.buffers[view.buffer].binary;
  stride ||= size * bytes;
  if (!buffer || stride < size * bytes || offset < 0 ||
    (view.byteOffset || 0) + view.byteLength > buffer.byteLength ||
    (count - 1) * stride + size * bytes + offset > view.byteLength) throw /* allocation: required -- Range errors retain the failing accessor decode stack. */ new Error('glTF accessor outside buffer view');
  const input = /* allocation: required -- This accessor view is bound to its model buffer for the duration of decoding. */ new DataView(buffer);
  let i, j, at, value, output;
  for (i = 0; i < count; i++) {
    output = indices ? indices[i] : i;
    if (indices && output >= accessorCount) throw /* allocation: required -- Sparse index errors retain the failing accessor decode stack. */ new Error('Invalid sparse glTF index');
    for (j = 0; j < size; j++) {
      at = (view.byteOffset || 0) + offset + i * stride + j * bytes;
      value = Type === Int8Array ? input.getInt8(at) :
        Type === Uint8Array ? input.getUint8(at) :
        Type === Int16Array ? input.getInt16(at, true) :
        Type === Uint16Array ? input.getUint16(at, true) :
        Type === Uint32Array ? input.getUint32(at, true) : input.getFloat32(at, true);
      data[output * size + j] = value;
    }
  }
}
