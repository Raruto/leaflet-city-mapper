export function collectLightMeshes(node, fixed, moving) {
  if (!node.visible) return;
  if (node.extras?.lights) (node.extras.dynamicLights ? moving : fixed).push(node);
  let child;
  for (child of node.children || []) collectLightMeshes(child, fixed, moving);
}
