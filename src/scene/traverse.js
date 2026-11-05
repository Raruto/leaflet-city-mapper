/** Depth-first walk; a truthy callback result skips that node's descendants. */

export function traverse(node, callback, context) {
  if (callback(node, context)) return;
  let child;
  for (child of node.children) traverse(child, callback, context);
}
