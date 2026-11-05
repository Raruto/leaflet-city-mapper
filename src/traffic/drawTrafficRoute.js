import { routeGeometry } from './routeGeometry.js';
import { createTrafficMesh } from './createTrafficMesh.js';
import { state as sharedState } from '../state.js';

export function drawTrafficRoute(state) {
  state.route = createTrafficMesh(state, routeGeometry(state.lanes),
    /* allocation: required -- Route meshes retain an independently mutable feature-face list. */ [], sharedState.allocationTrafficRouteMaterial);
}
