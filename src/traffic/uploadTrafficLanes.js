import { trafficStorage } from './trafficStorage.js';

/**
 * Pack lane coordinates, elevations and cumulative distances into the GPU points buffer.
 *
 * @param {Object} state Traffic layer state.
 * @param {GPUDevice} device Device used to create the points buffer.
 */
export function uploadTrafficLanes(state, device) {
  let lane, i, point, count = 0;
  for (lane of state.lanes) count += lane.points.length;
  const data = /* alloc */ new Float32Array(count * 4);
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
