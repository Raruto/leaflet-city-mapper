/**
 * Dispatch the GPU traffic pose computation for the elapsed time and mark CPU geometry stale.
 *
 * @param {Object} state Traffic layer state.
 * @param {number} seconds Seconds elapsed since the trip positions were rebased.
 */
export function moveTraffic(state, seconds) {
  const { device } = state.gpu;
  state.paramFloats[0] = state.elapsed = seconds;
  state.paramFloats[1] = state.side;
  state.paramInts[2] = state.vertices;
  state.paramInts[3] = state.trips.length * state.vertices;
  device.queue.writeBuffer(state.gpu.params, 0, state.params);
  const encoder = device.createCommandEncoder(), pass = encoder.beginComputePass();
  pass.setPipeline(state.gpu.pipeline);
  pass.setBindGroup(0, state.gpu.bindGroup);
  pass.dispatchWorkgroups(state.trips.length);
  pass.end();
  device.queue.submit(/* alloc */ [encoder.finish()]);
  state.stale = true;
}
