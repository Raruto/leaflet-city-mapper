import { modelNode } from './modelNode.js';
import { releaseModelResources } from './releaseModelResources.js';

/**
 * Build scene roots, releasing allocated resources if node construction fails.
 *
 * @param {Object} context Model construction context.
 * @param {Object} scene glTF scene containing root node indices.
 *
 * @returns {Array<Object>} Built root nodes.
 *
 * @throws {Error} If building a node fails.
 */
export function buildModelNodes(context, scene) {
  const nodes = /* alloc */ [];
  let index;
  try {
    for (index of scene.nodes) nodes.push(modelNode(context, index));
  } catch (error) {
    releaseModelResources(context);
    throw error;
  }
  return nodes;
}
