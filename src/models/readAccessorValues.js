export function readAccessorValues(description, Type, size, data, accessorCount, indices, viewIndex, offset, count, stride) {
  const view = description.bufferViews[viewIndex], bytes = Type.BYTES_PER_ELEMENT;
  const buffer = description.buffers[view.buffer].binary;
  stride ||= size * bytes;
  if (!buffer || stride < size * bytes || offset < 0 ||
    (view.byteOffset || 0) + view.byteLength > buffer.byteLength ||
    (count - 1) * stride + size * bytes + offset > view.byteLength) throw new Error('glTF accessor outside buffer view');
  let i, values, output;
  for (i = 0; i < count; i++) {
    values = new Type(buffer.slice((view.byteOffset || 0) + offset + i * stride,
      (view.byteOffset || 0) + offset + i * stride + size * bytes));
    output = indices ? indices[i] : i;
    if (indices && output >= accessorCount) throw new Error('Invalid sparse glTF index');
    data.set(values, output * size);
  }
}
