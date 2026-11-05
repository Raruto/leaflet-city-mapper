import { routeGeometry } from './routeGeometry.js';
import { createTrafficMesh } from '../rendering/createTrafficMesh.js';

export function drawTrafficRoute(state) {
  state.route = createTrafficMesh(state, routeGeometry(state.lanes), [], { unlit: true });
}
