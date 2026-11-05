import { build } from '../../geometry/build.js';
import { createTrafficMesh } from './createTrafficMesh.js';
import { disposeTrafficObject } from './disposeTrafficObject.js';
import { trafficBounds } from '../routes/trafficBounds.js';

export function rebuildTrafficMesh(state) {
  const { trips, model, vertices } = state;
  disposeTrafficObject(state, state.mesh);
  state.mesh = null;
  if (!trips.length) return;
  const color = [], featureFaces = [];
  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    for (const component of build(model(i, trip.properties)).color) color.push(component);
    featureFaces.push({
      id: trip.id, properties: trip.properties, faceStart: i * vertices / 3, faceEnd: (i + 1) * vertices / 3,
      vertexStart: i * vertices, vertexEnd: (i + 1) * vertices
    });
  }
  const count = color.length / 3;
  state.mesh = createTrafficMesh(state, {
    position: new Array(color.length).fill(0), normal: new Array(color.length).fill(0), color,
  }, featureFaces, {}, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
  state.mesh.geometry.drawRange.count = count;
  state.mesh.extras.dynamicLights = true;
  trafficBounds(state);
}
