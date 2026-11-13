import * as createMeshApi from '../rendering/createMesh.js';

/**
 * Create a traffic mesh and attach its feature ranges for picking.
 *
 * @param {Object} state Traffic layer state.
 * @param {Object} data Mesh geometry data.
 * @param {Array} featureFaces Face ranges for picking.
 * @param {Object} material Mesh material options.
 * @param {number} [usage=0] Additional GPU buffer usage flags.
 *
 * @returns {Object} The created mesh.
 */
export function createTrafficMesh(state, data, featureFaces, material, usage = 0) {
  const result = createMeshApi.createMesh(state.layer, data, material, usage);
  result.extras.featureFaces = featureFaces;
  return result;
}
