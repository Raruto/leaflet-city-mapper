import { destroyTrafficGpu } from './destroyTrafficGpu.js';
import { trafficStorage } from './trafficStorage.js';

export function rebaseTraffic(state) {
  const { device } = state.layer.renderer;
  if (state.gpu?.device !== device) {
    destroyTrafficGpu(state);
    state.gpu = {
      device,
      pipeline: device.createComputePipeline({ layout: 'auto', compute: { module: device.createShaderModule({ code: state.shader }), entryPoint: 'main' } }),
      params: device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
      template: trafficStorage(device, new Float32Array([...state.template.position, ...state.template.normal])),
    };
    state.lanesDirty = true;
  }
  if (state.lanesDirty) {
    let count = 0;
    for (const lane of state.lanes) count += lane.points.length;
    const data = new Float32Array(count * 4);
    let offset = 0;
    for (const lane of state.lanes) {
      lane.start = offset / 4;
      for (let i = 0; i < lane.points.length; i++) {
        const point = lane.points[i];
        data[offset++] = point[0];
        data[offset++] = point[1];
        data[offset++] = point[2];
        data[offset++] = lane.lengths[i];
      }
    }
    state.gpu.points?.destroy();
    state.gpu.points = trafficStorage(device, data);
    state.lanesDirty = false;
  }
  const data = new Float32Array(state.trips.length * 4), index = new Uint32Array(data.buffer);
  for (let i = 0; i < state.trips.length; i++) {
    const trip = state.trips[i];
    index[i * 4] = trip.lane.start;
    index[i * 4 + 1] = trip.lane.points.length;
    data[i * 4 + 2] = trip.distance;
    data[i * 4 + 3] = trip.speed;
    state.mesh.extras.featureFaces[i].properties = trip.properties;
  }
  if (state.gpu.vehicles?.size >= data.byteLength) device.queue.writeBuffer(state.gpu.vehicles, 0, data);
  else {
    state.gpu.vehicles?.destroy();
    state.gpu.vehicles = trafficStorage(device, data);
  }
  const { position, normal } = state.mesh.geometry.attributes;
  const buffers = [state.gpu.params, state.gpu.template, state.gpu.points, state.gpu.vehicles, position.buffer, normal.buffer];
  const entries = [];
  for (let binding = 0; binding < buffers.length; binding++) entries.push({ binding, resource: { buffer: buffers[binding] } });
  state.gpu.bindGroup = device.createBindGroup({
    layout: state.gpu.pipeline.getBindGroupLayout(0),
    entries,
  });
}
