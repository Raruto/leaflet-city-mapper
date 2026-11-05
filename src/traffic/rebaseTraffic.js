import { sceneByLayer } from '../globals/sceneByLayer.js';


import { destroyTrafficGpu } from './destroyTrafficGpu.js';
import { trafficStorage } from './trafficStorage.js';

export function rebaseTraffic(state) {
  const { device } = sceneByLayer.get(state.layer).renderer;
  if (state.gpu?.device !== device) {
    destroyTrafficGpu(state);
    const template = /* allocation: required -- Device restoration uploads independent retained CPU template bytes. */ new Float32Array(
      state.template.position.length + state.template.normal.length);
    template.set(state.template.position);
    template.set(state.template.normal, state.template.position.length);
    state.gpu = /* allocation: required -- Each traffic source owns its device-specific compute resources. */ {
      device,
      pipeline: device.createComputePipeline(/* allocation: required -- Device implementations may retain this pipeline descriptor. */ {
        layout: 'auto', compute: /* allocation: required -- Compute stage configuration belongs to this pipeline. */ {
          module: device.createShaderModule(/* allocation: required -- This shader module retains this simulation's compute source. */ { code: state.shader }), entryPoint: 'main',
        },
      }),
      params: device.createBuffer(/* allocation: required -- This parameter buffer owns its native allocation descriptor. */ { size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
      template: trafficStorage(device, template),
    };
    state.lanesDirty = true;
  }
  let lane, i, point, trip, binding;
  if (state.lanesDirty) {
    let count = 0;
    for (lane of state.lanes) count += lane.points.length;
    const data = /* allocation: required -- Replacement lane GPU data must not alias earlier uploads. */ new Float32Array(count * 4);
    let offset = 0;
    for (lane of state.lanes) {
      lane.start = offset / 4;
      for (i = 0; i < lane.points.length; i++) {
        point = lane.points[i];
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
  const data = /* allocation: required -- The uploaded active-trip snapshot is independent of later simulation updates. */ new Float32Array(state.trips.length * 4);
  const index = /* allocation: required -- This trip snapshot needs an integer view for lane indexing. */ new Uint32Array(data.buffer);
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
  const entries = /* allocation: required -- This bind group retains its resource descriptors for the current mesh and simulation. */ [];
  let buffer;
  for (binding = 0; binding < 6; binding++) {
    buffer = binding === 0 ? state.gpu.params : binding === 1 ? state.gpu.template
      : binding === 2 ? state.gpu.points : binding === 3 ? state.gpu.vehicles
        : binding === 4 ? position.buffer : normal.buffer;
    entries.push(/* allocation: required -- Each compute binding retains an independent binding number and resource. */ {
      binding, resource: /* allocation: required -- Each binding retains the GPU buffer belonging to its slot. */ { buffer },
    });
  }
  state.gpu.bindGroup = device.createBindGroup(/* allocation: required -- Native and fallback devices can retain this bind-group descriptor. */ {
    layout: state.gpu.pipeline.getBindGroupLayout(0),
    entries,
  });
}
