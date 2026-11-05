import * as createMeshApi from '../rendering/createMesh.js';

export function createTrafficMesh(state, data, featureFaces, material, usage = 0) {
  const result = createMeshApi.createMesh(state.layer, data, material, usage);
  result.extras.featureFaces = featureFaces;
  return result;
}
