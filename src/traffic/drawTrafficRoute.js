import { trafficRouteMaterial } from '../globals/trafficRouteMaterial.js';
import { routeGeometry } from '../geometry/routeGeometry.js';
import { createTrafficMesh } from './createTrafficMesh.js';


export function drawTrafficRoute(state) {
  state.route = createTrafficMesh(state, routeGeometry(state.lanes),
    /* alloc */ [], trafficRouteMaterial);
}
