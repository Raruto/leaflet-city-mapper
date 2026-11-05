import { trafficRouteMaterial } from '../globals/trafficRouteMaterial.js';
import { routeGeometry } from './routeGeometry.js';
import { createTrafficMesh } from './createTrafficMesh.js';


export function drawTrafficRoute(state) {
  state.route = createTrafficMesh(state, routeGeometry(state.lanes),
    /* allocation: required -- Route meshes retain an independently mutable feature-face list. */ [], trafficRouteMaterial);
}
