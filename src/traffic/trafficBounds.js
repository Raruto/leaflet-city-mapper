import { computeBounds } from '../geometry/computeBounds.js';

export function trafficBounds(state) {
  let radius = 20, height = 5;
  let i, lane, x, z, y;
  for (i = 0; i < state.template.position.length; i += 3) {
    radius = Math.max(radius, Math.hypot(state.template.position[i], state.template.position[i + 2]) + Math.abs(state.side));
    height = Math.max(height, state.template.position[i + 1]);
  }
  const data = /* allocation: required -- Bounds calculation may reenter through geometry accessors and needs an independent lane extent. */ [];
  for (lane of state.lanes) {
    for ([x, z, y] of lane.points) data.push(x - radius, y, z - radius, x + radius, y + height, z + radius);
  }
  const extent = /* allocation: required -- ComputeBounds attaches the new independent bounds to this calculation context. */ {
    attributes: /* allocation: required -- Geometry accessors retain their own bound-calculation attribute map. */ {
      position: /* allocation: required -- The bounds utility consumes the coordinates belonging to this calculation. */ { data },
    },
  };
  computeBounds(extent);
  state.mesh.geometry.bounds = extent.bounds;
}
