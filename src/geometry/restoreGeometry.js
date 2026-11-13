/**
 * Recreate geometry buffers on a device from retained CPU attributes.
 *
 * @param {Object} geometry Geometry and attribute data to restore.
 * @param {GPUDevice} device Device receiving the buffers.
 */
export function restoreGeometry(geometry, device) {
  if (geometry.attributes.index?.data instanceof Uint8Array) {
    geometry.attributes.index.data = /* alloc */ new Uint16Array(geometry.attributes.index.data);
  }
  let name, attribute, oldBuffer;
  for (name in geometry.attributes) {
    attribute = geometry.attributes[name];
    attribute.size ||= 1;
    attribute.count = attribute.data.length / attribute.size;
    attribute.indexFormat = attribute.data instanceof Uint32Array ? 'uint32' : 'uint16';
    oldBuffer = attribute.buffer;
    attribute.buffer = device.createBuffer(/* alloc */ {
      size: Math.max(4, attribute.data.byteLength),
      usage: name === 'index'
        ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    oldBuffer?.destroy();
  }
  geometry.device = device;
  geometry.drawRange.count = geometry.attributes.index?.count || geometry.attributes.position.count;
}
