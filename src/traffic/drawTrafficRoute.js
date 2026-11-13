import { trafficRouteMaterial } from '../globals/trafficRouteMaterial.js';
import { routeGeometry } from '../geometry/routeGeometry.js';
import { createTrafficMesh } from './createTrafficMesh.js';

/**
 * Create the optional route outline mesh from the current traffic lanes.
 *
 * @param {Object} state Traffic layer state.
 */
export function drawTrafficRoute(state) {
  state.route = createTrafficMesh(state, routeGeometry(state.lanes),
    /* alloc */ [], trafficRouteMaterial);
}
