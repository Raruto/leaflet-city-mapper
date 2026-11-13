import { computeBounds } from '../geometry/computeBounds.js';

/**
 * Compute conservative traffic mesh bounds from lane points, vehicle dimensions and lateral offset.
 *
 * @param {Object} state Traffic layer state.
 */
export function trafficBounds(state) {
  let radius = 20, height = 5;
  let i, lane, x, z, y;
  for (i = 0; i < state.template.position.length; i += 3) {
    radius = Math.max(radius, Math.hypot(state.template.position[i], state.template.position[i + 2]) + Math.abs(state.side));
    height = Math.max(height, state.template.position[i + 1]);
  }
  const data = /* alloc */ [];
  for (lane of state.lanes) {
    for ([x, z, y] of lane.points) data.push(x - radius, y, z - radius, x + radius, y + height, z + radius);
  }
  const extent = /* alloc */ {
    attributes: /* alloc */ {
      position: /* alloc */ { data },
    },
  };
  computeBounds(extent);
  state.mesh.geometry.bounds = extent.bounds;
}
