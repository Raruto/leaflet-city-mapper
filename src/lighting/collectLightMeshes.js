import { geometryEmpty } from '../globals/geometryEmpty.js';

/**
 * Collect visible nodes with lights into fixed and moving mesh lists.
 *
 * @param {Object} node Scene node to visit.
 * @param {Object[]} fixed Output list for fixed lights.
 * @param {Object[]} moving Output list for dynamic lights.
 */
export function collectLightMeshes(node, fixed, moving) {
  if (!node.visible) return;
  if (node.extras?.lights) (node.extras.dynamicLights ? moving : fixed).push(node);
  let child;
  for (child of node.children || geometryEmpty) collectLightMeshes(child, fixed, moving);
}
