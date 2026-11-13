/**
 * Walk the scene depth-first; a truthy callback result skips that node's descendants.
 *
 * @param {Object} node Root node to visit.
 * @param {Function} callback Called with each node and the supplied context.
 * @param {*} context Context passed to the callback.
 */
export function traverse(node, callback, context) {
  if (callback(node, context)) return;
  let child;
  for (child of node.children) traverse(child, callback, context);
}
