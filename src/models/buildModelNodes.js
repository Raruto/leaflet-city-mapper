import { modelNode } from './modelNode.js';
import { releaseModelResources } from './releaseModelResources.js';

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
