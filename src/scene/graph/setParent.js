/** Reparent/detach scene data without drawing or disposing GPU resources. */

export function setParent(node, parent) {
  if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
  node.parent = parent;
  if (parent) parent.children.push(node);
}
