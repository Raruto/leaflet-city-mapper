/**
 * Create and initialize a GPU storage buffer with at least 16 bytes.
 *
 * @param {GPUDevice} device Device creating the buffer.
 * @param {TypedArray} data Buffer contents.
 *
 * @returns {GPUBuffer} The initialized storage buffer.
 */
export function trafficStorage(device, data) {
  const buffer = device.createBuffer(/* alloc */ { size: Math.max(16, data.byteLength), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}
