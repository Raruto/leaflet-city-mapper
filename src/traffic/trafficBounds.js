import { computeBounds } from '../geometry/computeBounds.js';

export function trafficBounds(state) {
  let radius = 20, height = 5;
  for (let i = 0; i < state.template.position.length; i += 3) {
    radius = Math.max(radius, Math.hypot(state.template.position[i], state.template.position[i + 2]) + Math.abs(state.side));
    height = Math.max(height, state.template.position[i + 1]);
  }
  const data = [];
  for (const lane of state.lanes) {
    for (const [x, z, y] of lane.points) data.push(x - radius, y, z - radius, x + radius, y + height, z + radius);
  }
  const extent = { attributes: { position: { data } } };
  computeBounds(extent);
  state.mesh.geometry.bounds = extent.bounds;
}
