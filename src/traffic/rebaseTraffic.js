import { rendererByLayer } from '../weakmaps/rendererByLayer.js';



import { destroyTrafficGpu } from './destroyTrafficGpu.js';
import { trafficStorage } from './trafficStorage.js';
import { uploadTrafficLanes } from './uploadTrafficLanes.js';

export function rebaseTraffic(state) {
  const { device } = rendererByLayer.get(state.layer);
  if (state.gpu?.device !== device) {
    destroyTrafficGpu(state);
    const template = /* alloc */ new Float32Array(
      state.template.position.length + state.template.normal.length);
    template.set(state.template.position);
    template.set(state.template.normal, state.template.position.length);
    state.gpu = /* alloc */ {
      device,
      pipeline: device.createComputePipeline(/* alloc */ {
        layout: 'auto', compute: /* alloc */ {
          module: device.createShaderModule(/* alloc */ { code: state.shader }), entryPoint: 'main',
        },
      }),
      params: device.createBuffer(/* alloc */ { size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
      template: trafficStorage(device, template),
    };
    state.lanesDirty = true;
  }
  let i, trip, binding;
  if (state.lanesDirty) uploadTrafficLanes(state, device);
  const data = /* alloc */ new Float32Array(state.trips.length * 4);
  const index = /* alloc */ new Uint32Array(data.buffer);
  for (i = 0; i < state.trips.length; i++) {
    trip = state.trips[i];
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
  const entries = /* alloc */ [];
  let buffer;
  for (binding = 0; binding < 6; binding++) {
    buffer = binding === 0 ? state.gpu.params : binding === 1 ? state.gpu.template
      : binding === 2 ? state.gpu.points : binding === 3 ? state.gpu.vehicles
        : binding === 4 ? position.buffer : normal.buffer;
    entries.push(/* alloc */ {
      binding, resource: /* alloc */ { buffer },
    });
  }
  state.gpu.bindGroup = device.createBindGroup(/* alloc */ {
    layout: state.gpu.pipeline.getBindGroupLayout(0),
    entries,
  });
}
