export function trafficStorage(device, data) {
  const buffer = device.createBuffer(/* allocation: required -- The device may retain this storage buffer's descriptor independently. */ { size: Math.max(16, data.byteLength), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}
