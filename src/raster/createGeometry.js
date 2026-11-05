

export function createGeometry(device) {
  const attributes = {
    position: { size: 3, data: new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1]) },
    normal: { size: 3, data: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]) },
    uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]) },
    index: { data: new Uint16Array([0, 2, 1, 1, 2, 3]) },
  };
  let name, attribute;
  for ([name, attribute] of Object.entries(attributes)) {
    attribute.count = attribute.data.length / (attribute.size || 1);
    attribute.indexFormat = 'uint16';
    attribute.buffer = device.createBuffer({
      size: attribute.data.byteLength,
      usage: name === 'index' ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
  }
  return { device, attributes, drawRange: { start: 0, count: attributes.index.count } };
}
